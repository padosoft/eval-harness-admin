import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'resources/js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['resources/js/test.setup.ts'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    manifest: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        app: 'resources/js/main.tsx',
      },
    },
  },
});
