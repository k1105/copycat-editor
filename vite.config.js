import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: {
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
    },
  },
  build: {
    outDir: '../dist',
  },
});
