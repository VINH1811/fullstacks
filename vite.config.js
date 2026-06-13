import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const N1_TARGET = 'https://nhom1servicen1-fyfqbkbcdnf5gegz.japanwest-01.azurewebsites.net'
const N2_TARGET = 'https://nhom2servicen2-vinh-fjabdgfkbkbrb2b4.japaneast-01.azurewebsites.net'
const N3_TARGET = 'https://btlservicen3-wl-fhfqcdcqdtcdejcu.japaneast-01.azurewebsites.net'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Gọi API qua Vite proxy để tránh lỗi CORS khi chạy frontend ở localhost:5173.
      // Frontend gọi /n1-api/Auth/login -> Vite chuyển tiếp thành https://...azurewebsites.net/api/Auth/login
      '/n1-api': {
        target: N1_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/n1-api/, '/api'),
      },
      // Nhóm 2 đã chuyển sang Azure App Service. Gọi qua proxy để tránh CORS khi chạy local.
      '/n2-api': {
        target: N2_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/n2-api/, '/api'),
      },
      '/n3-api': {
        target: N3_TARGET,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/n3-api/, '/api'),
      },
    },
  },
})
