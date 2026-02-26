import type { CompanyExtractionResult } from '../../types/financial';
import { CategorySection } from './CategorySection';
import { sortPeriods } from '../../utils/period-utils';

interface FinancialTableProps {
  result: CompanyExtractionResult;
}

const CATEGORIES = [
  { key: 'income_statement' as const, label: 'Income Statement' },
  { key: 'balance_sheet' as const, label: 'Balance Sheet' },
  { key: 'cash_flow' as const, label: 'Cash Flow Statement' },
  { key: 'dividends' as const, label: 'Dividends & Shareholder Returns' },
  { key: 'calculated_metrics' as const, label: 'Calculated Metrics' },
];

export function FinancialTable({ result }: FinancialTableProps) {
  const sortedPeriods = sortPeriods(result.periods.map((p) => p.period));

  if (result.periods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No data available for {result.ticker}
        {result.errors.length > 0 && (
          <div className="mt-2 text-terminal-red text-xs">
            {result.errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-terminal-border">
            <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider sticky left-0 bg-terminal-surface z-10 min-w-[200px]">
              Metric
            </th>
            {sortedPeriods.map((period) => (
              <th
                key={period}
                className="py-2 px-3 text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap min-w-[120px]"
              >
                {period}
              </th>
            ))}
          </tr>
        </thead>
        {CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.key}
            category={cat.key}
            label={cat.label}
            periods={result.periods}
            sortedPeriodLabels={sortedPeriods}
          />
        ))}
      </table>
    </div>
  );
}
