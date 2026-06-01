import { useState, useEffect, useRef } from 'react'
import { X, Download, Monitor } from 'lucide-react'
import ChoosePhase from './install/ChoosePhase'
import InstallingPhase from './install/InstallingPhase'
import TerminalOpenedPhase from './install/TerminalOpenedPhase'
import ResultPhase from './install/ResultPhase'

interface InstallInfo {
  canAutoInstall: boolean
  command?: string | null
  url: string
  platform: string
  platformLabel: string
  interactive: boolean
}

interface InstallModalProps {
  toolId: string
  toolLabel: string
  installUrl: string
  isOpen: boolean
  onClose: () => void
  onInstallComplete: (toolId: string) => void
}

type InstallPhase = 'choose' | 'installing' | 'terminal_opened' | 'success' | 'error'

export default function InstallModal({
  toolId, toolLabel, installUrl, isOpen, onClose, onInstallComplete
}: InstallModalProps) {
  const [info, setInfo] = useState<InstallInfo | null>(null)
  const [phase, setPhase] = useState<InstallPhase>('choose')
  const [output, setOutput] = useState('')
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    setPhase('choose')
    setOutput('')
    window.api.system.getInstallInfo(toolId).then(setInfo)
  }, [isOpen, toolId])

  // Listen for inline install progress
  useEffect(() => {
    if (phase !== 'installing') return
    const unsub = window.api.system.onInstallProgress((data) => {
      if (data.toolId !== toolId) return
      if (data.data) setOutput(prev => prev + data.data)
      if (data.done) {
        setPhase(data.success ? 'success' : 'error')
        if (data.success) onInstallComplete(toolId)
      }
    })
    return unsub
  }, [phase, toolId, onInstallComplete])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  if (!isOpen) return null

  const handleAutoInstall = async () => {
    setOutput('')
    const result = await window.api.system.autoInstallTool(toolId)

    if (result.mode === 'terminal') {
      // Interactive install — terminal was opened externally
      setPhase(result.success ? 'terminal_opened' : 'error')
      if (!result.success) setOutput(result.error || 'Falha ao abrir o terminal.')
    } else {
      // Inline install — phase was already set to 'installing' by progress events
      setPhase('installing')
    }
  }

  const handleOpenSite = () => {
    window.api.system.openUrl(info?.url || installUrl)
  }

  const handleRecheckAfterTerminal = async () => {
    const result = await window.api.system.checkTool(toolId)
    if (result.installed) {
      setPhase('success')
      onInstallComplete(toolId)
    } else {
      setPhase('error')
      setOutput('Ferramenta ainda não detectada. Verifique se a instalação foi concluída no terminal.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className="relative glass-panel rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tx-primary">Instalar {toolLabel}</h2>
              {info && (
                <span className="text-xs tx-faint flex items-center gap-1">
                  <Monitor className="w-3 h-3" /> {info.platformLabel}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Phase content */}
        {phase === 'choose' && (
          <ChoosePhase info={info} onAutoInstall={handleAutoInstall} onOpenSite={handleOpenSite} />
        )}
        {phase === 'installing' && (
          <InstallingPhase output={output} outputRef={outputRef} toolLabel={toolLabel} />
        )}
        {phase === 'terminal_opened' && (
          <TerminalOpenedPhase
            toolLabel={toolLabel}
            command={info?.command || ''}
            onRecheck={handleRecheckAfterTerminal}
            onClose={onClose}
          />
        )}
        {phase === 'success' && (
          <ResultPhase success onClose={onClose} toolLabel={toolLabel} />
        )}
        {phase === 'error' && (
          <ResultPhase
            success={false}
            output={output}
            outputRef={outputRef}
            onRetry={handleAutoInstall}
            onOpenSite={handleOpenSite}
            onClose={onClose}
            toolLabel={toolLabel}
          />
        )}
      </div>
    </div>
  )
}
