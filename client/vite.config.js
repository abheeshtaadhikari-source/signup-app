import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Forward /api requests to Express so the browser never hits CORS issues
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
