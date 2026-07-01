import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, normalize } from 'node:path'
import { readFileSync as readSsgRoutes } from 'node:fs'

function readSsgRoutesFile(): string[] {
  try {
    const p = resolve(process.cwd(), 'public/ssg-routes.json')
    return JSON.parse(readSsgRoutes(p, 'utf8'))
  } catch {
    return ['/']
  }
}

// Serve build-time reference data (data/**) to the dev server so pages
// can load Unihan etc. without a full SSG build. Production builds bake
// the data into HTML during SSG; the deployed site doesn't serve /data/.
function serveDataDir() {
  return {
    name: 'serve-data-dir',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url || ''
        if (!url.startsWith('/data/')) return next()
        const rel = decodeURIComponent(url.slice('/data/'.length).split('?')[0])
        const root = process.cwd()
        const abs = normalize(resolve(root, 'data', rel))
        if (!abs.startsWith(normalize(resolve(root, 'data')))) {
          res.statusCode = 403
          return res.end('forbidden')
        }
        if (!existsSync(abs)) {
          res.statusCode = 404
          return res.end('not found')
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(readFileSync(abs))
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), serveDataDir()],
  base: '/',
  ssgOptions: {
    dirStyle: 'nested',
    includedRoutes: () => readSsgRoutesFile(),
  },
})