import type { CompanyExtractionResult } from '../../types/financial';
import { formatMetricValue, getValueClass } from '../../utils/format';
import { XBRL_CONCEPTS } from '../../constants/xbrl-concepts';
import { CALCULATED_METRICS } from '../../constants/calculated-metrics';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface ComparisonViewProps {
  results: CompanyExtractionResult[];
}

const KEY_METRICS = [
  'revenue', 'net_income', 'eps_diluted', 'operating_cash_flow',
  'total_assets', 'stockholders_equity', 'cash',
  'gross_margin', 'operating_margin', 'net_margin',
  'free_cash_flow', 'current_ratio', 'debt_to_equity', 'return_on_equity',
];

const TICKER_COLORS = [
  'text-blue-400',
  'text-green-400',
  'text-purple-400',
  'text-orange-400',
  'text-pink-400',
  'text-cyan-400',
];

export function ComparisonView({ results }: ComparisonViewProps) {
  if (results.length < 2) return null;

  // Find the most recent period common to all companies
  const allPeriodSets = results.map((r) => new Set(r.periods.map((p) => p.period)));
  const commonPeriods = [...allPeriodSets[0]].filter((p) =>
    allPeriodSets.every((s) => s.has(p)),
  );

  const recentPeriod = commonPeriods.sort().pop();
  if (!recentPeriod) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No common reporting periods found for comparison.
      </div>
    );
  }

  const allConcepts = [...XBRL_CONCEPTS, ...CALCULATED_METRICS.map((m) => ({
    id: m.id, label: m.label, category: m.category, unit: m.unit,
  }))];

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 text-xs text-gray-400">
        Comparing for period: <span className="font-mono text-gray-200">{recentPeriod}</span>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-terminal-border">
            <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider min-w-[180px]">
              Metric
            </th>
            {results.map((r, i) => (
              <th
                key={r.ticker}
                className={`py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider min-w-[130px] ${TICKER_COLORS[i % TICKER_COLORS.length]}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${TICKER_COLORS[i % TICKER_COLORS.length].replace('text-', 'bg-')}`} />
                  {r.ticker}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {KEY_METRICS.map((metricId) => {
            const concept = allConcepts.find((c) => c.id === metricId);
            if (!concept) return null;

            return (
              <tr key={metricId} className="hover:bg-terminal-highlight/50 border-b border-terminal-border/30">
                <td className="py-1.5 px-3 text-xs text-gray-300">
                  {concept.label}
                </td>
                {results.map((r) => {
                  const periodData = r.periods.find((p) => p.period === recentPeriod);
                  const metric = periodData?.metrics.get(metricId);
                  const value = metric?.value ?? null;

                  return (
                    <td
                      key={r.ticker}
                      className={`py-1.5 px-3 text-xs text-right font-mono ${getValueClass(value)}`}
                    >
                      <span className="flex items-center justify-end gap-1">
                        {value !== null ? formatMetricValue(value, concept.unit) : (
                          <span className="text-gray-600">—</span>
                        )}
                        {metric && metric.confidence !== 'not_found' && (
                          <ConfidenceIndicator confidence={metric.confidence} source={metric.source} />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
