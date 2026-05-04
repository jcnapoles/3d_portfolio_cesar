import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Resend } from 'resend'

function createResendDevPlugin(env) {
  return {
    name: 'resend-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }))
          return
        }

        const requiredEnv = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'RESEND_TO_EMAIL']
        const missing = requiredEnv.filter((key) => !env[key])

        if (missing.length > 0) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              success: false,
              error: `Missing environment variables: ${missing.join(', ')}`,
            })
          )
          return
        }

        const chunks = []

        req.on('data', (chunk) => chunks.push(chunk))
        req.on('end', async () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8')
            const body = rawBody ? JSON.parse(rawBody) : {}
            const { name, email, message } = body

            if (!name || !email || !message) {
              res.statusCode = 400
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: 'Missing required fields' }))
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
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: false, error: error.message || 'Resend failed' }))
              return
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                success: false,
                error: error?.message || 'Unexpected error while sending email',
              })
            )
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
  }
})
