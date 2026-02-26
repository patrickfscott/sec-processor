/**
 * Utilities for parsing and working with fiscal periods.
 */

export interface ParsedPeriod {
  year: number;
  quarter: number | null; // null for annual (FY)
  label: string; // e.g. "Q3 2024" or "FY 2024"
}

/** Parse an fp (fiscal period) string like "Q1", "Q2", "FY" with a fiscal year */
export function parseFiscalPeriod(fp: string, fy: number): ParsedPeriod {
  if (fp === 'FY') {
    return { year: fy, quarter: null, label: `FY ${fy}` };
  }
  const match = fp.match(/Q(\d)/);
  const quarter = match ? parseInt(match[1]) : null;
  return {
    year: fy,
    quarter,
    label: quarter ? `Q${quarter} ${fy}` : `${fp} ${fy}`,
  };
}

/** Create a period label from fy and fp */
export function periodLabel(fp: string, fy: number): string {
  return parseFiscalPeriod(fp, fy).label;
}

/** Sort periods chronologically */
export function sortPeriods(periods: string[]): string[] {
  return [...periods].sort((a, b) => {
    const pa = parsePeriodLabel(a);
    const pb = parsePeriodLabel(b);
    if (pa.year !== pb.year) return pa.year - pb.year;
    // FY comes after all quarters
    const qa = pa.quarter ?? 5;
    const qb = pb.quarter ?? 5;
    return qa - qb;
  });
}

/** Parse a period label like "Q3 2024" or "FY 2024" back to components */
export function parsePeriodLabel(label: string): ParsedPeriod {
  const fyMatch = label.match(/^FY\s+(\d{4})$/);
  if (fyMatch) {
    return { year: parseInt(fyMatch[1]), quarter: null, label };
  }
  const qMatch = label.match(/^Q(\d)\s+(\d{4})$/);
  if (qMatch) {
    return { year: parseInt(qMatch[2]), quarter: parseInt(qMatch[1]), label };
  }
  return { year: 0, quarter: null, label };
}

/** Calculate how many days between two date strings */
export function daysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}

/** Check if a date range roughly corresponds to a single quarter (~80-100 days) */
export function isQuarterlyDuration(start: string, end: string): boolean {
  const days = daysBetween(start, end);
  return days >= 80 && days <= 100;
}

/** Check if a date range roughly corresponds to annual (~350-380 days) */
export function isAnnualDuration(start: string, end: string): boolean {
  const days = daysBetween(start, end);
  return days >= 350 && days <= 380;
}

/**
 * Generate the periods to request based on user selection.
 * Returns array of { fy, fp } targets.
 */
export function generateTargetPeriods(
  periodCount: number,
  includeAnnual: boolean,
): Array<{ fy: number; fp: string }> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Estimate current quarter
  const currentQuarter = Math.ceil(currentMonth / 3);

  const periods: Array<{ fy: number; fp: string }> = [];

  if (includeAnnual) {
    // Generate last N years
    for (let i = 0; i < periodCount; i++) {
      periods.push({ fy: currentYear - 1 - i, fp: 'FY' });
    }
  } else {
    // Generate last N quarters
    let year = currentYear;
    let q = currentQuarter - 1; // Start from last completed quarter
    if (q <= 0) {
      q = 4;
      year--;
    }

    for (let i = 0; i < periodCount; i++) {
      periods.push({ fy: year, fp: `Q${q}` });
      q--;
      if (q <= 0) {
        q = 4;
        year--;
      }
    }
  }

  return periods.reverse(); // Chronological order
}
