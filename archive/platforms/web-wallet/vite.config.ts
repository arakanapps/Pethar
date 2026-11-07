import path from "path"
import fs from "fs"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import { createClient } from "@supabase/supabase-js"
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


function adminApiPlugin(): Plugin {
  return {
    name: 'pethar-admin-api',
    configureServer(server) {
      const readEnvFile = (filePath: string) => {
        const result: Record<string, string> = {}
        try {
          if (!fs.existsSync(filePath)) return result
          for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
            const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/)
            if (!match) continue
            result[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim()
          }
        } catch {
          // Ignore malformed env files.
        }
        return result
      }
      const localEnv = readEnvFile(path.resolve(process.cwd(), '.env'))
      const rootEnv = readEnvFile(path.resolve(process.cwd(), '../../..', '.env'))
      const env = { ...rootEnv, ...localEnv, ...process.env }
      const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
      const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY
      const supabase = url && serviceKey ? createClient(url, serviceKey, { auth: { persistSession: false } }) : null

      if (!supabase) {
        console.warn('[admin-api] SUPABASE_SERVICE_ROLE_KEY is not set. Admin database reads will be unavailable.')
      } else if (serviceKey && !/^(sb_secret_|eyJ)/.test(serviceKey)) {
        console.warn(
          '[admin-api] SUPABASE_SERVICE_ROLE_KEY does not look like a Supabase API key. Use the secret key (sb_secret_…) or legacy service_role JWT (eyJ…) from Project Settings → API Keys — not the JWT signing key.',
        )
      }

      const json = (res: any, status: number, body: unknown) => {
        res.statusCode = status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(body))
      }

      const readBody = (req: any): Promise<any> =>
        new Promise((resolve, reject) => {
          let raw = ''
          req.on('data', (chunk: any) => (raw += chunk))
          req.on('end', () => {
            try { resolve(raw ? JSON.parse(raw) : {}) } catch (error) { reject(error) }
          })
          req.on('error', reject)
        })

      server.middlewares.use('/api/admin', async (req: any, res: any, _next: any) => {
        if (!supabase) {
          return json(res, 503, { error: 'Admin API is not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env.' })
        }

        const path = (req.url || '').split('?')[0].replace(/\/$/, '')

        try {
          if (req.method === 'GET' && path === '/signed-url') {
            const url = new URL(req.url || '', 'http://localhost')
            const objectPath = url.searchParams.get('path') || ''
            if (!objectPath) return json(res, 400, { error: 'Missing storage path.' })
            const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(objectPath, 60 * 10)
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, { url: data?.signedUrl || '' })
          }

          if (req.method === 'GET' && (path === '' || path === '/snapshot')) {
            const [users, transactions, approvals] = await Promise.all([
              supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
              supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(500),
              supabase.from('pending_approvals').select('*').order('requested_at', { ascending: false }).limit(200),
            ])
            const error = users.error || transactions.error || approvals.error
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, {
              users: users.data || [],
              transactions: transactions.data || [],
              approvals: approvals.data || [],
            })
          }

          if (req.method === 'POST' && path === '/kyc') {
            const body = await readBody(req)
            const payload: Record<string, unknown> = {
              kyc_status: body.status,
              kyc_tier: body.tier,
              updated_at: new Date().toISOString(),
            }
            if (body.reason) payload.kyc_rejection_reason = body.reason
            const { error } = await supabase.from('user_profiles').update(payload).eq('uid', body.uid)
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, { success: true })
          }

          if (req.method === 'POST' && path === '/approval') {
            const body = await readBody(req)
            const { error } = await supabase
              .from('pending_approvals')
              .update({
                status: body.status,
                reviewed_at: new Date().toISOString(),
                admin_notes: body.notes || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', body.id)
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, { success: true })
          }

          if (req.method === 'POST' && path === '/kyc-profile') {
            const body = await readBody(req)
            const allowed: Record<string, string> = {
              name: 'name',
              phone: 'phone',
              nationalIdNo: 'national_id_no',
              dob: 'dob',
              addressHouseNo: 'address_house_no',
              addressStreet: 'address_street',
              addressWard: 'address_ward',
              addressSubDistrict: 'address_sub_district',
              addressDistrict: 'address_district',
              addressProvince: 'address_province',
              addressCountry: 'address_country',
              addressPostalCode: 'address_postal_code',
            }
            const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
            for (const [key, column] of Object.entries(allowed)) {
              if (body.fields && body.fields[key] !== undefined) payload[column] = body.fields[key]
            }
            const { error } = await supabase.from('user_profiles').update(payload).eq('uid', body.uid)
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, { success: true })
          }

          if (req.method === 'POST' && path === '/freeze') {
            const body = await readBody(req)
            const { error } = await supabase
              .from('user_profiles')
              .update({
                status: body.status || 'FROZEN',
                compliance_notes: body.reason || null,
                updated_at: new Date().toISOString(),
              })
              .eq('uid', body.uid)
            if (error) return json(res, 500, { error: error.message })
            return json(res, 200, { success: true })
          }

          return json(res, 404, { error: 'Unknown admin API route.' })
        } catch (error: any) {
          return json(res, 500, { error: error?.message || 'Admin API failure.' })
        }
      })
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
    adminApiPlugin(),
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
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "motion/react", replacement: path.resolve(__dirname, "./src/lib/framer-motion.tsx") },
      { find: /^motion$/, replacement: path.resolve(__dirname, "./src/lib/framer-motion.tsx") },
      { find: "framer-motion", replacement: path.resolve(__dirname, "./src/lib/framer-motion.tsx") },
    ],
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router'],
          'icons': ['lucide-react'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
        },
      },
    },
  },
});
