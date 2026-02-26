/**
 * Anthropic API fallback for extracting financial data from unstructured filing HTML.
 * Uses Vite dev server proxy to avoid CORS issues.
 */
import type { ExtractedMetric, FinancialCategory, MetricUnit } from '../types/financial';

interface AIExtractionResult {
  value: number | null;
  unit: string;
  period: string;
  confidence: 'high' | 'medium' | 'low' | 'not_found';
}

/**
 * Extract a financial metric using Anthropic Claude from filing HTML.
 */
export async function extractWithAI(
  apiKey: string,
  filingHtml: string,
  conceptLabel: string,
  period: string,
  category: FinancialCategory,
  unit: MetricUnit,
  conceptId: string,
): Promise<ExtractedMetric | null> {
  if (!apiKey) return null;

  // Truncate HTML to avoid token limits (keep first ~50KB)
  const truncatedHtml = filingHtml.slice(0, 50_000);

  const prompt = `You are a financial data extraction system. Extract the exact numerical value for "${conceptLabel}" from the following SEC filing excerpt for the period ${period}. Return ONLY a JSON object: {"value": <number>, "unit": "${unit}", "period": "${period}", "confidence": "high|medium|low"}. If the value is not present, return {"value": null, "confidence": "not_found"}. Do not include any other text.`;

  try {
    const response = await fetch('/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: `${prompt}\n\n<filing>\n${truncatedHtml}\n</filing>`,
          },
        ],
      }),
    });

    if (!response.ok) {
      console.warn(`Anthropic API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) return null;

    const parsed: AIExtractionResult = JSON.parse(text);

    return {
      conceptId,
      label: conceptLabel,
      category,
      value: parsed.value,
      unit,
      period,
      filingDate: '',
      form: '',
      source: 'ai_extracted',
      confidence: parsed.confidence === 'not_found' ? 'not_found' : 'medium',
    };
  } catch (error) {
    console.warn('AI extraction failed:', error);
    return null;
  }
}
