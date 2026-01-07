import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    compression({ 
      algorithm: 'brotliCompress', 
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024 
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
        // Optimize more
        dead_code: true,
        unused: true,
      },
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router-dom')) {
              return 'vendor-router';
            }
            if (id.includes('pdf-lib') || id.includes('pdfjs-dist') || id.includes('react-pdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('katex') || id.includes('react-katex')) {
              return 'vendor-math';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            return 'vendor-utils';
          }
        },
      },
    },
  },

  optimizeDeps: {
    exclude: ['pdf-lib', 'react-pdf'], 
    include: ['react', 'react-dom'], 
  },
});