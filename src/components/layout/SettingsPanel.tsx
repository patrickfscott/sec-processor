import type { AppSettings } from '../../types/app';
import { Button } from '../common/Button';

interface SettingsPanelProps {
  settings: AppSettings;
  open: boolean;
  onClose: () => void;
  onUpdate: (settings: Partial<AppSettings>) => void;
}

export function SettingsPanel({ settings, open, onClose, onUpdate }: SettingsPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-96 bg-terminal-surface border-l border-terminal-border h-full overflow-y-auto">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-200">Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-lg">
              &times;
            </button>
          </div>

          {/* User Agent Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Contact Email (SEC User-Agent)
            </label>
            <input
              type="email"
              value={settings.userAgentEmail}
              onChange={(e) => onUpdate({ userAgentEmail: e.target.value })}
              placeholder="your@email.com"
              className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-gray-200 outline-none focus:border-terminal-accent"
            />
            <p className="text-[10px] text-gray-600">
              Required by SEC fair access policy. Included in API request headers.
            </p>
          </div>

          {/* AI Fallback Toggle */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAIFallback}
                onChange={(e) => onUpdate({ enableAIFallback: e.target.checked })}
                className="w-4 h-4 rounded border-terminal-border bg-terminal-bg accent-terminal-accent"
              />
              <span className="text-xs font-medium text-gray-300">Enable AI Fallback</span>
            </label>
            <p className="text-[10px] text-gray-600 ml-6">
              Use Claude to extract data from filing HTML when XBRL data is unavailable.
            </p>
          </div>

          {/* Anthropic API Key */}
          {settings.enableAIFallback && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Anthropic API Key
              </label>
              <input
                type="password"
                value={settings.anthropicApiKey}
                onChange={(e) => onUpdate({ anthropicApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="w-full bg-terminal-bg border border-terminal-border rounded px-3 py-2 text-sm text-gray-200 font-mono outline-none focus:border-terminal-accent"
              />
              <p className="text-[10px] text-gray-600">
                Your API key is stored locally and never sent to any server besides Anthropic.
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-terminal-border">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
