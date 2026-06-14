import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Reads events from src/data.js and bakes Schema.org MusicEvent JSON-LD into
// the static HTML. This is what Google sees when it fetches the page — much
// more reliable than client-rendered structured data.
function injectEventSchema() {
  return {
    name: 'inject-event-schema',
    async transformIndexHtml(html) {
      // Use absolute file URL to avoid Vite bundling issues
      const dataPath = resolve(process.cwd(), 'src/data.js')
      const dataUrl = pathToFileURL(dataPath).href + `?t=${Date.now()}`
      const data = await import(dataUrl)
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
