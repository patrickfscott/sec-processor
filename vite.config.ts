import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

const DEFAULT_SEC_USER_AGENT = 'SECFinExtractor/1.0 (contact@example.com)';

/**
 * Vite plugin that proxies SEC EDGAR requests using Node.js native fetch.
 * Bypasses Vite's built-in http-proxy to reliably set the User-Agent header
 * required by SEC's fair access policy.
 */
function secProxyPlugin(): Plugin {
  function createSecMiddleware() {
    return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
      const url = req.url;
      if (!url || !url.startsWith('/api/sec')) {
        return next();
      }

      let target: string;
      let path: string;

      // Check /api/sec-data before /api/sec (longer prefix first)
      if (url.startsWith('/api/sec-data')) {
        target = 'https://data.sec.gov';
        path = url.replace(/^\/api\/sec-data/, '');
      } else {
        target = 'https://www.sec.gov';
        path = url.replace(/^\/api\/sec/, '');
      }

      const upstreamUrl = `${target}${path}`;
      const userAgent =
        (req.headers['x-sec-user-agent'] as string) ||
        DEFAULT_SEC_USER_AGENT;

      console.log(`[sec-proxy] ${req.method} ${url} → ${upstreamUrl}`);

      // Handle async work inside a void IIFE so connect middleware doesn't
      // see a rejected promise and silently move to the next handler.
      void (async () => {
        try {
          const upstream = await fetch(upstreamUrl, {
            headers: {
              'User-Agent': userAgent,
              'Host': new URL(target).host,
              'Accept': (req.headers['accept'] as string) || 'application/json',
              'Accept-Encoding': 'identity',
            },
          });

          console.log(
            `[sec-proxy] Response: ${upstream.status} (redirected: ${upstream.redirected}, final url: ${upstream.url})`,
          );

          res.statusCode = upstream.status;
          const contentType = upstream.headers.get('content-type');
          if (contentType) {
            res.setHeader('Content-Type', contentType);
          }
          const body = Buffer.from(await upstream.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error('[sec-proxy] Fetch failed:', err);
          if (!res.headersSent) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Failed to proxy request to SEC' }));
          }
        }
      })();
    };
  }

  return {
    name: 'sec-proxy',
    configureServer(server) {
      server.middlewares.use(createSecMiddleware());
    },
    configurePreviewServer(server) {
      server.middlewares.use(createSecMiddleware());
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), secProxyPlugin()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
    },
  },
});
