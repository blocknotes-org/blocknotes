import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  root: './src',
  assetsInclude: ['**/*.wasm', '*.data'],
  build: {
    outDir: '../dist',
    minify: false,
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
  worker: {
		format: 'es',
	},
  publicDir: '../public',
});
