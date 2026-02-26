import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/anthropic/messages': {
        target: 'https://api.anthropic.com/v1/messages',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
});
