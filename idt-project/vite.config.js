import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    proxy: {
      '/predict': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true
      },
      '/login': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/register': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/companies': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/buy': { target: 'http://127.0.0.1:5001', changeOrigin: true },
      '/user': { target: 'http://127.0.0.1:5001', changeOrigin: true }
    }
  }
})
