/**
 * Vercel serverless function that proxies requests to the Anthropic API.
 * This avoids CORS issues when calling Anthropic from the browser.
 *
 * If ANTHROPIC_API_KEY is set as a Vercel env var, it is used automatically.
 * Otherwise, the client must send its own key via the x-api-key header.
 */
export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders() });
  }

  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    request.headers.get('x-api-key');

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No Anthropic API key configured' }),
      { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    );
  }

  try {
    const body = await request.text();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body,
    });

    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } },
    );
  }
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
  };
}
