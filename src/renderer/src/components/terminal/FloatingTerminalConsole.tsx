import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { useTerminalContext } from '../../context/TerminalContext'
import 'xterm/css/xterm.css'

interface FloatingTerminalConsoleProps {
  terminalId: string
  isOpen: boolean
  onTerminalExit: () => void
}

export default function FloatingTerminalConsole({
  terminalId, isOpen, onTerminalExit
}: FloatingTerminalConsoleProps) {
  const containerRef = useRef<HTMLDivElement>(null!)
  const { getSession, subscribe, writeTerminal, resizeTerminal } = useTerminalContext()
  const xtermRef = useRef<XTerm | null>(null)
  const fitRef = useRef<FitAddon | null>(null)

  useEffect(() => {
    if (!isOpen || !containerRef.current) return

    const session = getSession(terminalId)
    if (!session) return

    const term = new XTerm({
      theme: { background: '#09090b', foreground: '#e4e4e7', cursor: '#3b82f6', selectionBackground: '#3b82f644' },
      cursorBlink: true,
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      fontSize: 10,
      lineHeight: 1.2,
      scrollback: 3000,
    })

    const fit = new FitAddon()
    term.loadAddon(fit)
    term.open(containerRef.current)

    // Write historical buffer first
    term.write(session.dataBuffer)

    // Fit and resize backend PTY
    requestAnimationFrame(() => {
      try {
        fit.fit()
        resizeTerminal(terminalId, term.cols, term.rows)
      } catch {}
    })

    // Listen to backend streams
    const unsubscribe = subscribe(
      terminalId,
      (data) => term.write(data),
      () => onTerminalExit()
    )

    // User input keypresses
    term.onData((data) => {
      writeTerminal(terminalId, data)
    })

    term.onResize(({ cols, rows }) => {
      resizeTerminal(terminalId, cols, rows)
    })

    xtermRef.current = term
    fitRef.current = fit

    // Resize observer
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          fit.fit()
          resizeTerminal(terminalId, term.cols, term.rows)
        } catch {}
      })
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      unsubscribe()
      term.dispose()
      xtermRef.current = null
      fitRef.current = null
    }
  }, [isOpen, terminalId, getSession, subscribe, writeTerminal, resizeTerminal, onTerminalExit])

  return (
    <div className="w-full h-full bg-[#09090b] rounded p-1.5 overflow-hidden border border-zinc-800">
      <div ref={containerRef} className="w-full h-full min-w-0 min-h-0" />
    </div>
  )
}
