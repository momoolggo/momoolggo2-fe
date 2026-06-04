import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    build: {
        outDir: env.VITE_OUT_DIR,
        emptyOutDir: true,
    },

    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
        '/api/mypage': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
        '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
          },
        // 2026-05-25 9건 트랙 #7 — /uploads/** 정적 이미지 (배달 완료 사진/메뉴/가게 등)
        // Gateway → main WebConfig 정적 핸들러로 라우팅. proxy 없으면 vite dev server가 404.
        '/uploads': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
        '/pic': {
        target: 'http://localhost:8080',
        }
      }
    }
  }
}
)
