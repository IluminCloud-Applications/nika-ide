// Analisa o arquivo CSS e extrai as variáveis de :root e .dark
export function parseCssVariables(css: string) {
  const root: Record<string, string> = {}
  const dark: Record<string, string> = {}
  let scope: 'root' | 'dark' | null = null

  css.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed.includes(':root') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
      scope = 'root'
    } else if ((trimmed.includes('.dark') || trimmed.includes('dark:')) && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
      scope = 'dark'
    } else if (trimmed === '}') {
      scope = null
    }

    const match = trimmed.match(/^(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);?/)
    if (match && scope) {
      const [, name, val] = match
      if (scope === 'root') root[name] = val.trim()
      if (scope === 'dark') dark[name] = val.trim()
    }
  })

  return { root, dark }
}

// Injeta estilos no DOM sob a classe .studio-viewport-container
export function injectStyles(root: Record<string, string>, dark: Record<string, string>) {
  let styleEl = document.getElementById('studio-styles-inject') as HTMLStyleElement
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'studio-styles-inject'
    document.head.appendChild(styleEl)
  }

  let css = '.studio-viewport-container {\n'
  Object.entries(root).forEach(([k, v]) => {
    css += `  ${k}: ${v};\n`
  })
  css += '}\n\n.studio-viewport-container.dark {\n'
  Object.entries(dark).forEach(([k, v]) => {
    css += `  ${k}: ${v};\n`
  })
  css += '}\n'

  styleEl.innerHTML = css
}

// Reconstrói o conteúdo completo para o index.css
export function generateCssFileContent(root: Record<string, string>, dark: Record<string, string>) {
  let css = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import "tailwindcss";
@config "../tailwind.config.js";

@layer base {
  :root {
`
  Object.entries(root).forEach(([k, v]) => {
    css += `    ${k}: ${v};\n`
  })
  css += `  }
  .dark {
`
  Object.entries(dark).forEach(([k, v]) => {
    css += `    ${k}: ${v};\n`
  })
  css += `  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Inter', sans-serif;
  }
}
`
  return css
}
