import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    base: './',
    build: {
      outDir: 'src/dist',
      emptyOutDir: true,
    },
    plugins: [react(), tailwindcss()],
  }
})
