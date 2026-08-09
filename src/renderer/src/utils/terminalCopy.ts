import { Terminal } from '@xterm/xterm'

/**
 * Cria um menu contextual (dropdown) flutuante com a opção de copiar
 * quando o usuário selecionar texto no terminal.
 */
export function setupTerminalCopyMenu(term: Terminal, container: HTMLElement): () => void {
  let menuEl: HTMLDivElement | null = null

  const removeMenu = () => {
    if (menuEl) {
      menuEl.remove()
      menuEl = null
    }
  }

  const handleMouseUp = (e: MouseEvent) => {
    // Pequeno atraso para dar tempo ao xterm de computar a seleção
    setTimeout(() => {
      if (!term.hasSelection()) {
        removeMenu()
        return
      }

      const selection = term.getSelection()
      if (!selection || selection.trim() === '') {
        removeMenu()
        return
      }

      // Remove menu existente
      removeMenu()

      // Cria elemento do dropdown
      menuEl = document.createElement('div')
      menuEl.className = 'absolute bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-md shadow-lg py-1 px-2 text-xs flex items-center gap-1.5 cursor-pointer hover:bg-zinc-800 transition-colors z-[9999] select-none font-sans font-medium'
      
      // SVG do ícone Copiar (Lucide-like)
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-400">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
      `
      
      menuEl.innerHTML = `${svg}<span>Copiar</span>`

      // Posiciona o menu no cursor
      let x = e.clientX + 8
      let y = e.clientY - 24

      // Ajustes de tela para evitar overflow
      if (x + 100 > window.innerWidth) {
        x = window.innerWidth - 110
      }
      if (y < 0) {
        y = e.clientY + 12
      }

      menuEl.style.left = `${x}px`
      menuEl.style.top = `${y}px`
      menuEl.style.position = 'fixed'

      // Ação do clique
      menuEl.addEventListener('click', (clickEvent) => {
        clickEvent.stopPropagation()
        clickEvent.preventDefault()
        navigator.clipboard.writeText(selection)
        term.clearSelection()
        removeMenu()
      })

      document.body.appendChild(menuEl)
    }, 30)
  }

  // Fecha o menu ao clicar fora
  const handleDocumentClick = (e: MouseEvent) => {
    if (menuEl && !menuEl.contains(e.target as Node)) {
      removeMenu()
    }
  }

  // Remove o menu se a seleção for limpa
  const handleSelectionChange = () => {
    setTimeout(() => {
      if (!term.hasSelection()) {
        removeMenu()
      }
    }, 50)
  }

  // Remove o menu se o usuário digitar algo
  const keyDisposable = term.onKey(() => {
    removeMenu()
  })

  container.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousedown', handleDocumentClick)
  const selectionDisposable = term.onSelectionChange(handleSelectionChange)

  return () => {
    removeMenu()
    container.removeEventListener('mouseup', handleMouseUp)
    document.removeEventListener('mousedown', handleDocumentClick)
    keyDisposable.dispose()
    selectionDisposable.dispose()
  }
}
