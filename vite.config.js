import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Resend } from 'resend'

import {
  TURNSTILE_TOKEN_FIELD,
  getAllowedOrigins,
  isHoneypotTripped,
  isOriginAllowed,
  verifyTurnstileToken,
} from './netlify/shared/anti-spam.js'

/**
 * Local stand-in for netlify/functions/send-email.js. It mirrors that handler's
 * origin check and honeypot so spam defences can be exercised in development.
 *
 * The per-IP rate limit is deliberately absent: it is backed by Netlify Blobs,
 * which only exists in the Netlify runtime. Turnstile works locally through
 * Cloudflare's dummy test keys.
 */
function createResendDevPlugin(env) {
  return {
    name: 'resend-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        const send = (statusCode, payload) => {
          res.statusCode = statusCode
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }

        if (req.method !== 'POST') {
          send(405, { success: false, error: 'Method not allowed' })
          return
        }

        // Fails open when ALLOWED_ORIGINS is unset, which is the normal local case.
        if (!isOriginAllowed(req.headers, getAllowedOrigins(env))) {
          send(403, { success: false, error: 'Forbidden origin' })
          return
        }

        const requiredEnv = [
          'RESEND_API_KEY',
          'RESEND_FROM_EMAIL',
          'RESEND_TO_EMAIL',
          'TURNSTILE_SECRET_KEY',
        ]
        const missing = requiredEnv.filter((key) => !env[key])

        if (missing.length > 0) {
          send(500, {
            success: false,
            error: `Missing environment variables: ${missing.join(', ')}`,
          })
          return
        }

        const chunks = []

        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8')
            const body = rawBody ? JSON.parse(rawBody) : {}

            // Answer 200 so bots treat the submission as delivered and move on.
            if (isHoneypotTripped(body)) {
              console.warn('Contact form: honeypot tripped, discarding submission')
              send(200, { success: true })
              return
            }

            const { name, email, message } = body

            if (!name || !email || !message) {
              send(400, { success: false, error: 'Missing required fields' })
              return
            }

            const verification = await verifyTurnstileToken(
              env.TURNSTILE_SECRET_KEY,
              body[TURNSTILE_TOKEN_FIELD],
              null
            )

            if (!verification.success) {
              console.warn(
                'Contact form: Turnstile rejected submission:',
                verification.errorCodes.join(', ')
              )
              send(403, {
                success: false,
                code: 'failed_verification',
                error: 'Failed verification',
              })
              return
            }

            const resend = new Resend(env.RESEND_API_KEY)
            const { error } = await resend.emails.send({
              from: env.RESEND_FROM_EMAIL,
              to: env.RESEND_TO_EMAIL,
              reply_to: email,
              subject: `Portfolio contact from ${name}`,
              text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
            })

            if (error) {
              send(502, { success: false, error: error.message || 'Resend failed' })
              return
            }

            send(200, { success: true })
          } catch (error) {
            send(500, {
              success: false,
              error: error?.message || 'Unexpected error while sending email',
            })
          }
        })
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), createResendDevPlugin(env)],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    // Dev only. Keep the watcher and the dep scanner out of the local Python tooling (scripts/.pylib, ~9k files)
    // and build outputs: on Windows a watched dist/ folder makes `vite build` fail with EPERM.
    server: { watch: { ignored: ['**/scripts/.pylib/**', '**/dist/**', '**/dist2/**'] } },
    optimizeDeps: {
      entries: ['index.html'],
      // Dev only. The 2024 site (src/legacy) is a dynamic import, so the dep scanner never sees its packages; list them
      // here so the first switch to 2024 in `vite` dev does not trigger a dep re-optimisation and a full page reload.
      include: [
        'three',
        '@react-three/fiber',
        '@react-three/drei',
        'maath/random/dist/maath-random.esm',
        'react-parallax-tilt',
        'react-vertical-timeline-component',
        'canvas-confetti',
        '@fortawesome/react-fontawesome',
        '@fortawesome/free-solid-svg-icons',
        'react-icons/fi',
        'react-icons/lib',
      ],
    },
    build: {
      target: 'es2020',
      reportCompressedSize: true,
      // Never inline images as base64 into JS: media.js is in the entry chunk, so small avatars/logos
      // would otherwise bloat it and defeat lazy loading.
      assetsInlineLimit: 0,
      rollupOptions: {
        // Rollup cannot bundle React Server Component directives; "use client" in motion,
        // lucide-react and @number-flow/react is harmless here. Silence only that warning.
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && /use client/.test(warning.message)) return
          warn(warning)
        },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined
            // The top-level scheduler@0.21 belongs to react-reconciler (@react-three/fiber, lazy 2024 chunk only);
            // react-dom uses its own nested react-dom/node_modules/scheduler. Keep the former out of react-vendor.
            if (/[\\/]node_modules[\\/]scheduler[\\/]/.test(id) && !/[\\/]react-dom[\\/]node_modules[\\/]/.test(id)) return undefined
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
            if (/[\\/]node_modules[\\/]gsap[\\/]/.test(id)) return 'gsap'
            return undefined
          },
        },
      },
    },
  }
})
