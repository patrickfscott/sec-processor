interface ProgressBarProps {
  progress: number;
  status: string;
}

export function ProgressBar({ progress, status }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{status}</span>
        <span className="font-mono">{progress}%</span>
      </div>
      <div className="h-1.5 bg-terminal-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-terminal-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
