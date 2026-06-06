import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// [Nika] Plugin Babel que carimba `data-nikasrc="<arquivo>:<linha>"` em cada
// elemento HTML (host) do JSX durante o DEV. O inspetor de componentes do Nika
// IDE lê esse atributo direto do DOM para descobrir o arquivo/linha de origem.
//
// Necessário porque o React 19 removeu `fiber._debugSource` — antes a única
// fonte usada pelo inspetor. Sem isto o hover/clique do inspetor não funciona.
function nikaSourceTagger({ types: t }) {
  return {
    name: 'nika-source-tagger',
    visitor: {
      JSXOpeningElement(p, state) {
        const node = p.node
        if (!node.loc || node.name.type !== 'JSXIdentifier') return
        const tag = node.name.name
        // Só elementos host (lowercase) viram nós reais no DOM; ignora componentes e Fragment.
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
        // Carimba a origem apenas no servidor de desenvolvimento.
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
    allowedHosts: 'all',
  },
}))
