/**
 * XBRL data extraction engine.
 *
 * Extracts financial metrics from CompanyFacts XBRL data by:
 * 1. Trying each alias tag in priority order
 * 2. Filtering by form type (10-Q/10-K), fiscal year, and fiscal period
 * 3. Preferring frame-tagged (SEC-normalized) entries
 * 4. Handling quarterly vs cumulative durations
 * 5. Deduplicating by most recently filed accession number
 */
import type { CompanyFactsResponse, XBRLUnit, XBRLConcept } from '../types/sec';
import type { ExtractedMetric, PeriodData } from '../types/financial';
import { XBRL_CONCEPTS, type XBRLConceptDef } from '../constants/xbrl-concepts';
import { periodLabel, isQuarterlyDuration } from '../utils/period-utils';

interface ExtractionTarget {
  fy: number;
  fp: string;
  forms: string[];
}

/**
 * Extract all financial metrics from CompanyFacts for the specified periods.
 */
export function extractMetrics(
  facts: CompanyFactsResponse,
  targets: ExtractionTarget[],
): PeriodData[] {
  const periodsMap = new Map<string, PeriodData>();

  // Initialize periods
  for (const target of targets) {
    const label = periodLabel(target.fp, target.fy);
    if (!periodsMap.has(label)) {
      periodsMap.set(label, {
        period: label,
        filingDate: '',
        form: target.forms[0] || '10-Q',
        metrics: new Map(),
      });
    }
  }

  // Extract each concept
  for (const conceptDef of XBRL_CONCEPTS) {
    for (const target of targets) {
      const label = periodLabel(target.fp, target.fy);
      const period = periodsMap.get(label)!;

      const metric = extractSingleMetric(facts, conceptDef, target);
      if (metric) {
        period.metrics.set(conceptDef.id, metric);
        // Update filing date from first successful extraction
        if (!period.filingDate && metric.filingDate) {
          period.filingDate = metric.filingDate;
        }
      } else {
        // Record as not found
        period.metrics.set(conceptDef.id, {
          conceptId: conceptDef.id,
          label: conceptDef.label,
          category: conceptDef.category,
          value: null,
          unit: conceptDef.unit,
          period: label,
          filingDate: '',
          form: target.forms[0] || '10-Q',
          source: 'xbrl',
          confidence: 'not_found',
        });
      }
    }
  }

  return Array.from(periodsMap.values());
}

/**
 * Extract a single metric by trying each alias tag.
 */
function extractSingleMetric(
  facts: CompanyFactsResponse,
  conceptDef: XBRLConceptDef,
  target: ExtractionTarget,
): ExtractedMetric | null {
  const taxonomies = conceptDef.taxonomy
    ? [conceptDef.taxonomy]
    : ['us-gaap', 'dei', 'ifrs-full'];

  for (const tag of conceptDef.tags) {
    for (const taxonomy of taxonomies) {
      const concept = facts.facts[taxonomy]?.[tag];
      if (!concept) continue;

      const result = extractFromConcept(concept, conceptDef, tag, target);
      if (result) return result;
    }
  }

  return null;
}

/**
 * Extract value from a specific XBRL concept for a target period.
 */
function extractFromConcept(
  concept: XBRLConcept,
  conceptDef: XBRLConceptDef,
  xbrlTag: string,
  target: ExtractionTarget,
): ExtractedMetric | null {
  // Try all unit types (USD, USD/shares, shares, pure, etc.)
  for (const [, units] of Object.entries(concept.units)) {
    const result = findBestMatch(units, conceptDef, xbrlTag, target);
    if (result) return result;
  }
  return null;
}

/**
 * Find the best matching XBRL unit entry for the target period.
 */
function findBestMatch(
  units: XBRLUnit[],
  conceptDef: XBRLConceptDef,
  xbrlTag: string,
  target: ExtractionTarget,
): ExtractedMetric | null {
  const { fy, fp, forms } = target;
  const label = periodLabel(fp, fy);

  // Strategy 1: Frame-tagged entries (preferred - SEC normalized)
  const frameMatch = findByFrame(units, conceptDef, fy, fp, forms);
  if (frameMatch) {
    return buildMetric(frameMatch, conceptDef, xbrlTag, label);
  }

  // Strategy 2: Direct fy/fp match
  const directMatch = findByFyFp(units, conceptDef, fy, fp, forms);
  if (directMatch) {
    return buildMetric(directMatch, conceptDef, xbrlTag, label);
  }

  // Strategy 3: For quarterly income/cash flow items, try YTD deduction
  if (!conceptDef.isInstant && fp !== 'FY' && fp.startsWith('Q')) {
    const deducted = tryYTDDeduction(units, conceptDef, xbrlTag, fy, fp, forms);
    if (deducted) return deducted;
  }

  return null;
}

/**
 * Find entry by frame tag (e.g., CY2024Q1 for duration, CY2024Q1I for instant).
 */
