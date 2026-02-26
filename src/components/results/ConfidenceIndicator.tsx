import type { ConfidenceLevel, DataSource } from '../../types/financial';

interface ConfidenceIndicatorProps {
  confidence: ConfidenceLevel;
  source: DataSource;
}

const colors: Record<ConfidenceLevel, string> = {
  high: 'bg-terminal-green',
  medium: 'bg-terminal-yellow',
  low: 'bg-terminal-red',
  not_found: 'bg-gray-600',
};

const tooltips: Record<ConfidenceLevel, string> = {
  high: 'XBRL data (high confidence)',
  medium: 'AI extracted or YTD deduction (medium confidence)',
  low: 'Low confidence - review recommended',
  not_found: 'Not found in filings',
};

export function ConfidenceIndicator({ confidence, source }: ConfidenceIndicatorProps) {
  const sourceLabel = source === 'xbrl' ? 'XBRL' : source === 'ai_extracted' ? 'AI' : 'Calc';

  return (
    <span className="inline-flex items-center gap-1 group relative" title={`${tooltips[confidence]} (${sourceLabel})`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors[confidence]}`} />
    </span>
  );
}
