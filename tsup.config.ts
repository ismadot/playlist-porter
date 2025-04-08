import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  sourcemap: true,
  clean: true,
  bundle: false,
  splitting: false,
  minify: false,
  target: 'ES2022',
  platform: 'node',
  tsconfig: './tsconfig.json',
  keepNames: true,
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.mjs',
    };
  }
});
