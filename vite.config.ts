import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'handle-json-write',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.method === 'PUT' && req.url === '/onboarding-data.json') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                fs.writeFileSync('public/onboarding-data.json', body)
                res.statusCode = 200
                res.end('OK')
              } catch (err) {
                console.error('Failed to write file:', err)
                res.statusCode = 500
                res.end('Failed to write file')
              }
            })
          } else {
            next()
          }
        })
      }
    },
    {
      name: 'handle-activities-update',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.method === 'POST' && req.url === '/api/activities') {
            let body = ''
            req.on('data', chunk => {
              body += chunk
            })
            req.on('end', () => {
              try {
                fs.writeFileSync('public/activities.csv', body)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ message: 'Activities updated successfully' }))
              } catch (err) {
                console.error('Failed to write activities:', err)
                res.statusCode = 500
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Failed to update activities' }))
              }
            })
          } else {
            next()
          }
        })
      }
    }
  ],
  server: {
    proxy: {
      '/webhook-proxy': {
        target: 'https://webhook.site',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/webhook-proxy/, '/token')
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  }
})