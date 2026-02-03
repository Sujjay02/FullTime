import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyB4SL14ZVTbQKv9vnMX7fRKeJnHRtSLjg8'),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || 'AIzaSyB4SL14ZVTbQKv9vnMX7fRKeJnHRtSLjg8')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimize chunk splitting
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
              'lucide': ['lucide-react'],
            },
          },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable minification with esbuild (faster than terser)
        minify: isProd ? 'esbuild' : false,
        // Enable source maps for production debugging (optional)
        sourcemap: !isProd,
      },
      // Enable gzip compression hints
      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [],
      },
    };
});
