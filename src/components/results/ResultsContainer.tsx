import type { CompanyExtractionResult } from '../../types/financial';
import { FinancialTable } from './FinancialTable';
import { ComparisonView } from './ComparisonView';
import { ExportButton } from './ExportButton';

interface ResultsContainerProps {
  results: Map<string, CompanyExtractionResult>;
  activeTab: string | null;
  onTabChange: (tab: string) => void;
}

const TICKER_COLORS = [
  'border-blue-400 text-blue-400',
  'border-green-400 text-green-400',
  'border-purple-400 text-purple-400',
  'border-orange-400 text-orange-400',
  'border-pink-400 text-pink-400',
  'border-cyan-400 text-cyan-400',
];

export function ResultsContainer({ results, activeTab, onTabChange }: ResultsContainerProps) {
  if (results.size === 0) return null;

  const companies = Array.from(results.values());
  const showComparison = companies.length > 1;
  const tabs = [
    ...companies.map((c) => c.ticker),
    ...(showComparison ? ['comparison'] : []),
  ];

  const currentTab = activeTab && tabs.includes(activeTab) ? activeTab : tabs[0];

  return (
    <div className="bg-terminal-surface border border-terminal-border rounded-lg overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-terminal-border bg-terminal-bg/50 px-2">
        <div className="flex">
          {tabs.map((tab, i) => {
            const isActive = tab === currentTab;
            const colorClass = tab === 'comparison'
              ? 'border-terminal-accent text-terminal-accent'
              : TICKER_COLORS[i % TICKER_COLORS.length];

            return (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
                  isActive
                    ? colorClass
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'comparison' ? 'Compare' : tab}
                {tab !== 'comparison' && results.get(tab)?.companyName && (
                  <span className="ml-1.5 text-[10px] font-normal normal-case text-gray-500">
                    {results.get(tab)!.companyName.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <ExportButton results={results} />
      </div>

      {/* Tab content */}
      <div className="p-0">
        {currentTab === 'comparison' ? (
          <div className="p-4">
            <ComparisonView results={companies} />
          </div>
        ) : (
          <FinancialTable result={results.get(currentTab)!} />
        )}
      </div>
    </div>
  );
}
