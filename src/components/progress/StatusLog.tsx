import { useEffect, useRef } from 'react';
import type { StatusLogEntry } from '../../types/app';

interface StatusLogProps {
  logs: StatusLogEntry[];
}

const levelColors: Record<string, string> = {
  info: 'text-gray-400',
  success: 'text-terminal-green',
  warn: 'text-terminal-yellow',
  error: 'text-terminal-red',
};

const levelIcons: Record<string, string> = {
  info: '›',
  success: '✓',
  warn: '⚠',
  error: '✗',
};

export function StatusLog({ logs }: StatusLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  if (logs.length === 0) return null;

  return (
    <div className="bg-terminal-bg border border-terminal-border rounded-lg overflow-hidden">
      <div className="px-3 py-2 border-b border-terminal-border bg-terminal-surface">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          Activity Log
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto p-2 space-y-0.5 font-mono text-xs">
        {logs.map((log) => (
          <div key={log.id} className={`flex gap-2 ${levelColors[log.level]}`}>
            <span className="w-3 flex-shrink-0 text-center">{levelIcons[log.level]}</span>
            <span className="text-gray-600">
              {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
            </span>
            {log.ticker && (
              <span className="text-terminal-accent font-semibold">[{log.ticker}]</span>
            )}
            <span>{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
