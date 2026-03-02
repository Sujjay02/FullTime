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
        'process.env.VITE_FOOTBALL_DATA_API_KEY': JSON.stringify(env.VITE_FOOTBALL_DATA_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
              'lucide': ['lucide-react'],
            },
          },
        },
        chunkSizeWarningLimit: 1000,
        minify: isProd ? 'esbuild' : false,
        sourcemap: !isProd,
      },
      esbuild: {
        drop: isProd ? ['console', 'debugger'] : [],
      },
    };
});
