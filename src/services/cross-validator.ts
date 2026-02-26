/**
 * Cross-validate extracted financial data for consistency.
 */
import type { PeriodData } from '../types/financial';

export interface ValidationIssue {
  period: string;
  type: 'balance_sheet_equation' | 'gross_profit_consistency' | 'xbrl_ai_mismatch';
  message: string;
  affectedConcepts: string[];
}

/**
 * Run all cross-validation checks on extracted data.
 */
export function crossValidate(periods: PeriodData[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const period of periods) {
    // Check: Assets = Liabilities + Equity
    const assets = period.metrics.get('total_assets')?.value;
    const liabilities = period.metrics.get('total_liabilities')?.value;
    const equity = period.metrics.get('stockholders_equity')?.value;

    if (assets != null && liabilities != null && equity != null) {
      const diff = Math.abs(assets - (liabilities + equity));
      const threshold = Math.abs(assets) * 0.01; // 1% tolerance
      if (diff > threshold) {
        issues.push({
          period: period.period,
          type: 'balance_sheet_equation',
          message: `Assets ($${assets.toLocaleString()}) ≠ Liabilities ($${liabilities.toLocaleString()}) + Equity ($${equity.toLocaleString()})`,
          affectedConcepts: ['total_assets', 'total_liabilities', 'stockholders_equity'],
        });
        // Downgrade confidence
        for (const id of ['total_assets', 'total_liabilities', 'stockholders_equity']) {
          const metric = period.metrics.get(id);
          if (metric && metric.confidence === 'high') {
            metric.confidence = 'medium';
          }
        }
      }
    }

    // Check: Gross Profit = Revenue - Cost of Revenue
    const revenue = period.metrics.get('revenue')?.value;
    const costOfRevenue = period.metrics.get('cost_of_revenue')?.value;
    const grossProfit = period.metrics.get('gross_profit')?.value;

    if (revenue != null && costOfRevenue != null && grossProfit != null) {
      const expected = revenue - costOfRevenue;
      const diff = Math.abs(grossProfit - expected);
      const threshold = Math.abs(revenue) * 0.01;
      if (diff > threshold) {
        issues.push({
          period: period.period,
          type: 'gross_profit_consistency',
          message: `Gross Profit ($${grossProfit.toLocaleString()}) ≠ Revenue - COGS ($${expected.toLocaleString()})`,
          affectedConcepts: ['gross_profit', 'revenue', 'cost_of_revenue'],
        });
      }
    }
  }

  return issues;
}
