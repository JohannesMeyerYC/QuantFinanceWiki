import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      threshold: 1024,
    }),
    visualizer({
      filename: 'stats.html',
      gzipSize: true,
      open: false,
    }),
  ],

  resolve: {
    alias: {
      lodash: 'lodash-es',
    },
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        dead_code: true,
        unused: true,
        reduce_vars: true,
      },
      format: {
        comments: false,
      },
    },

    cssCodeSplit: true,

    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
      },
    },

    sourcemap: false,
    emptyOutDir: true,
    chunkSizeWarningLimit: 500,
  },

  server: {
    hmr: {
      overlay: false,
    },
  },
});