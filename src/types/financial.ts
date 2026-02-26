/** Financial domain types */

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'not_found';
export type DataSource = 'xbrl' | 'ai_extracted' | 'calculated';

export type FinancialCategory =
  | 'income_statement'
  | 'balance_sheet'
  | 'cash_flow'
  | 'dividends'
  | 'calculated_metrics';

export type MetricUnit = 'USD' | 'USD/share' | 'shares' | 'ratio' | 'percent';

export interface ExtractedMetric {
  conceptId: string;
  label: string;
  category: FinancialCategory;
  value: number | null;
  unit: MetricUnit;
  period: string;
  filingDate: string;
  form: string;
  source: DataSource;
  confidence: ConfidenceLevel;
  xbrlTag?: string;
  accessionNumber?: string;
}

export interface PeriodData {
  period: string;
  filingDate: string;
  form: string;
  metrics: Map<string, ExtractedMetric>;
}

export interface CompanyExtractionResult {
  ticker: string;
  companyName: string;
  cik: number;
  periods: PeriodData[];
  errors: string[];
}
