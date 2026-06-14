import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { statSync } from 'node:fs'
import { resolve } from 'node:path'

// Reads events from src/data.js and bakes Schema.org MusicEvent JSON-LD into
// the static HTML. This is what Google sees when it fetches the page — much
// more reliable than client-rendered structured data.
function injectEventSchema() {
  return {
    name: 'inject-event-schema',
    async transformIndexHtml(html) {
      // Cache-bust the import so editing data.js during dev reloads fresh data.
      const dataPath = resolve(process.cwd(), 'src/data.js')
      const mtime = statSync(dataPath).mtimeMs
      const data = await import(`./src/data.js?t=${mtime}`)
      const todayIso = new Date().toISOString().slice(0, 10)
      const upcoming = data.events.filter((e) => e.date >= todayIso)
      const scripts = upcoming
        .map(
          (e) =>
            `    <script type="application/ld+json">${JSON.stringify(data.eventSchema(e))}</script>`,
        )
        .join('\n')
      return html.replace('</head>', `${scripts}\n  </head>`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectEventSchema()],
})
