import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import vue from '@vitejs/plugin-vue'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd())
  const proxyTarget = env.VITE_DEV_SERVER_PROXY
  const isDevServer = command === 'serve' && mode !== 'test'

  if (isDevServer && !proxyTarget) {
    throw new Error('Missing required env: VITE_DEV_SERVER_PROXY')
  }

  return {
    base: '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, './src')
      }
    },
    server: {
      host: true,
      open: true,
      proxy: {
        '/dev-api': {
          target: proxyTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/dev-api/, '')
        }
      }
    }
  }
})
