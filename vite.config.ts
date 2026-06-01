import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
    },
  },
  plugins: [
    react(),
    electron([
      {
        // Main process entry
        entry: 'src/main/index.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: 'dist-electron/main',
            minify: false,
            rollupOptions: {
              external: ['node-pty'],
            },
          },
        },
      },
      {
        // Preload entry
        entry: 'src/preload/index.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            minify: false,
          },
        },
      },
      {
        // Webview Preload entry
        entry: 'src/preload/webview.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            minify: false,
          },
        },
      },
      {
        // Built-in Tasks MCP server
        entry: 'src/mcp/tasks-entry.ts',
        vite: {
          build: {
            outDir: 'dist-electron/mcp',
            lib: {
              entry: 'src/mcp/tasks-entry.ts',
              formats: ['cjs'],
              fileName: () => 'tasks.js',
            },
            minify: false,
            rollupOptions: {
              external: ['@modelcontextprotocol/sdk', 'node:fs', 'node:path', 'node:child_process'],
            },
          },
        },
      },
      {
        // Built-in Browser MCP server
        entry: 'src/mcp/browser-entry.ts',
        vite: {
          build: {
            outDir: 'dist-electron/mcp',
            lib: {
              entry: 'src/mcp/browser-entry.ts',
              formats: ['cjs'],
              fileName: () => 'browser.js',
            },
            minify: false,
            rollupOptions: {
              external: ['@modelcontextprotocol/sdk', 'node:http'],
            },
          },
        },
      },
      {
        // Nika IDE MCP server
        entry: 'src/mcp/nika-entry.ts',
        vite: {
          build: {
            outDir: 'dist-electron/mcp',
            lib: {
              entry: 'src/mcp/nika-entry.ts',
              formats: ['cjs'],
              fileName: () => 'nika.js',
            },
            minify: false,
            rollupOptions: {
              external: ['@modelcontextprotocol/sdk', 'node:path', 'node:child_process'],
            },
          },
        },
      },
    ]),
    renderer(),
  ],
  server: {
    port: 3333,
  },
})
