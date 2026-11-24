import { defineConfig } from 'vite'
import fs from 'node:fs'

const tokensPath = new URL('./src/styles/tokens.ts', import.meta.url)
const tokensSource = fs.readFileSync(tokensPath, 'utf8')
const globalCSS = tokensSource.match(/globalCSSString = `([\s\S]*?)`/)?.[1] || ''

export default defineConfig({
  appType: 'spa',
  publicDir: 'static',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets',
    target: 'es2020',
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  plugins: [
    {
      name: 'gatego-dev-html',
      transformIndexHtml(html) {
        return html.replace('<!-- GLOBAL_CSS -->', `<style>${globalCSS}</style>`)
      },
    },
  ],
})
