import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
  server: {
    port: 51731,
    open: true,
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
