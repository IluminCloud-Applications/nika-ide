import { BookOpen, X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { DocEntry } from '../types'
import ModalShell, { ModalHeader } from '../../../components/layout/ModalShell'

interface DocViewModalProps {
  isOpen: boolean
  doc: DocEntry | null
  onClose: () => void
}

export default function DocViewModal({ isOpen, doc, onClose }: DocViewModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen || !doc) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(doc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ModalShell onClose={onClose} width="max-w-3xl">
      <ModalHeader
        icon={<BookOpen className="w-4 h-4 text-sky-400" />}
        title={doc.name}
        subtitle={doc.slug}
        onClose={onClose}
      />

      <div className="flex items-center justify-between px-6 py-2 border-b" style={{ borderColor: 'var(--line)' }}>
        <p className="text-xs tx-muted">{doc.description}</p>
        <button onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border btn-ghost tx-muted"
          style={{ borderColor: 'var(--line)' }}>
          {copied ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <pre className="text-xs font-mono tx-muted leading-relaxed whitespace-pre-wrap break-words">
          {doc.content}
        </pre>
      </div>

      <div className="px-6 py-3 border-t flex justify-end" style={{ borderColor: 'var(--line)' }}>
        <button onClick={onClose} className="btn-ghost px-4 py-2">
          <X className="w-4 h-4 mr-1.5 inline" />
          Fechar
        </button>
      </div>
    </ModalShell>
  )
}
