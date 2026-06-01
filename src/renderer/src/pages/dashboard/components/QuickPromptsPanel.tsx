import { useState, useEffect } from 'react'
import { PromptTemplate } from '../../prompts/types'
import { DEFAULT_PROMPTS } from '../../prompts/utils/defaultPrompts'
import PromptUseModal from '../../prompts/components/PromptUseModal'

export default function QuickPromptsPanel() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>(DEFAULT_PROMPTS)
  const [isExpanded, setIsExpanded] = useState(true)
  const [useOpen, setUseOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<PromptTemplate | null>(null)

  const loadPrompts = async () => {
    if (!window.api?.prompts) return
    try {
      const customList = await window.api.prompts.list()
      const customWithProps = customList.map((p: PromptTemplate) => ({
        ...p,
        isDefault: false
      }))
      setPrompts([...DEFAULT_PROMPTS, ...customWithProps])
    } catch (err) {
      console.error('Erro ao carregar prompts na barra lateral:', err)
    }
  }

  useEffect(() => {
    loadPrompts()
  }, [])

  const handleSelect = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt)
    setUseOpen(true)
  }

  return (
    <div className="editor-quickprompts">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="editor-quickprompts-header"
      >
        <div className="flex items-center gap-1.5">
          <i className="ri-sparkles-line text-blue-400 text-xs" />
          <span className="text-[10px] font-semibold uppercase tracking-widest">
            Prompts Rápidos
          </span>
        </div>
        <i
          className={`ri-arrow-down-s-line text-xs transition-transform duration-200 ${
            isExpanded ? 'rotate-0' : 'rotate-180'
          }`}
        />
      </button>

      {/* Prompts list */}
      {isExpanded && (
        <div className="max-h-[220px] overflow-y-auto p-2 space-y-1.5">
          {prompts.length === 0 ? (
            <div className="text-[10px] tx-muted text-center py-4 italic">
              Nenhum prompt disponível
            </div>
          ) : (
            prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handleSelect(prompt)}
                className="editor-prompt-item group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tx-secondary truncate max-w-[150px] group-hover:text-blue-400 transition-colors">
                    {prompt.name}
                  </span>
                  {prompt.isDefault && (
                    <span className="text-[8px] px-1 rounded tx-muted border" style={{ backgroundColor: 'var(--surface-overlay)', borderColor: 'var(--line)' }}>
                      Padrão
                    </span>
                  )}
                </div>
                {prompt.description && (
                  <span className="text-[10px] tx-muted line-clamp-1">
                    {prompt.description}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Modal for variable substitution */}
      <PromptUseModal
        isOpen={useOpen}
        prompt={selectedPrompt}
        onClose={() => {
          setUseOpen(false)
          setSelectedPrompt(null)
        }}
      />
    </div>
  )
}
