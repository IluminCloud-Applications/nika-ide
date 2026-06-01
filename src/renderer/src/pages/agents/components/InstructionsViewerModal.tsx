import { useState } from 'react'
import { Bot, Clipboard, Check } from 'lucide-react'
import { Agent } from '../types'
import ModalShell, { ModalHeader, ModalFooter } from '../../../components/layout/ModalShell'

interface InstructionsViewerModalProps {
  isOpen: boolean
  agent: Agent | null
  onClose: () => void
}

export default function InstructionsViewerModal({ isOpen, agent, onClose }: InstructionsViewerModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !agent) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(agent.systemInstructions)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) { console.error('Falha ao copiar:', err) }
  }

  const lineCount = agent.systemInstructions.split('\n').length

  return (
    <ModalShell onClose={onClose} width="max-w-2xl" className="max-h-[85vh]">
      <ModalHeader
        icon={<Bot className="w-4 h-4 text-violet-400" />}
        title="System Instructions"
        subtitle={agent.name}
        onClose={onClose}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0"
        style={{ backgroundColor: 'var(--surface-base)' }}>
        <pre className="text-xs font-mono tx-secondary whitespace-pre-wrap leading-relaxed select-text">
          {agent.systemInstructions}
        </pre>
      </div>

      <ModalFooter>
        <span className="text-[10px] tx-faint mr-auto">{lineCount} linha{lineCount !== 1 ? 's' : ''}</span>
        <button onClick={onClose} className="btn-ghost px-4 py-2">Fechar</button>
        <button onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition ${
            copied ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          {copied ? <><Check className="w-3.5 h-3.5" /> Copiado!</> : <><Clipboard className="w-3.5 h-3.5" /> Copiar</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
