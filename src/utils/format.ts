import type { MetricUnit } from '../types/financial';

/**
 * Format a number based on its unit type for display.
 */
export function formatMetricValue(value: number | null, unit: MetricUnit): string {
  if (value === null || value === undefined) return 'N/A';

  switch (unit) {
    case 'USD':
      return formatCurrency(value);
    case 'USD/share':
      return formatPerShare(value);
    case 'shares':
      return formatShares(value);
    case 'ratio':
      return formatRatio(value);
    case 'percent':
      return formatPercent(value);
    default:
      return value.toLocaleString();
  }
}

/** Format large USD values with appropriate scale (K, M, B) */
export function formatCurrency(value: number): string {
  const abs = Math.abs(value);
  const negative = value < 0;
  let formatted: string;

  if (abs >= 1e12) {
    formatted = `$${(abs / 1e12).toFixed(2)}T`;
  } else if (abs >= 1e9) {
    formatted = `$${(abs / 1e9).toFixed(2)}B`;
  } else if (abs >= 1e6) {
    formatted = `$${(abs / 1e6).toFixed(2)}M`;
  } else if (abs >= 1e3) {
    formatted = `$${(abs / 1e3).toFixed(1)}K`;
  } else {
    formatted = `$${abs.toFixed(2)}`;
  }

  return negative ? `(${formatted})` : formatted;
}

/** Format per-share values */
export function formatPerShare(value: number): string {
  const negative = value < 0;
  const formatted = `$${Math.abs(value).toFixed(2)}`;
  return negative ? `(${formatted})` : formatted;
}

/** Format share counts */
export function formatShares(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(abs / 1e3).toFixed(1)}K`;
  return abs.toLocaleString();
}

/** Format as ratio (2 decimal places) */
export function formatRatio(value: number): string {
  const negative = value < 0;
  const formatted = Math.abs(value).toFixed(2);
  return negative ? `(${formatted})` : formatted;
}

/** Format as percentage */
export function formatPercent(value: number): string {
  const negative = value < 0;
  const formatted = `${(Math.abs(value) * 100).toFixed(1)}%`;
  return negative ? `(${formatted})` : formatted;
}

/** Get CSS class for negative values */
export function getValueClass(value: number | null): string {
  if (value === null) return 'text-terminal-muted';
  return value < 0 ? 'negative' : '';
}
