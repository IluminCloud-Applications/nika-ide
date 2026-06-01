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

  const { init, destroy, refresh, error } = useTerminal({
    containerRef,
    isOpen,
    projectPath,
    terminalId: tab.terminalId,
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

  // Observe container size changes using ResizeObserver to refit and refresh the terminal in real-time
  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const observer = new ResizeObserver(() => {
      // Execute the layout update inside a requestAnimationFrame to avoid loop limit errors and keep it smooth
      requestAnimationFrame(refresh)
    })

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [isOpen, refresh])

  // When the drawer width changes externally (sidebar resize), force a refit.
  // The ResizeObserver on the container handles active terminals, but this
  // covers edge cases where the observer fires before the layout is fully settled.
  useEffect(() => {
    if (!isOpen) return
    refresh()
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
