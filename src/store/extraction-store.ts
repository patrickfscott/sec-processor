/**
 * Zustand store for application state.
 */
import { create } from 'zustand';
import type { CompanyExtractionResult } from '../types/financial';
import type { ExtractionJob, StatusLogEntry, AppSettings, LogLevel } from '../types/app';
import { DEFAULT_SETTINGS } from '../types/app';

interface ExtractionState {
  // Job state
  job: ExtractionJob | null;

  // Results
  results: Map<string, CompanyExtractionResult>;

  // Status log
  logs: StatusLogEntry[];

  // Settings
  settings: AppSettings;
  settingsOpen: boolean;

  // Active tab for results
  activeTab: string | null;

  // Actions
  startJob: (tickers: string[], filingTypes: string[], periodCount: number) => void;
  updateJobProgress: (progress: number) => void;
  completeJob: () => void;
  failJob: () => void;
  addResult: (result: CompanyExtractionResult) => void;
  addLog: (level: LogLevel, message: string, ticker?: string) => void;
  clearLogs: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  reset: () => void;
}

let logCounter = 0;

export const useExtractionStore = create<ExtractionState>((set) => ({
  job: null,
  results: new Map(),
  logs: [],
  settings: loadSettings(),
  settingsOpen: false,
  activeTab: null,

  startJob: (tickers, filingTypes, periodCount) =>
    set({
      job: {
        id: `job-${Date.now()}`,
        tickers,
        filingTypes,
        periodCount,
        status: 'running',
        progress: 0,
        startedAt: Date.now(),
      },
      results: new Map(),
      logs: [],
    }),

  updateJobProgress: (progress) =>
    set((state) => ({
      job: state.job ? { ...state.job, progress } : null,
    })),

  completeJob: () =>
    set((state) => ({
      job: state.job
        ? { ...state.job, status: 'completed', progress: 100, completedAt: Date.now() }
        : null,
    })),

  failJob: () =>
    set((state) => ({
      job: state.job ? { ...state.job, status: 'error' } : null,
    })),

  addResult: (result) =>
    set((state) => {
      const newResults = new Map(state.results);
      newResults.set(result.ticker, result);
      return {
        results: newResults,
        activeTab: state.activeTab ?? result.ticker,
      };
    }),

  addLog: (level, message, ticker) =>
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: `log-${++logCounter}`,
          timestamp: Date.now(),
          level,
          ticker,
          message,
        },
      ],
    })),

  clearLogs: () => set({ logs: [] }),

  updateSettings: (newSettings) =>
    set((state) => {
      const settings = { ...state.settings, ...newSettings };
      saveSettings(settings);
      return { settings };
    }),

  setSettingsOpen: (open) => set({ settingsOpen: open }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  reset: () =>
    set({
      job: null,
      results: new Map(),
      logs: [],
      activeTab: null,
    }),
}));

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('sec-extractor-settings');
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem('sec-extractor-settings', JSON.stringify(settings));
  } catch {
    // ignore
  }
}
