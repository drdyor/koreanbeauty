import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Performance optimizations
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          
          // Feature chunks
          'therapeutic-content': [
            './src/utils/therapeuticContent.js',
            './src/utils/expandedTherapeuticContent.js'
          ],
          'performance-utils': [
            './src/utils/performanceOptimizer.js'
          ],
          'light-frequency': [
            './src/utils/lightFrequencyEngine.js'
          ]
        },
        // Optimize chunk file names
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp3|wav|ogg|flac)$/.test(assetInfo.name)) {
            return `audio/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/.test(assetInfo.name)) {
            return `img/[name]-[hash].${ext}`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    outDir: 'build',
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (disable in production)
    sourcemap: process.env.NODE_ENV !== 'production',
  },
  server: {
    // Development server optimizations
    host: '0.0.0.0', // Allow external access
    port: 5173,
    allowedHosts: ['5173-i0lih2uk6411h7hawpzfo-bb158cf8.manusvm.computer'],
    hmr: {
      overlay: false
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react'
    ]
  },
  // Asset handling optimizations
  assetsInclude: ['**/*.wav', '**/*.mp3', '**/*.ogg'],
  
  // Define global constants for performance monitoring
  define: {
    __PERFORMANCE_MONITORING__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  }
})
