import type { FinancialCategory, MetricUnit } from '../types/financial';

export interface XBRLConceptDef {
  id: string;
  label: string;
  category: FinancialCategory;
  unit: MetricUnit;
  /** XBRL tag names to try in priority order */
  tags: string[];
  /** Taxonomy to search in (default: us-gaap) */
  taxonomy?: string;
  /** Whether this is a balance sheet item (instant) vs income/cash flow (duration) */
  isInstant?: boolean;
}

export const XBRL_CONCEPTS: XBRLConceptDef[] = [
  // ═══════════════════════════════════════════
  // INCOME STATEMENT
  // ═══════════════════════════════════════════
  {
    id: 'revenue',
    label: 'Revenue',
    category: 'income_statement',
    unit: 'USD',
    tags: [
      'Revenues',
      'RevenueFromContractWithCustomerExcludingAssessedTax',
      'SalesRevenueNet',
      'RevenueFromContractWithCustomerIncludingAssessedTax',
    ],
  },
  {
    id: 'cost_of_revenue',
    label: 'Cost of Revenue',
    category: 'income_statement',
    unit: 'USD',
    tags: ['CostOfGoodsAndServicesSold', 'CostOfGoodsSold', 'CostOfRevenue'],
  },
  {
    id: 'gross_profit',
    label: 'Gross Profit',
    category: 'income_statement',
    unit: 'USD',
    tags: ['GrossProfit'],
  },
  {
    id: 'operating_expenses',
    label: 'Operating Expenses',
    category: 'income_statement',
    unit: 'USD',
    tags: ['OperatingExpenses'],
  },
  {
    id: 'rd_expense',
    label: 'R&D Expense',
    category: 'income_statement',
    unit: 'USD',
    tags: ['ResearchAndDevelopmentExpense'],
  },
  {
    id: 'sga_expense',
    label: 'SG&A Expense',
    category: 'income_statement',
    unit: 'USD',
    tags: ['SellingGeneralAndAdministrativeExpense'],
  },
  {
    id: 'operating_income',
    label: 'Operating Income',
    category: 'income_statement',
    unit: 'USD',
    tags: ['OperatingIncomeLoss'],
  },
  {
    id: 'interest_expense',
    label: 'Interest Expense',
    category: 'income_statement',
    unit: 'USD',
    tags: ['InterestExpense'],
  },
  {
    id: 'income_tax',
    label: 'Income Tax Expense',
    category: 'income_statement',
    unit: 'USD',
    tags: ['IncomeTaxExpenseBenefit'],
  },
  {
    id: 'net_income',
    label: 'Net Income',
    category: 'income_statement',
    unit: 'USD',
    tags: ['NetIncomeLoss'],
  },
  {
    id: 'eps_basic',
    label: 'EPS (Basic)',
    category: 'income_statement',
    unit: 'USD/share',
    tags: ['EarningsPerShareBasic'],
  },
  {
    id: 'eps_diluted',
    label: 'EPS (Diluted)',
    category: 'income_statement',
    unit: 'USD/share',
    tags: ['EarningsPerShareDiluted'],
  },
  {
    id: 'shares_basic',
    label: 'Shares Outstanding (Basic)',
    category: 'income_statement',
    unit: 'shares',
    tags: ['WeightedAverageNumberOfShareOutstandingBasic'],
  },
  {
    id: 'shares_diluted',
    label: 'Shares Outstanding (Diluted)',
    category: 'income_statement',
    unit: 'shares',
    tags: ['WeightedAverageNumberOfDilutedSharesOutstanding'],
  },

  // ═══════════════════════════════════════════
  // BALANCE SHEET
  // ═══════════════════════════════════════════
  {
    id: 'total_assets',
    label: 'Total Assets',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['Assets'],
    isInstant: true,
  },
  {
    id: 'current_assets',
    label: 'Current Assets',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['AssetsCurrent'],
    isInstant: true,
  },
  {
    id: 'cash',
    label: 'Cash & Equivalents',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['CashAndCashEquivalentsAtCarryingValue'],
    isInstant: true,
  },
  {
    id: 'short_term_investments',
    label: 'Short-Term Investments',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['ShortTermInvestments', 'MarketableSecuritiesCurrent'],
    isInstant: true,
  },
  {
    id: 'accounts_receivable',
    label: 'Accounts Receivable',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['AccountsReceivableNetCurrent'],
    isInstant: true,
  },
  {
    id: 'inventory',
    label: 'Inventory',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['InventoryNet'],
    isInstant: true,
  },
  {
    id: 'total_liabilities',
    label: 'Total Liabilities',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['Liabilities'],
    isInstant: true,
  },
  {
    id: 'current_liabilities',
    label: 'Current Liabilities',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['LiabilitiesCurrent'],
    isInstant: true,
  },
  {
    id: 'accounts_payable',
    label: 'Accounts Payable',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['AccountsPayableCurrent'],
    isInstant: true,
  },
  {
    id: 'long_term_debt',
    label: 'Long-Term Debt',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['LongTermDebt', 'LongTermDebtNoncurrent'],
    isInstant: true,
  },
  {
    id: 'stockholders_equity',
    label: "Stockholders' Equity",
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['StockholdersEquity'],
    isInstant: true,
  },
  {
    id: 'retained_earnings',
    label: 'Retained Earnings',
    category: 'balance_sheet',
    unit: 'USD',
    tags: ['RetainedEarningsAccumulatedDeficit'],
    isInstant: true,
  },
  {
    id: 'common_shares_outstanding',
    label: 'Common Shares Outstanding',
    category: 'balance_sheet',
    unit: 'shares',
    tags: ['CommonStockSharesOutstanding'],
    isInstant: true,
  },

  // ═══════════════════════════════════════════
  // CASH FLOW STATEMENT
  // ═══════════════════════════════════════════
  {
    id: 'operating_cash_flow',
    label: 'Operating Cash Flow',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['NetCashProvidedByUsedInOperatingActivities'],
  },
  {
    id: 'investing_cash_flow',
    label: 'Investing Cash Flow',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['NetCashProvidedByUsedInInvestingActivities'],
  },
  {
    id: 'financing_cash_flow',
    label: 'Financing Cash Flow',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['NetCashProvidedByUsedInFinancingActivities'],
  },
  {
    id: 'depreciation',
    label: 'Depreciation & Amortization',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['DepreciationDepletionAndAmortization'],
  },
  {
    id: 'dividends_paid',
    label: 'Dividends Paid',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['PaymentsOfDividends', 'PaymentsOfDividendsCommonStock', 'PaymentsOfOrdinaryDividends'],
  },
  {
    id: 'capex',
    label: 'Capital Expenditures',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['PaymentsToAcquirePropertyPlantAndEquipment'],
  },
  {
    id: 'buybacks',
    label: 'Share Buybacks',
    category: 'cash_flow',
    unit: 'USD',
    tags: ['PaymentsForRepurchaseOfCommonStock'],
  },

  // ═══════════════════════════════════════════
  // DIVIDENDS & SHAREHOLDER RETURNS
  // ═══════════════════════════════════════════
  {
    id: 'dps_declared',
    label: 'Dividends Per Share (Declared)',
    category: 'dividends',
    unit: 'USD/share',
    tags: ['CommonStockDividendsPerShareDeclared'],
  },
  {
    id: 'dps_paid',
    label: 'Dividends Per Share (Paid)',
    category: 'dividends',
    unit: 'USD/share',
    tags: ['CommonStockDividendsPerShareCashPaid'],
  },
  {
    id: 'total_dividends_cash',
    label: 'Total Dividends (Cash)',
    category: 'dividends',
    unit: 'USD',
    tags: ['DividendsCommonStockCash'],
  },
];

export const CONCEPT_BY_ID = new Map(XBRL_CONCEPTS.map((c) => [c.id, c]));
