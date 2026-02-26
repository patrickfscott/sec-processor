import { useState } from 'react';
import { TickerInput } from './TickerInput';
import { FilingTypeSelector } from './FilingTypeSelector';
import { PeriodSelector } from './PeriodSelector';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface ExtractionFormProps {
  onSubmit: (tickers: string[], filingTypes: string[], periodCount: number) => void;
  isRunning: boolean;
}

export function ExtractionForm({ onSubmit, isRunning }: ExtractionFormProps) {
  const [tickerText, setTickerText] = useState('');
  const [filingTypes, setFilingTypes] = useState(['10-Q']);
  const [periodCount, setPeriodCount] = useState(4);

  const parseTickers = (text: string): string[] => {
    return text
      .split(/[,\n\s]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);
  };

  const handleSubmit = () => {
    const tickers = parseTickers(tickerText);
    if (tickers.length === 0) return;
    onSubmit(tickers, filingTypes, periodCount);
  };

  const tickers = parseTickers(tickerText);

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-terminal-green" />
        <h2 className="text-sm font-semibold text-gray-200">Data Extraction</h2>
      </div>

      <TickerInput value={tickerText} onChange={setTickerText} disabled={isRunning} />

      <div className="grid grid-cols-2 gap-4">
        <FilingTypeSelector selected={filingTypes} onChange={setFilingTypes} disabled={isRunning} />
        <PeriodSelector value={periodCount} onChange={setPeriodCount} disabled={isRunning} />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isRunning || tickers.length === 0}
        className="w-full"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            Processing...
          </span>
        ) : (
          `Run Extraction${tickers.length > 0 ? ` (${tickers.length} ticker${tickers.length > 1 ? 's' : ''})` : ''}`
        )}
      </Button>
    </div>
  );
}
