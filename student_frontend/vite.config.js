import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/component'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@hook': path.resolve(__dirname, 'src/hook'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@styles': path.resolve(__dirname, 'src/assets/styles'),
    },
  },
  define: {
    global: 'window',  // 👈 global 변수를 window로 매핑하여 Vite에서 인식할 수 있도록 설정
  }
})
