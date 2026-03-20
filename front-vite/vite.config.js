import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/login': 'http://localhost:3333',
      '/register': 'http://localhost:3333',
      '/forgot': 'http://localhost:3333',
      '/reset': 'http://localhost:3333',
      '/validate-token': 'http://localhost:3333',
    },
  },
});