function findByFrame(
  units: XBRLUnit[],
  conceptDef: XBRLConceptDef,
  fy: number,
  fp: string,
  forms: string[],
): XBRLUnit | null {
  const qMatch = fp.match(/Q(\d)/);
  const quarter = qMatch ? parseInt(qMatch[1]) : null;

  let framePatterns: string[];
  if (fp === 'FY') {
    // Annual: CY2024 for duration, CY2024I for instant
    if (conceptDef.isInstant) {
      framePatterns = [`CY${fy}Q4I`, `CY${fy}I`];
    } else {
      framePatterns = [`CY${fy}`];
    }
  } else if (quarter) {
    if (conceptDef.isInstant) {
      framePatterns = [`CY${fy}Q${quarter}I`];
    } else {
      framePatterns = [`CY${fy}Q${quarter}`];
    }
  } else {
    return null;
  }

  for (const framePattern of framePatterns) {
    const matches = units.filter(
      (u) => u.frame === framePattern && forms.includes(u.form),
    );
    if (matches.length > 0) {
      return pickMostRecent(matches);
    }
    // Also try without form filter for frame matches
    const anyFormMatches = units.filter((u) => u.frame === framePattern);
    if (anyFormMatches.length > 0) {
      return pickMostRecent(anyFormMatches);
    }
  }

  return null;
}

/**
 * Find entry by fiscal year and period fields.
 */
function findByFyFp(
  units: XBRLUnit[],
  conceptDef: XBRLConceptDef,
  fy: number,
  fp: string,
  forms: string[],
): XBRLUnit | null {
  let matches = units.filter(
    (u) => u.fy === fy && u.fp === fp && forms.includes(u.form),
  );

  if (!conceptDef.isInstant && fp !== 'FY') {
    // For quarterly duration items, verify the period is approximately one quarter
    matches = matches.filter((u) => {
      if (!u.start || !u.end) return true;
      return isQuarterlyDuration(u.start, u.end);
    });
  }

  if (matches.length > 0) {
    return pickMostRecent(matches);
  }

  // Relax form filter
  matches = units.filter((u) => u.fy === fy && u.fp === fp);
  if (!conceptDef.isInstant && fp !== 'FY') {
    matches = matches.filter((u) => {
      if (!u.start || !u.end) return true;
      return isQuarterlyDuration(u.start, u.end);
    });
  }

  return matches.length > 0 ? pickMostRecent(matches) : null;
}

/**
 * For quarterly income/cash flow items, compute standalone quarter by YTD deduction.
 * Q2_standalone = Q2_YTD - Q1_YTD
 */
function tryYTDDeduction(
  units: XBRLUnit[],
  conceptDef: XBRLConceptDef,
  xbrlTag: string,
  fy: number,
  fp: string,
  forms: string[],
): ExtractedMetric | null {
  const qMatch = fp.match(/Q(\d)/);
  if (!qMatch) return null;
  const quarter = parseInt(qMatch[1]);
  if (quarter === 1) return null; // Q1 YTD = Q1 standalone

  // Find YTD value for this quarter (duration from beginning of fiscal year)
  const currentYTD = findYTDEntry(units, fy, quarter, forms);
  if (!currentYTD) return null;

  // Find YTD value for previous quarter
  const prevYTD = findYTDEntry(units, fy, quarter - 1, forms);
  if (!prevYTD) return null;

  const standaloneValue = currentYTD.val - prevYTD.val;
  const label = periodLabel(fp, fy);

  return {
    conceptId: conceptDef.id,
    label: conceptDef.label,
    category: conceptDef.category,
    value: standaloneValue,
    unit: conceptDef.unit,
    period: label,
    filingDate: currentYTD.filed,
    form: currentYTD.form,
    source: 'xbrl',
    confidence: 'medium', // YTD deduction is less certain
    xbrlTag,
    accessionNumber: currentYTD.accn,
  };
}

/**
 * Find a YTD entry for a given quarter (cumulative from start of fiscal year).
 */
function findYTDEntry(
  units: XBRLUnit[],
  fy: number,
  quarterEnd: number,
  forms: string[],
): XBRLUnit | null {
  // YTD entries have fy matching but fp of the quarter, with longer duration
  const matches = units.filter((u) => {
    if (u.fy !== fy) return false;
    if (!forms.includes(u.form) && forms.length > 0) return false;
    if (!u.start || !u.end) return false;

    // Check if duration spans from fiscal year start to end of target quarter
    const days = Math.round(
      (new Date(u.end).getTime() - new Date(u.start).getTime()) / (1000 * 60 * 60 * 24),
    );

    // Approximate: Q1 YTD ~ 90 days, Q2 YTD ~ 180 days, Q3 YTD ~ 270 days
    const expectedDays = quarterEnd * 91;
    return Math.abs(days - expectedDays) < 30;
  });

  return matches.length > 0 ? pickMostRecent(matches) : null;
}

/** Pick the most recently filed entry from candidates */
function pickMostRecent(units: XBRLUnit[]): XBRLUnit {
  return units.reduce((best, current) =>
    current.filed > best.filed ? current : best,
  );
}

/** Build an ExtractedMetric from an XBRL unit entry */
function buildMetric(
  unit: XBRLUnit,
  conceptDef: XBRLConceptDef,
  xbrlTag: string,
  periodStr: string,
): ExtractedMetric {
  return {
    conceptId: conceptDef.id,
    label: conceptDef.label,
    category: conceptDef.category,
    value: unit.val,
    unit: conceptDef.unit,
    period: periodStr,
    filingDate: unit.filed,
    form: unit.form,
    source: 'xbrl',
    confidence: 'high',
    xbrlTag,
    accessionNumber: unit.accn,
  };
}
