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
  return {
    name: 'sec-proxy',
    configureServer(server) {
      server.middlewares.use(
        async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
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

          const userAgent =
            (req.headers['x-sec-user-agent'] as string) ||
            DEFAULT_SEC_USER_AGENT;

          try {
            const upstream = await fetch(`${target}${path}`, {
              headers: {
                'User-Agent': userAgent,
                Accept: (req.headers['accept'] as string) || 'application/json',
              },
            });

            res.statusCode = upstream.status;
            const contentType = upstream.headers.get('content-type');
            if (contentType) {
              res.setHeader('Content-Type', contentType);
            }
            const body = Buffer.from(await upstream.arrayBuffer());
            res.end(body);
          } catch (err) {
            console.error('[sec-proxy]', err);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Failed to proxy request to SEC' }));
          }
        },
      );
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
