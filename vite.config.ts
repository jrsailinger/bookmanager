import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 纯前端项目：无代理、无外部接口，所有资源本地打包
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    // 生成相对路径，保证 dist 直接用浏览器打开 / 任意子目录部署都能工作
    assetsDir: 'assets',
    chunkSizeWarningLimit: 1200,
  },
  base: './',
})
