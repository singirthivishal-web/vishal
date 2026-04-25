import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Tell Vite not to pre-bundle pdfjs-dist — it ships as native ESM
  // and its worker must be resolved at runtime, not at build time.
  optimizeDeps: {
    exclude: ['pdfjs-dist'],
  },
  server: {
    proxy: {
      // Proxy all /api/* calls to the Express backend on port 5000
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
