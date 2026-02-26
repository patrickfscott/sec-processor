interface PeriodSelectorProps {
  value: number;
  onChange: (count: number) => void;
  disabled?: boolean;
}

const PERIOD_OPTIONS = [
  { value: 4, label: 'Last 4 Quarters' },
  { value: 8, label: 'Last 8 Quarters' },
  { value: 12, label: 'Last 12 Quarters' },
  { value: 2, label: 'Last 2 Years' },
  { value: 5, label: 'Last 5 Years' },
];

export function PeriodSelector({ value, onChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Periods
      </label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-terminal-accent focus:ring-1 focus:ring-terminal-accent/30"
      >
        {PERIOD_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
