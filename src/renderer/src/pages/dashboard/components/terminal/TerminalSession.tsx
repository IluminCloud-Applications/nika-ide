import { useEffect, useRef } from 'react'
import useTerminal from './useTerminal'
import { Tab } from './TerminalTabs'

interface TerminalSessionProps {
  projectPath: string
  tab: Tab
  isOpen: boolean
  drawerWidth: number
  onTerminalCreated: (id: string) => void
  onTerminalExit: () => void
}

export default function TerminalSession({
  projectPath, tab, isOpen, drawerWidth, onTerminalCreated, onTerminalExit
}: TerminalSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null!)

  const { init, destroy, refit, refresh, error } = useTerminal({
    containerRef,
    isOpen,
    projectPath,
    terminalId: tab.terminalId,
    tabId: tab.id,
    tabName: tab.name,
    initialCommand: tab.initialCommand,
    onTerminalCreated,
    onTerminalExit,
  })

  // Initialize on mount or when tab becomes active/open
  useEffect(() => {
    if (isOpen) {
      init()
    }
  }, [isOpen])

  // ResizeObserver: usa refit (debounced 30ms) para evitar spam durante drag
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const observer = new ResizeObserver(() => {
      refit()
    })

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isOpen, refit])

  // Quando o drawer muda de largura via drag da sidebar, aguarda o CSS estabilizar
  // com duplo requestAnimationFrame antes de refitar
  useEffect(() => {
    if (!isOpen) return
    // Dois rAF garantem que o layout CSS já calculou as dimensões finais
    requestAnimationFrame(() => {
      requestAnimationFrame(refresh)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerWidth])


  // Clean up terminal on unmount (e.g. tab closed or project switched)
  useEffect(() => {
    return () => {
      destroy()
    }
  }, [])

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-red-400 text-xs font-semibold mb-1">Erro ao iniciar terminal</p>
          <p className="tx-muted text-[10px]">{error}</p>
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full min-w-0 min-h-0" />
}
