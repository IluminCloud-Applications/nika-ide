import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// [Nika] Plugin Babel que carimba `data-nikasrc="<arquivo>:<linha>"` em cada
// elemento HTML (host) do JSX durante o DEV. O inspetor de componentes do Nika
// IDE lê esse atributo direto do DOM para descobrir o arquivo/linha de origem.
function nikaSourceTagger({ types: t }) {
  return {
    name: 'nika-source-tagger',
    visitor: {
      JSXOpeningElement(p, state) {
        const node = p.node
        if (!node.loc || node.name.type !== 'JSXIdentifier') return
        const tag = node.name.name
        if (tag[0] !== tag[0].toLowerCase() || tag === 'Fragment') return
        if (node.attributes.some(a => a.type === 'JSXAttribute' && a.name && a.name.name === 'data-nikasrc')) return
        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier('data-nikasrc'),
            t.stringLiteral(`${state.filename || ''}:${node.loc.start.line}`)
          )
        )
      }
    }
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    react({
      babel: {
        plugins: command === 'serve' ? [nikaSourceTagger] : [],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5177,
    host: true,
    allowedHosts: true,
    // Same-origin in production. In dev we proxy /api to the backend so the
    // frontend never needs a VITE_API_URL and there is no CORS.
    proxy: {
      '/api': {
        target: 'http://localhost:8742',
        changeOrigin: true,
      },
    },
  },
}))
