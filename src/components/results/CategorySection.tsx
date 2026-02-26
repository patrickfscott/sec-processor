import type { FinancialCategory, PeriodData } from '../../types/financial';
import { XBRL_CONCEPTS } from '../../constants/xbrl-concepts';
import { CALCULATED_METRICS } from '../../constants/calculated-metrics';
import { MetricRow } from './MetricRow';

interface CategorySectionProps {
  category: FinancialCategory;
  label: string;
  periods: PeriodData[];
  sortedPeriodLabels: string[];
}

export function CategorySection({ category, label, periods, sortedPeriodLabels }: CategorySectionProps) {
  const concepts = category === 'calculated_metrics'
    ? CALCULATED_METRICS.map((m) => ({ id: m.id, label: m.label, category: m.category }))
    : XBRL_CONCEPTS.filter((c) => c.category === category);

  const getMetric = (conceptId: string, period: string) => {
    const periodData = periods.find((p) => p.period === period);
    return periodData?.metrics.get(conceptId);
  };

  // Check if any metrics in this category have data
  const hasData = concepts.some((c) =>
    sortedPeriodLabels.some((p) => {
      const m = getMetric(c.id, p);
      return m && m.value !== null;
    }),
  );

  if (!hasData && category !== 'calculated_metrics') return null;

  return (
    <tbody>
      <tr>
        <td
          colSpan={sortedPeriodLabels.length + 1}
          className="py-2 px-3 text-[10px] font-bold text-terminal-accent uppercase tracking-widest bg-terminal-bg/50 border-y border-terminal-border"
        >
          {label}
        </td>
      </tr>
      {concepts.map((concept) => (
        <MetricRow
          key={concept.id}
          conceptId={concept.id}
          label={concept.label}
          periods={sortedPeriodLabels}
          getMetric={(period) => getMetric(concept.id, period)}
          isCalculated={category === 'calculated_metrics'}
        />
      ))}
    </tbody>
  );
}
