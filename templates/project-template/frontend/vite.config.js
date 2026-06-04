import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// @vitejs/plugin-react já inclui @babel/plugin-transform-react-jsx-source
// automaticamente em dev mode — injeta _debugSource (fileName, lineNumber) em
// cada elemento JSX, sem precisar instalar nenhum plugin extra.
export default defineConfig({
  plugins: [react()],
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
})
