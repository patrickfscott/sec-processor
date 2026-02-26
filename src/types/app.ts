/** Application-level types */

export type JobStatus = 'idle' | 'running' | 'completed' | 'error';

export interface ExtractionJob {
  id: string;
  tickers: string[];
  filingTypes: string[];
  periodCount: number;
  status: JobStatus;
  progress: number;
  startedAt?: number;
  completedAt?: number;
}

export type LogLevel = 'info' | 'success' | 'warn' | 'error';

export interface StatusLogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  ticker?: string;
  message: string;
}

export interface AppSettings {
  anthropicApiKey: string;
  userAgentEmail: string;
  enableAIFallback: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  anthropicApiKey: '',
  userAgentEmail: 'contact@example.com',
  enableAIFallback: false,
};
