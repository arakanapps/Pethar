import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function generate404FallbackPlugin(): Plugin {
  return {
    name: 'generate-404-fallback',
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist')
        const indexHtml = path.resolve(distDir, 'index.html')
        const notFoundHtml = path.resolve(distDir, '404.html')

        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml)
        }
      } catch (err) {
        console.warn('Notice: Could not copy 404.html fallback:', err)
      }
    }
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    inspectAttr(),
    react(),
    generate404FallbackPlugin()
  ],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  preview: {
    port: 3000,
    host: true,
    allowedHosts: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "framer-motion": path.resolve(__dirname, "./src/lib/framer-motion.tsx"),
    },
  },
});
