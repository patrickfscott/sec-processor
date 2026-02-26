export const config = { runtime: 'edge' };

const DEFAULT_SEC_USER_AGENT = 'SECFinExtractor/1.0 (contact@example.com)';

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/sec\/?/, '');
  const upstreamUrl = `https://www.sec.gov/${path}${url.search}`;

  const userAgent =
    request.headers.get('x-sec-user-agent') || DEFAULT_SEC_USER_AGENT;

  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': userAgent,
        'Host': 'www.sec.gov',
        'Accept': request.headers.get('accept') || 'application/json',
        'Accept-Encoding': 'identity',
      },
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
      JSON.stringify({ error: 'Failed to proxy request to SEC' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
