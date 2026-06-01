import { useState, useRef, useCallback, useEffect } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

interface UseTerminalProps {
  containerRef: React.RefObject<HTMLDivElement>
  isOpen: boolean
  projectPath: string
  terminalId: string | null
  initialCommand?: string
  onTerminalCreated: (id: string) => void
  onTerminalExit: () => void
}

// Track which terminalIds have already received their initialCommand
const sentInitialCommands = new Set<string>()

export default function useTerminal({
  containerRef, isOpen, projectPath, terminalId, initialCommand,
  onTerminalCreated, onTerminalExit
}: UseTerminalProps) {
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
      // This prevents the xterm canvas renderer from measuring character sizes as 0 or NaN,
      // which permanently breaks resizing for that terminal instance.
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

      if (!termId) {
        termId = await window.api.terminal.create(projectPath)
        onTerminalCreated(termId)
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
          window.api.terminal.resize(termId!, term.cols, term.rows)
        } catch {}
      })

      const cleanupData = window.api.terminal.onData(termId!, (data: string) => term.write(data))
      const cleanupExit = window.api.terminal.onExit(termId!, () => {
        term.write('\n\r\x1b[90m[Sessão terminada]\x1b[0m')
        onTerminalExit()
      })

      term.onData(data => window.api.terminal.write(termId!, data))
      term.onResize(({ cols, rows }) => window.api.terminal.resize(termId!, cols, rows))

      xtermRef.current   = term
      fitRef.current     = fit
      cleanupRef.current = () => { cleanupData(); cleanupExit() }

      // Only send initialCommand once — on the very first time this terminal is created
      if (initialCommand && isNewTerminal && !sentInitialCommands.has(termId!)) {
        sentInitialCommands.add(termId!)
        setTimeout(() => {
          window.api.terminal.write(termId!, initialCommand)
        }, 600)
      }
    } catch (err) {
      if ((err as Error).message === 'Terminal initialization cancelled') return
      console.error('Failed to init terminal:', err)
      setError((err as Error).message || 'Erro ao iniciar terminal')
    }
  }, [isOpen, projectPath, terminalId, destroy, onTerminalCreated, onTerminalExit])

  // Internal helper: fit + sync PTY size + repaint
  const fitAndSync = useCallback(() => {
    const term  = xtermRef.current
    const fit   = fitRef.current
    const tId   = termIdRef.current
    if (!term || !fit) return
    try {
      fit.fit()
      // Explicitly push the new cols/rows to the PTY process in case the
      // onResize event from xterm was missed or fired before the layout settled
      if (tId) {
        window.api.terminal.resize(tId, term.cols, term.rows)
      }
      term.scrollToBottom()
      term.refresh(0, term.rows - 1)
    } catch {}
  }, [])

  // Debounced refit — called during continuous sidebar drag to avoid spam
  const refit = useCallback(() => {
    if (resizeTimerRef.current) clearTimeout(resizeTimerRef.current)
    resizeTimerRef.current = setTimeout(() => {
      requestAnimationFrame(fitAndSync)
    }, 30)
  }, [fitAndSync])

  // Refresh terminal viewport — forces xterm to repaint its canvas.
  // This fixes the blank-screen issue when the drawer is re-opened or
  // the tab becomes visible again after being hidden.
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
