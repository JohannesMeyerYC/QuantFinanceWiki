import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { compression } from 'vite-plugin-compression2';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      deleteOriginalAssets: false,
    }),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html',
    }),
  ],
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, 
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-core';
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'animations';
          }

          if (id.includes('node_modules/react-pdf') || 
              id.includes('node_modules/pdfjs-dist')) {
            return 'pdf-lib';
          }
          if (id.includes('node_modules/katex') || 
              id.includes('node_modules/react-katex')) {
            return 'math-lib';
          }

          if (id.includes('node_modules/clsx') || 
              id.includes('node_modules/tailwind-merge') ||
              id.includes('node_modules/date-fns')) {
            return 'utils';
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});