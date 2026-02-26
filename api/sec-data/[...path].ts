export const config = { runtime: 'edge' };

const DEFAULT_SEC_USER_AGENT = 'SECFinExtractor/1.0 (contact@example.com)';

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/sec-data\/?/, '');
  const upstreamUrl = `https://data.sec.gov/${path}${url.search}`;

  const userAgent =
    request.headers.get('x-sec-user-agent') || DEFAULT_SEC_USER_AGENT;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': userAgent,
        'Accept': request.headers.get('accept') || 'application/json',
        'Accept-Encoding': 'identity',
      },
      redirect: 'manual',
    });

    // If SEC redirects, follow it with a second fetch (avoids Host header issues)
    if (upstream.status >= 300 && upstream.status < 400) {
      const location = upstream.headers.get('location');
      if (location) {
        const redirectUrl = new URL(location, upstreamUrl).href;
        const redirected = await fetch(redirectUrl, {
          headers: {
            'User-Agent': userAgent,
            'Accept': request.headers.get('accept') || 'application/json',
            'Accept-Encoding': 'identity',
          },
        });

        return new Response(redirected.body, {
          status: redirected.status,
          headers: {
            'Content-Type':
              redirected.headers.get('content-type') || 'application/json',
            'X-Upstream-URL': upstreamUrl,
            'X-Redirected-To': redirectUrl,
            'X-Upstream-Status': String(redirected.status),
          },
        });
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        'Content-Type':
          upstream.headers.get('content-type') || 'application/json',
        'X-Upstream-URL': upstreamUrl,
        'X-Upstream-Status': String(upstream.status),
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Failed to proxy request to SEC data' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
