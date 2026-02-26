import type { FinancialCategory, MetricUnit } from '../types/financial';

export interface CalculatedMetricDef {
  id: string;
  label: string;
  category: FinancialCategory;
  unit: MetricUnit;
  /** Concept IDs needed to compute this metric */
  dependencies: string[];
  /** Compute the metric from dependency values (same order as dependencies) */
  compute: (values: (number | null)[]) => number | null;
}

export const CALCULATED_METRICS: CalculatedMetricDef[] = [
  {
    id: 'gross_margin',
    label: 'Gross Margin',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['gross_profit', 'revenue'],
    compute: ([gp, rev]) => (gp != null && rev != null && rev !== 0 ? gp / rev : null),
  },
  {
    id: 'operating_margin',
    label: 'Operating Margin',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['operating_income', 'revenue'],
    compute: ([oi, rev]) => (oi != null && rev != null && rev !== 0 ? oi / rev : null),
  },
  {
    id: 'net_margin',
    label: 'Net Margin',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['net_income', 'revenue'],
    compute: ([ni, rev]) => (ni != null && rev != null && rev !== 0 ? ni / rev : null),
  },
  {
    id: 'free_cash_flow',
    label: 'Free Cash Flow',
    category: 'calculated_metrics',
    unit: 'USD',
    dependencies: ['operating_cash_flow', 'capex'],
    compute: ([ocf, capex]) => {
      if (ocf == null) return null;
      // CapEx is typically reported as a negative or positive payment
      const capexAbs = capex != null ? Math.abs(capex) : 0;
      return ocf - capexAbs;
    },
  },
  {
    id: 'dividend_payout_ratio',
    label: 'Dividend Payout Ratio',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['dividends_paid', 'net_income'],
    compute: ([div, ni]) => {
      if (div == null || ni == null || ni === 0) return null;
      return Math.abs(div) / Math.abs(ni);
    },
  },
  {
    id: 'current_ratio',
    label: 'Current Ratio',
    category: 'calculated_metrics',
    unit: 'ratio',
    dependencies: ['current_assets', 'current_liabilities'],
    compute: ([ca, cl]) => (ca != null && cl != null && cl !== 0 ? ca / cl : null),
  },
  {
    id: 'debt_to_equity',
    label: 'Debt-to-Equity',
    category: 'calculated_metrics',
    unit: 'ratio',
    dependencies: ['total_liabilities', 'stockholders_equity'],
    compute: ([tl, se]) => (tl != null && se != null && se !== 0 ? tl / se : null),
  },
  {
    id: 'return_on_equity',
    label: 'Return on Equity',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['net_income', 'stockholders_equity'],
    compute: ([ni, se]) => (ni != null && se != null && se !== 0 ? ni / se : null),
  },
  {
    id: 'yoy_revenue_growth',
    label: 'YoY Revenue Growth',
    category: 'calculated_metrics',
    unit: 'percent',
    dependencies: ['revenue'],
    // This is a special case - needs prior year revenue, handled separately
    compute: ([rev]) => (rev != null ? rev : null),
  },
];
