import { useState, useRef, useCallback, useEffect } from 'react'
import { useTerminalContext } from '../../../../context/TerminalContext'
import * as store from './terminalStore'

interface UseTerminalProps {
  containerRef: React.RefObject<HTMLDivElement>
  isOpen: boolean
  projectPath: string
  terminalId: string | null
  tabId: string
  tabName: string
  initialCommand?: string
}

// Track which terminalIds have already received their initialCommand
const sentInitialCommands = new Set<string>()

export default function useTerminal({
  containerRef, isOpen, projectPath, terminalId, tabId, tabName, initialCommand,
}: UseTerminalProps) {
  const { registerTerminal, writeTerminal } = useTerminalContext()
  const [error, setError] = useState<string | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Create PTY + xterm instance (if needed), then attach to container. */
  const init = useCallback(async () => {
    if (!containerRef.current || !isOpen) return
    setError(null)

    try {
      // If instance already exists, just re-attach it to the (possibly new) container
      if (store.has(tabId)) {
        store.attach(tabId, containerRef.current)
        return
      }

      // Wait for container to have physical dimensions before first create
      await new Promise<void>((resolve, reject) => {
        const check = () => {
          if (!isOpen) { reject(new Error('cancelled')); return }
          if (containerRef.current && containerRef.current.clientWidth > 0) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })

      // Don't create twice (another init() call might have resolved while we waited)
      if (store.has(tabId)) {
        store.attach(tabId, containerRef.current)
        return
      }

      // Create PTY
      let termId = terminalId
      const isNewTerminal = !termId
      const projectName = projectPath.split(/[/\\]/).pop() || 'Projeto'

      if (!termId) {
        termId = await window.api.terminal.create(projectPath)
      }
      registerTerminal(termId, projectPath, projectName, tabId, tabName)

      // Create xterm instance in the store (wires PTY data automatically)
      store.create(tabId, termId)

      // Attach to visible container
      store.attach(tabId, containerRef.current)

      // Send initial command once per terminal
      if (initialCommand && isNewTerminal && !sentInitialCommands.has(termId)) {
        sentInitialCommands.add(termId)
        setTimeout(() => writeTerminal(termId!, initialCommand), 600)
      }
    } catch (err) {
      if ((err as Error).message === 'cancelled') return
      console.error('Failed to init terminal:', err)
      setError((err as Error).message || 'Erro ao iniciar terminal')
    }
  }, [isOpen, projectPath, terminalId, tabId, tabName, initialCommand, registerTerminal, writeTerminal, containerRef])

  /** Destroy xterm instance permanently (when tab is closed). */
  const destroy = useCallback(() => {
    store.destroy(tabId)
  }, [tabId])

  /** Debounced fit — safe during drag resize. */
  const refit = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    resizeTimerRef.current = setTimeout(() => {
      requestAnimationFrame(() => store.fitSync(tabId))
    }, 30)
  }, [tabId])

  // Cancel pending timers on unmount
  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    }
  }, [])

  return { init, destroy, refit, error }
}
