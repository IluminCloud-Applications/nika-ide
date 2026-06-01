import { useState } from 'react'
import { Download, Copy, Check } from 'lucide-react'
import ModalShell, { ModalHeader, ModalFooter } from '../../../components/layout/ModalShell'

interface ExportDesignModalProps {
  isOpen: boolean
  onClose: () => void
  projectPath?: string
  rootVars: Record<string, string>
  darkVars: Record<string, string>
}

export default function ExportDesignModal({ isOpen, onClose, rootVars, darkVars }: ExportDesignModalProps) {
  const [copied, setCopied] = useState(false)

  // Gera o prompt de design para IA
  const getPromptText = () => {
    let cssVars = `:root {\n`
    Object.entries(rootVars).forEach(([k, v]) => {
      cssVars += `    ${k}: ${v};\n`
    })
    cssVars += `  }\n  .dark {\n`
    Object.entries(darkVars).forEach(([k, v]) => {
      cssVars += `    ${k}: ${v};\n`
    })
    cssVars += `  }`

    return `Por favor, atualize o tema visual do meu projeto modificando o arquivo \`frontend/src/index.css\`. 

1. Certifique-se de importar a fonte 'Inter' no início do arquivo:
\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
\`\`\`

2. Substitua as variáveis de estilo na seção @layer base (:root e .dark) para aplicar a seguinte paleta de cores e arredondamento:
\`\`\`css
${cssVars}
\`\`\`

3. Configure a classe \`body\` na seção base para aplicar a fonte 'Inter':
\`\`\`css
body {
  @apply bg-background text-foreground;
  font-family: 'Inter', sans-serif;
}
\`\`\`

Certifique-se de manter as diretrizes do Tailwind e a compatibilidade do ShadCN.`
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(getPromptText())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  return (
    <ModalShell onClose={onClose} accentColor="#3b82f6">
      <ModalHeader
        icon={<Download className="w-4 h-4 text-blue-400" />}
        title="Exportar Design"
        subtitle="Copie o prompt de design para a IA do seu projeto principal"
        onClose={onClose}
      />

      <div className="p-6 space-y-6 flex flex-col max-h-[500px] overflow-y-auto">
        <div className="space-y-3">
          <p className="text-xs tx-muted leading-relaxed">
            Copie o prompt contendo as variáveis geradas e cole no terminal da IA do seu projeto principal. A IA fará a alteração de forma correta e segura.
          </p>
          <button
            onClick={handleCopyPrompt}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full bg-[var(--surface-overlay)] hover:bg-[var(--line-subtle)] border border-[var(--line)] rounded-lg text-xs font-semibold tx-primary transition duration-150"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" /> Prompt Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-blue-400" /> Copiar Prompt de Design para IA
              </>
            )}
          </button>
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
          Fechar
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
