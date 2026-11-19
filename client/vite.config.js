import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const api = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/feed': api, '/swipe': api, '/matches': api, '/photos': api, '/reset': api }
  }
});
