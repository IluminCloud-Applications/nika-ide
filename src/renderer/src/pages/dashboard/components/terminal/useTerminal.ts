import { useState, useRef, useCallback, useEffect } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useTerminalContext } from '../../../../context/TerminalContext'

interface UseTerminalProps {
  containerRef: React.RefObject<HTMLDivElement>
  isOpen: boolean
  projectPath: string
  terminalId: string | null
  tabId: string
  tabName: string
  initialCommand?: string
  onTerminalCreated: (id: string) => void
  onTerminalExit: () => void
}

// Track which terminalIds have already received their initialCommand
const sentInitialCommands = new Set<string>()

export default function useTerminal({
  containerRef, isOpen, projectPath, terminalId, tabId, tabName, initialCommand,
  onTerminalCreated, onTerminalExit
}: UseTerminalProps) {
  const { registerTerminal, subscribe, writeTerminal, resizeTerminal } = useTerminalContext()
  const xtermRef      = useRef<XTerm | null>(null)
  const fitRef        = useRef<FitAddon | null>(null)
  const termIdRef     = useRef<string | null>(null)
  const cleanupRef    = useRef<(() => void) | null>(null)
  const resizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const destroy = useCallback(() => {
    cleanupRef.current?.()
    cleanupRef.current = null
    xtermRef.current?.dispose()
    xtermRef.current = null
    fitRef.current = null
  }, [])

  const init = useCallback(async () => {
    if (!containerRef.current || !isOpen) return
    if (xtermRef.current) return
    setError(null)

    try {
      // Ensure the container is visible and has physical dimensions before initializing xterm.
      await new Promise<void>((resolve, reject) => {
        const check = () => {
          if (!isOpen) {
            reject(new Error('Terminal initialization cancelled'))
            return
          }
          if (containerRef.current && containerRef.current.clientWidth > 0) {
            resolve()
          } else {
            requestAnimationFrame(check)
          }
        }
        check()
      })

      let termId = terminalId
      const isNewTerminal = !termId
      const projectName = projectPath.split(/[/\\]/).pop() || 'Projeto'

      if (!termId) {
        termId = await window.api.terminal.create(projectPath)
        registerTerminal(termId, projectPath, projectName, tabId, tabName)
        onTerminalCreated(termId)
      } else {
        registerTerminal(termId, projectPath, projectName, tabId, tabName)
      }

      termIdRef.current = termId

      const term = new XTerm({
        theme: { background: '#09090b', foreground: '#e4e4e7', cursor: '#3b82f6', selectionBackground: '#3b82f644' },
        cursorBlink: true,
        fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
        fontSize: 12,
        lineHeight: 1.3,
        scrollback: 5000,
      })

      const fit = new FitAddon()
      term.loadAddon(fit)
      term.open(containerRef.current)

      requestAnimationFrame(() => {
        try {
          fit.fit()
          resizeTerminal(termId!, term.cols, term.rows)
        } catch {}
      })

      // Subscribe to global context terminal streams
      const unsubscribe = subscribe(
        termId!,
        (data: string) => term.write(data),
        () => {
          term.write('\n\r\x1b[90m[Sessão terminada]\x1b[0m')
          onTerminalExit()
        }
      )

      term.onData(data => writeTerminal(termId!, data))
      term.onResize(({ cols, rows }) => resizeTerminal(termId!, cols, rows))

      xtermRef.current   = term
      fitRef.current     = fit
      cleanupRef.current = () => { unsubscribe() }

      // Only send initialCommand once — on the very first time this terminal is created
      if (initialCommand && isNewTerminal && !sentInitialCommands.has(termId!)) {
        sentInitialCommands.add(termId!)
        setTimeout(() => {
          writeTerminal(termId!, initialCommand)
        }, 600)
      }
    } catch (err) {
      if ((err as Error).message === 'Terminal initialization cancelled') return
      console.error('Failed to init terminal:', err)
      setError((err as Error).message || 'Erro ao iniciar terminal')
    }
  }, [isOpen, projectPath, terminalId, tabId, tabName, destroy, onTerminalCreated, onTerminalExit, registerTerminal, subscribe, writeTerminal, resizeTerminal])

  // Internal helper: fit + sync PTY size + repaint
  const fitAndSync = useCallback(() => {
    const term  = xtermRef.current
    const fit   = fitRef.current
    const tId   = termIdRef.current
    if (!term || !fit) return
    try {
      fit.fit()
      if (tId) {
        resizeTerminal(tId, term.cols, term.rows)
      }
      term.scrollToBottom()
      term.refresh(0, term.rows - 1)
    } catch {}
  }, [resizeTerminal])

  // Debounced refit — called during continuous sidebar drag to avoid spam
  const refit = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    resizeTimerRef.current = setTimeout(() => {
      requestAnimationFrame(fitAndSync)
    }, 30)
  }, [fitAndSync])

  // Refresh terminal viewport
  const refresh = useCallback(() => {
    requestAnimationFrame(fitAndSync)
  }, [fitAndSync])

  // Cancel pending debounce on unmount
  useEffect(() => {
    return () => {
      if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    }
  }, [])

  return { init, destroy, refit, refresh, error }
}
