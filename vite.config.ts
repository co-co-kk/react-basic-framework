import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
export default defineConfig({
  plugins: [react()],
     server: {
      port: 51731,
      open: true,
      cors: true,
      // cors: {
      //   // origin: 'http://localhost:3000', // 主项目的地址
      //   credentials: true,
      // },
    //  headers: {
    //     'Access-Control-Allow-Origin': '*', // 不能是 *
    //     'Access-Control-Allow-Credentials': 'true',
    //   },
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: 'http://10.0.10.56:5001',
          changeOrigin: true,
          secure: false,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
});
