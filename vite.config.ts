
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Fix: Use path.resolve('.') instead of process.cwd() to avoid TS error 'Property cwd does not exist on type Process'
    const env = loadEnv(mode, path.resolve('.'), '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: false,
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          // Fix: Use path.resolve('.') instead of process.cwd() to avoid TS error
          '@': path.resolve('.'),
        }
      }
    };
});
