import type { ExtractedMetric } from '../../types/financial';
import { formatMetricValue, getValueClass } from '../../utils/format';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface MetricRowProps {
  conceptId: string;
  label: string;
  periods: string[];
  getMetric: (period: string) => ExtractedMetric | undefined;
  isCalculated?: boolean;
}

export function MetricRow({ label, periods, getMetric, isCalculated }: MetricRowProps) {
  return (
    <tr className="hover:bg-terminal-highlight/50 transition-colors">
      <td className="py-1 px-3 text-xs text-gray-300 whitespace-nowrap border-r border-terminal-border">
        <span className="flex items-center gap-1.5">
          {label}
          {isCalculated && (
            <span className="text-[9px] text-terminal-muted bg-terminal-bg px-1 rounded" title="Calculated metric">
              CALC
            </span>
          )}
        </span>
      </td>
      {periods.map((period) => {
        const metric = getMetric(period);
        const value = metric?.value ?? null;
        const unit = metric?.unit ?? 'USD';

        return (
          <td
            key={period}
            className={`py-1 px-3 text-xs text-right font-mono whitespace-nowrap border-r border-terminal-border ${getValueClass(value)}`}
          >
            <span className="flex items-center justify-end gap-1">
              {value !== null ? formatMetricValue(value, unit) : (
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
}
