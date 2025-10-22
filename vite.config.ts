import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 30000,
    open: true,
          host: '0.0.0.0',
               proxy: {
        '/api/platform': {
          // target: `${env.VITE_PROXY_TARGET_JAVA}`,
          target: `http://10.0.0.215:30714`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/platform/, '/api'),
        },
        '/api': {
          target: `http://10.0.0.215:30714`,
          changeOrigin: true,
          ws: true,
          rewrite: (path: string) => path.replace(/^\/api/, '/api'),
        },
      },
  },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
      base: '/digitalSprite',
    build: {
      outDir: 'digitalSprite',
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom', 'zustand'],
            antd: ['antd'],
          },
        },
      },
    },
});
