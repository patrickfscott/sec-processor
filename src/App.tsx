import { useExtractionStore } from './store/extraction-store';
import { useExtractionPipeline } from './hooks/useExtractionPipeline';
import { Header } from './components/layout/Header';
import { SettingsPanel } from './components/layout/SettingsPanel';
import { ExtractionForm } from './components/input/ExtractionForm';
import { ProgressBar } from './components/progress/ProgressBar';
import { StatusLog } from './components/progress/StatusLog';
import { ResultsContainer } from './components/results/ResultsContainer';

export default function App() {
  const {
    job,
    results,
    logs,
    settings,
    settingsOpen,
    activeTab,
    setSettingsOpen,
    updateSettings,
    setActiveTab,
  } = useExtractionStore();

  const { runExtraction, isRunning } = useExtractionPipeline();

  return (
    <div className="min-h-screen flex flex-col bg-terminal-bg">
      <Header onSettingsClick={() => setSettingsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 space-y-4">
        {/* Input form */}
        <ExtractionForm onSubmit={runExtraction} isRunning={isRunning} />

        {/* Progress */}
        {job && job.status === 'running' && (
          <ProgressBar
            progress={job.progress}
            status={`Processing ${job.tickers.join(', ')}...`}
          />
        )}

        {/* Status log */}
        <StatusLog logs={logs} />

        {/* Results */}
        <ResultsContainer
          results={results}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Empty state */}
        {!job && results.size === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="text-2xl text-gray-700">
              <svg className="w-12 h-12 mx-auto text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Enter ticker symbols above to extract financial data from SEC EDGAR
            </p>
            <p className="text-xs text-gray-600">
              Data is sourced directly from XBRL-tagged SEC filings with machine-readable precision
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-terminal-border py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-gray-600">
          <span>SEC EDGAR XBRL Data Terminal</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-green" />
              XBRL (high confidence)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-yellow" />
              AI/Derived (medium)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-terminal-red" />
              Low confidence
            </span>
          </div>
        </div>
      </footer>

      {/* Settings panel */}
      <SettingsPanel
        settings={settings}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdate={updateSettings}
      />
    </div>
  );
}
