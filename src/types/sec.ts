/** SEC EDGAR API response types */

export interface CompanyTickerEntry {
  cik_str: number;
  ticker: string;
  title: string;
}

/** Response from /files/company_tickers.json */
export type CompanyTickersResponse = Record<string, CompanyTickerEntry>;

/** A single XBRL fact unit entry */
export interface XBRLUnit {
  start?: string;
  end?: string;
  val: number;
  accn: string;
  fy: number;
  fp: string;
  form: string;
  filed: string;
  frame?: string;
}

/** A concept within CompanyFacts */
export interface XBRLConcept {
  label: string;
  description: string;
  units: Record<string, XBRLUnit[]>;
}

/** Response from /api/xbrl/companyfacts/CIK{padded}.json */
export interface CompanyFactsResponse {
  cik: number;
  entityName: string;
  facts: {
    'us-gaap'?: Record<string, XBRLConcept>;
    dei?: Record<string, XBRLConcept>;
    'ifrs-full'?: Record<string, XBRLConcept>;
    [taxonomy: string]: Record<string, XBRLConcept> | undefined;
  };
}

/** Filing entry in submissions response */
export interface FilingEntry {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  form: string;
  primaryDocument: string;
  primaryDocDescription: string;
}

/** Response from /submissions/CIK{padded}.json */
export interface SubmissionsResponse {
  cik: string;
  entityType: string;
  sic: string;
  sicDescription: string;
  name: string;
  tickers: string[];
  exchanges: string[];
  filings: {
    recent: {
      accessionNumber: string[];
      filingDate: string[];
      reportDate: string[];
      form: string[];
      primaryDocument: string[];
      primaryDocDescription: string[];
    };
    files: Array<{ name: string; filingCount: number; filingFrom: string; filingTo: string }>;
  };
}
