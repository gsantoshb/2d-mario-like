import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => (id.includes('/phaser/') ? 'phaser' : undefined),
      },
    },
  },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
