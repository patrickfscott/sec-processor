/**
 * XLSX export using SheetJS.
 * Creates one sheet per company + a comparison summary sheet.
 */
import * as XLSX from 'xlsx';
import type { CompanyExtractionResult } from '../types/financial';
import { XBRL_CONCEPTS } from '../constants/xbrl-concepts';
import { CALCULATED_METRICS } from '../constants/calculated-metrics';
import { formatMetricValue } from '../utils/format';
import { sortPeriods } from '../utils/period-utils';

/**
 * Export extraction results to XLSX and trigger download.
 */
export function exportToXLSX(results: Map<string, CompanyExtractionResult>): void {
  const wb = XLSX.utils.book_new();

  const companies = Array.from(results.values());

  // Create one sheet per company
  for (const company of companies) {
    const ws = createCompanySheet(company);
    const sheetName = company.ticker.slice(0, 31); // Excel sheet name limit
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  // Create comparison sheet if multiple companies
  if (companies.length > 1) {
    const ws = createComparisonSheet(companies);
    XLSX.utils.book_append_sheet(wb, ws, 'Comparison');
  }

  // Download
  const filename = companies.length === 1
    ? `${companies[0].ticker}_financials.xlsx`
    : `sec_financials_${companies.map((c) => c.ticker).join('_')}.xlsx`;

  XLSX.writeFile(wb, filename);
}

/**
 * Create a worksheet for a single company.
 */
function createCompanySheet(company: CompanyExtractionResult): XLSX.WorkSheet {
  const periods = sortPeriods(company.periods.map((p) => p.period));
  const allConcepts = [...XBRL_CONCEPTS, ...CALCULATED_METRICS.map((m) => ({
    id: m.id,
    label: m.label,
    category: m.category,
    unit: m.unit,
  }))];

  // Build rows
  const rows: (string | number | null)[][] = [];

  // Header row: metadata
  rows.push([`${company.companyName} (${company.ticker})`, `CIK: ${company.cik}`]);
  rows.push([]); // blank

  // Column headers
  rows.push(['Metric', ...periods, 'Source']);

  // Group concepts by category
  const categories = [
    { key: 'income_statement', label: 'INCOME STATEMENT' },
    { key: 'balance_sheet', label: 'BALANCE SHEET' },
    { key: 'cash_flow', label: 'CASH FLOW STATEMENT' },
    { key: 'dividends', label: 'DIVIDENDS & SHAREHOLDER RETURNS' },
    { key: 'calculated_metrics', label: 'CALCULATED METRICS' },
  ];

  for (const cat of categories) {
    rows.push([]); // blank
    rows.push([cat.label]);

    const concepts = allConcepts.filter((c) => c.category === cat.key);

    for (const concept of concepts) {
      const row: (string | number | null)[] = [concept.label];

      let source = '';
      for (const periodLabel of periods) {
        const periodData = company.periods.find((p) => p.period === periodLabel);
        const metric = periodData?.metrics.get(concept.id);
        if (metric?.value !== null && metric?.value !== undefined) {
          row.push(metric.value);
          if (!source) source = metric.source;
        } else {
          row.push(null);
        }
      }
      row.push(source || 'N/A');
      rows.push(row);
    }
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 35 }, // Metric label
    ...periods.map(() => ({ wch: 18 })),
    { wch: 12 }, // Source
  ];

  return ws;
}

/**
 * Create a comparison sheet for key metrics across companies.
 */
function createComparisonSheet(companies: CompanyExtractionResult[]): XLSX.WorkSheet {
  const keyMetrics = [
    'revenue', 'net_income', 'eps_diluted', 'operating_cash_flow',
    'total_assets', 'stockholders_equity', 'gross_margin',
    'operating_margin', 'net_margin', 'free_cash_flow',
    'current_ratio', 'debt_to_equity', 'return_on_equity',
  ];

  // Use the most recent period from the first company
  const recentPeriod = companies[0]?.periods[companies[0].periods.length - 1]?.period;
  if (!recentPeriod) {
    return XLSX.utils.aoa_to_sheet([['No data available']]);
  }

  const rows: (string | number | null)[][] = [];
  rows.push(['Metric Comparison', `Period: ${recentPeriod}`]);
  rows.push([]);
  rows.push(['Metric', ...companies.map((c) => `${c.ticker}`)]);

  const allConcepts = [...XBRL_CONCEPTS, ...CALCULATED_METRICS.map((m) => ({
    id: m.id,
    label: m.label,
    category: m.category,
    unit: m.unit,
  }))];

  for (const metricId of keyMetrics) {
    const concept = allConcepts.find((c) => c.id === metricId);
    if (!concept) continue;

    const row: (string | number | null)[] = [concept.label];
    for (const company of companies) {
      const periodData = company.periods.find((p) => p.period === recentPeriod);
      const metric = periodData?.metrics.get(metricId);
      if (metric?.value !== null && metric?.value !== undefined) {
        row.push(metric.value);
      } else {
        row.push(null);
      }
    }
    rows.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 30 },
    ...companies.map(() => ({ wch: 18 })),
  ];

  return ws;
}
