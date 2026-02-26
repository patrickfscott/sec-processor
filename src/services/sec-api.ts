/**
 * SEC EDGAR API client with rate limiting and caching.
 */
import type { CompanyTickersResponse, CompanyFactsResponse, SubmissionsResponse } from '../types/sec';
import { secRateLimiter } from './rate-limiter';
import { LRUCache } from '../utils/cache';

const cache = new LRUCache<unknown>(50, 30);

const DEFAULT_USER_AGENT = 'SECFinExtractor/1.0 (contact@example.com)';

let userAgent = DEFAULT_USER_AGENT;

export function setUserAgent(email: string): void {
  userAgent = `SECFinExtractor/1.0 (${email})`;
}

/** Rate-limited fetch wrapper for SEC APIs */
async function secFetch<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached) return cached as T;

  await secRateLimiter.acquire();

  const response = await fetch(url, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SEC API error: ${response.status} ${response.statusText} for ${url}`);
  }

  const data = await response.json();
  cache.set(url, data);
  return data as T;
}

/** Cached ticker -> CIK mapping */
let tickerMap: Map<string, { cik: number; name: string }> | null = null;

/** Load the ticker -> CIK mapping from SEC */
async function loadTickerMap(): Promise<Map<string, { cik: number; name: string }>> {
  if (tickerMap) return tickerMap;

  const data = await secFetch<CompanyTickersResponse>(
    'https://www.sec.gov/files/company_tickers.json',
  );

  tickerMap = new Map();
  for (const entry of Object.values(data)) {
    tickerMap.set(entry.ticker.toUpperCase(), {
      cik: entry.cik_str,
      name: entry.title,
    });
  }

  return tickerMap;
}

/** Resolve a ticker symbol to CIK and company name */
export async function resolveTicker(
  ticker: string,
): Promise<{ cik: number; name: string } | null> {
  const map = await loadTickerMap();
  return map.get(ticker.toUpperCase()) ?? null;
}

/** Pad CIK to 10 digits with leading zeros */
export function padCIK(cik: number): string {
  return cik.toString().padStart(10, '0');
}

/** Fetch all XBRL facts for a company */
export async function fetchCompanyFacts(cik: number): Promise<CompanyFactsResponse> {
  const paddedCIK = padCIK(cik);
  return secFetch<CompanyFactsResponse>(
    `https://data.sec.gov/api/xbrl/companyfacts/CIK${paddedCIK}.json`,
  );
}

/** Fetch company submissions (filing index) */
export async function fetchSubmissions(cik: number): Promise<SubmissionsResponse> {
  const paddedCIK = padCIK(cik);
  return secFetch<SubmissionsResponse>(
    `https://data.sec.gov/submissions/CIK${paddedCIK}.json`,
  );
}

/** Clear the in-memory caches */
export function clearCache(): void {
  cache.clear();
  tickerMap = null;
}
