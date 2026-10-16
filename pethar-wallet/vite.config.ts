import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function mobileInstallHeadersPlugin(): Plugin {
  const applyHeaders = (req: { url?: string }, res: { setHeader: (k: string, v: string) => void }, next: () => void) => {
    const cleanUrl = (req.url || '').split('?')[0]
    if (cleanUrl.endsWith('.mobileconfig')) {
      res.setHeader('Content-Type', 'application/x-apple-aspen-config')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    } else if (cleanUrl.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive')
      res.setHeader('Content-Disposition', 'attachment; filename="Pethar.apk"')
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    } else if (cleanUrl.endsWith('.webmanifest')) {
      res.setHeader('Content-Type', 'application/manifest+json')
    }
    next()
  }

  return {
    name: 'mobile-install-headers',
    configureServer(server) {
      server.middlewares.use(applyHeaders)
    },
    configurePreviewServer(server) {
      server.middlewares.use(applyHeaders)
    },
  }
}

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
    mobileInstallHeadersPlugin(),
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
