import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    open: false,
  },
  optimizeDeps: {
    include: ['playcanvas'],
  },
});
