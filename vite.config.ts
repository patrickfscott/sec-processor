import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { ProxyOptions } from 'vite';
import type { ClientRequest, IncomingMessage } from 'node:http';

const DEFAULT_SEC_USER_AGENT = 'SECFinExtractor/1.0 (contact@example.com)';

/** Configure proxy to set a proper User-Agent header on outgoing requests to SEC EDGAR. */
const configureSECProxy: ProxyOptions['configure'] = (proxy) => {
  proxy.on('proxyReq', (proxyReq: ClientRequest, req: IncomingMessage) => {
    // Read the custom header from the browser request (browsers block setting User-Agent directly)
    const customUA = req.headers['x-sec-user-agent'];
    proxyReq.setHeader('User-Agent', (customUA as string) || DEFAULT_SEC_USER_AGENT);
    // Remove the internal-only custom header from the outgoing request
    proxyReq.removeHeader('x-sec-user-agent');
  });
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
      '/api/sec-data': {
        target: 'https://data.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sec-data/, ''),
        configure: configureSECProxy,
      },
      '/api/sec': {
        target: 'https://www.sec.gov',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sec/, ''),
        configure: configureSECProxy,
      },
    },
  },
});
