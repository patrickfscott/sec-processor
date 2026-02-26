interface FilingTypeSelectorProps {
  selected: string[];
  onChange: (types: string[]) => void;
  disabled?: boolean;
}

const FILING_TYPES = [
  { value: '10-Q', label: '10-Q', desc: 'Quarterly', locked: true },
  { value: '10-K', label: '10-K', desc: 'Annual' },
  { value: '8-K', label: '8-K', desc: 'Events' },
];

export function FilingTypeSelector({ selected, onChange, disabled }: FilingTypeSelectorProps) {
  const toggle = (value: string) => {
    if (value === '10-Q') return; // Always included
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Filing Types
      </label>
      <div className="flex gap-2">
        {FILING_TYPES.map((ft) => {
          const isSelected = selected.includes(ft.value);
          return (
            <button
              key={ft.value}
              onClick={() => toggle(ft.value)}
              disabled={disabled || ft.locked}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                isSelected
                  ? 'bg-terminal-accent/20 border-terminal-accent text-terminal-accent'
                  : 'bg-terminal-surface border-terminal-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
              } ${ft.locked ? 'cursor-default' : 'cursor-pointer'}`}
            >
              {ft.label}
              <span className="ml-1 text-[10px] opacity-60">{ft.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
