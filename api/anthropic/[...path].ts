export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/anthropic\/?/, '');
  const upstreamUrl = `https://api.anthropic.com/${path}${url.search}`;

  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('content-type') || 'application/json',
  };

  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const anthropicVersion = request.headers.get('anthropic-version');
  if (anthropicVersion) {
    headers['anthropic-version'] = anthropicVersion;
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? request.body : undefined,
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') || 'application/json',
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy request to Anthropic' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
