import { useState } from 'react';

interface TickerInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TickerInput({ value, onChange, disabled }: TickerInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Ticker(s)
      </label>
      <div
        className={`relative rounded border ${
          focused ? 'border-terminal-accent ring-1 ring-terminal-accent/30' : 'border-terminal-border'
        } bg-terminal-bg`}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="AAPL, MSFT, GOOG"
          className="w-full bg-transparent px-3 py-2 text-sm font-mono text-gray-100 placeholder-gray-600 outline-none"
        />
      </div>
      <p className="text-xs text-gray-600">Comma-separated or one per line</p>
    </div>
  );
}
