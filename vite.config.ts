import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist',
      rollupTypes: true,
      tsconfigPath: './tsconfig.json'
    })
  ],
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
