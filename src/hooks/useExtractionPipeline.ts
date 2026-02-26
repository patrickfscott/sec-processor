/**
 * Main orchestrator hook for the extraction pipeline.
 *
 * Coordinates: CIK resolution → CompanyFacts fetch → XBRL extraction →
 * calculated metrics → cross-validation → store results.
 */
import { useCallback } from 'react';
import { useExtractionStore } from '../store/extraction-store';
import { resolveTicker, fetchCompanyFacts, setUserAgent } from '../services/sec-api';
import { extractMetrics } from '../services/xbrl-extractor';
import { computeCalculatedMetrics } from '../services/metrics-calculator';
import { crossValidate } from '../services/cross-validator';
import type { CompanyExtractionResult } from '../types/financial';

/** Max concurrent ticker processing */
const MAX_CONCURRENT = 3;

export function useExtractionPipeline() {
  const store = useExtractionStore();

  const runExtraction = useCallback(
    async (tickers: string[], filingTypes: string[], periodCount: number) => {
      const { startJob, updateJobProgress, completeJob, failJob, addResult, addLog, settings } =
        useExtractionStore.getState();

      // Set user agent from settings
      setUserAgent(settings.userAgentEmail);

      startJob(tickers, filingTypes, periodCount);
      addLog('info', `Starting extraction for ${tickers.length} ticker(s)...`);

      const totalTickers = tickers.length;
      let completedCount = 0;

      // Process tickers with concurrency limit
      const queue = [...tickers];
      const inFlight: Promise<void>[] = [];

      const processNext = async (): Promise<void> => {
        while (queue.length > 0) {
          const ticker = queue.shift()!;
          try {
            const result = await processTicker(ticker, filingTypes, periodCount, addLog);
            addResult(result);
            addLog('success', `Completed extraction for ${ticker}`, ticker);
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            addLog('error', `Failed to process ${ticker}: ${msg}`, ticker);
            addResult({
              ticker,
              companyName: ticker,
              cik: 0,
              periods: [],
              errors: [msg],
            });
          }
          completedCount++;
          updateJobProgress(Math.round((completedCount / totalTickers) * 100));
        }
      };

      try {
        // Launch up to MAX_CONCURRENT workers
        for (let i = 0; i < Math.min(MAX_CONCURRENT, queue.length); i++) {
          inFlight.push(processNext());
        }
        await Promise.all(inFlight);
        completeJob();
        addLog('success', `Extraction complete. Processed ${totalTickers} ticker(s).`);
      } catch (error) {
        failJob();
        const msg = error instanceof Error ? error.message : String(error);
        addLog('error', `Extraction failed: ${msg}`);
      }
    },
    [],
  );

  return { runExtraction, isRunning: store.job?.status === 'running' };
}

/**
 * Process a single ticker through the full extraction pipeline.
 */
async function processTicker(
  ticker: string,
  filingTypes: string[],
  periodCount: number,
  addLog: (level: 'info' | 'success' | 'warn' | 'error', message: string, ticker?: string) => void,
): Promise<CompanyExtractionResult> {
  // Step 1: Resolve CIK
  addLog('info', `Resolving CIK for ${ticker}...`, ticker);
  const tickerInfo = await resolveTicker(ticker);
  if (!tickerInfo) {
    throw new Error(`Ticker "${ticker}" not found in SEC database`);
  }
  addLog('info', `${ticker}: CIK ${tickerInfo.cik} (${tickerInfo.name})`, ticker);

  // Step 2: Fetch CompanyFacts
  addLog('info', `Fetching XBRL data for ${ticker}...`, ticker);
  const facts = await fetchCompanyFacts(tickerInfo.cik);
  addLog('info', `${ticker}: Retrieved company facts`, ticker);

  // Step 3: Build extraction targets
  const includeAnnual = filingTypes.includes('10-K');
  const targets = buildExtractionTargets(filingTypes, periodCount);

  // Step 4: Extract metrics from XBRL
  addLog('info', `${ticker}: Extracting financial metrics...`, ticker);
  const periods = extractMetrics(facts, targets);

  // Step 5: Compute calculated metrics
  addLog('info', `${ticker}: Computing derived metrics...`, ticker);
  computeCalculatedMetrics(periods);

  // Step 6: Cross-validate
  const issues = crossValidate(periods);
  if (issues.length > 0) {
    for (const issue of issues) {
      addLog('warn', `${ticker} ${issue.period}: ${issue.message}`, ticker);
    }
  }

  // Count found metrics
  let totalMetrics = 0;
  let foundMetrics = 0;
  for (const period of periods) {
    for (const metric of period.metrics.values()) {
      totalMetrics++;
      if (metric.value !== null) foundMetrics++;
    }
  }
  addLog(
    'info',
    `${ticker}: Found ${foundMetrics}/${totalMetrics} data points across ${periods.length} periods`,
    ticker,
  );

  return {
    ticker,
    companyName: tickerInfo.name,
    cik: tickerInfo.cik,
    periods,
    errors: issues.map((i) => i.message),
  };
}

/**
 * Build extraction targets based on filing types and period count.
 */
function buildExtractionTargets(
  filingTypes: string[],
  periodCount: number,
): Array<{ fy: number; fp: string; forms: string[] }> {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentQuarter = Math.ceil(currentMonth / 3);

  const targets: Array<{ fy: number; fp: string; forms: string[] }> = [];

  if (filingTypes.includes('10-Q')) {
    // Generate last N quarters
    let year = currentYear;
    let q = currentQuarter - 1;
    if (q <= 0) {
      q = 4;
      year--;
    }

    for (let i = 0; i < periodCount; i++) {
      targets.push({ fy: year, fp: `Q${q}`, forms: ['10-Q'] });
      q--;
      if (q <= 0) {
        q = 4;
        year--;
      }
    }
  }

  if (filingTypes.includes('10-K')) {
    // Generate last N annual periods
    for (let i = 0; i < Math.min(periodCount, 5); i++) {
      targets.push({ fy: currentYear - 1 - i, fp: 'FY', forms: ['10-K'] });
    }
  }

  return targets.reverse(); // Chronological order
}
