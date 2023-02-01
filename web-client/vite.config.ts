import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: 'localhost',
    port: 8082
  },
  build: {
    outDir: '../web-server/dist/public'
  },
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       // https://github.com/vitejs/vite/issues/6333
  //       charset: false, 
  //       // https://stackoverflow.com/a/69234850/2110294
  //       additionalData: `@import "bootstrap/scss/bootstrap";`
  //     }
  //   }
  // },  
  plugins: [vue()],
  css: {
    devSourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
      
    }
  },
})