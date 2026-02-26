/**
 * Calculate derived financial metrics from extracted data.
 */
import type { ExtractedMetric, PeriodData } from '../types/financial';
import { CALCULATED_METRICS } from '../constants/calculated-metrics';
import { parsePeriodLabel } from '../utils/period-utils';

/**
 * Compute all calculated metrics for each period.
 * Adds them to the existing period metrics maps.
 */
export function computeCalculatedMetrics(periods: PeriodData[]): void {
  for (const period of periods) {
    for (const metricDef of CALCULATED_METRICS) {
      // Skip YoY growth - handled separately
      if (metricDef.id === 'yoy_revenue_growth') continue;

      const depValues = metricDef.dependencies.map(
        (depId) => period.metrics.get(depId)?.value ?? null,
      );

      const value = metricDef.compute(depValues);

      period.metrics.set(metricDef.id, {
        conceptId: metricDef.id,
        label: metricDef.label,
        category: 'calculated_metrics',
        value,
        unit: metricDef.unit,
        period: period.period,
        filingDate: period.filingDate,
        form: period.form,
        source: 'calculated',
        confidence: value !== null ? 'high' : 'not_found',
      });
    }
  }

  // Compute YoY Revenue Growth across periods
  computeYoYGrowth(periods);
}

/**
 * Compute year-over-year revenue growth.
 */
function computeYoYGrowth(periods: PeriodData[]): void {
  for (const period of periods) {
    const parsed = parsePeriodLabel(period.period);
    // Find the same period from last year
    const priorYearLabel = parsed.quarter
      ? `Q${parsed.quarter} ${parsed.year - 1}`
      : `FY ${parsed.year - 1}`;

    const currentRev = period.metrics.get('revenue')?.value ?? null;
    const priorPeriod = periods.find((p) => p.period === priorYearLabel);
    const priorRev = priorPeriod?.metrics.get('revenue')?.value ?? null;

    let growth: number | null = null;
    if (currentRev !== null && priorRev !== null && priorRev !== 0) {
      growth = (currentRev - priorRev) / Math.abs(priorRev);
    }

    const metric: ExtractedMetric = {
      conceptId: 'yoy_revenue_growth',
      label: 'YoY Revenue Growth',
      category: 'calculated_metrics',
      value: growth,
      unit: 'percent',
      period: period.period,
      filingDate: period.filingDate,
      form: period.form,
      source: 'calculated',
      confidence: growth !== null ? 'high' : 'not_found',
    };

    period.metrics.set('yoy_revenue_growth', metric);
  }
}
