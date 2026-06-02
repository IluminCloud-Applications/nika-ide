import { useEffect, useRef } from 'react'
import useTerminal from './useTerminal'
import * as store from './terminalStore'
import { Tab } from './TerminalTabs'

interface TerminalSessionProps {
  projectPath: string
  tab: Tab
  isOpen: boolean
  drawerWidth: number
}

export default function TerminalSession({
  projectPath, tab, isOpen, drawerWidth,
}: TerminalSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null!)

  const { init, refit, error } = useTerminal({
    containerRef,
    isOpen,
    projectPath,
    terminalId: tab.terminalId,
    tabId: tab.id,
    tabName: tab.name,
    initialCommand: tab.initialCommand,
  })

  // Attach when visible, detach when hidden or unmounted
  useEffect(() => {
    if (isOpen) {
      init()
    }
    return () => {
      // Detach to parking div — instance stays alive
      store.detach(tab.id)
    }
  }, [isOpen, init, tab.id])

  // ResizeObserver for container size changes
  useEffect(() => {
    if (!isOpen || !containerRef.current) return
    const observer = new ResizeObserver(() => refit())
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [isOpen, refit])

  // Refit when drawer width changes via drag
  useEffect(() => {
    if (!isOpen) return
    store.fitSync(tab.id)
    setTimeout(() => store.fitSync(tab.id), 50)
  }, [drawerWidth, isOpen, tab.id])

  // Note: destroy() is NOT called on unmount — instances persist in the store.
  // Destruction happens only when a tab is explicitly removed (removeProjectTab).

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
