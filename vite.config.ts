import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        launch: fileURLToPath(new URL('./launch.html', import.meta.url)),
        editorial: fileURLToPath(new URL('./editorial.html', import.meta.url)),
        collage: fileURLToPath(new URL('./collage.html', import.meta.url)),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/SetupTests.ts'],
    css: false,
  },
});
