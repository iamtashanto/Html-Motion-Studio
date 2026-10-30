import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/renderer'),
      '@html-motion-studio/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@html-motion-studio/renderer': path.resolve(__dirname, '../../packages/renderer/src/index.ts'),
    },
  },
  server: {
    port: 5173,
  },
});
