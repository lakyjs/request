import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './lib/index.ts',
      name: 'oxios',
      fileName: 'oxios'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'lib'),
    }
  }
});
