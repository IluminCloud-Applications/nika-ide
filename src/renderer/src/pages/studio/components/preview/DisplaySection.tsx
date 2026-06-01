import { useState } from 'react'
import { AlertCircle, ChevronDown, Loader2 } from 'lucide-react'

export default function DisplaySection() {
  const [accordionOpen, setAccordionOpen] = useState<number | null>(0)

  const faqs = [
    { q: 'Como exportar o tema?', a: 'Clique no botão "Exportar Design" no topo direito da tela.' },
    { q: 'O que o estúdio altera?', a: 'Ele altera exclusivamente as variáveis globais de CSS no arquivo index.css.' }
  ]

  const toggleAccordion = (idx: number) => {
    setAccordionOpen(accordionOpen === idx ? null : idx)
  }

  return (
    <div className="studio-card p-5 space-y-4 flex flex-col justify-between">
      <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Containers e Feedback</h3>
      
      <div className="space-y-4 flex-1">
        {/* Alert / Banner */}
        <div className="studio-alert p-3 flex gap-2.5 items-start">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-xs font-semibold block">Aviso Importante</span>
            <p className="studio-alert-text text-[10px] leading-relaxed">
              O design estúdio edita as variáveis HSL do ShadCN em tempo real no arquivo index.css.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium studio-text-muted">Perguntas Frequentes (Accordion)</label>
          <div className="space-y-1">
            {faqs.map((faq, idx) => {
              const isOpen = accordionOpen === idx
              return (
                <div key={idx} className="border studio-divider rounded-md overflow-hidden bg-[hsl(var(--muted)/0.3)]">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left text-xs font-medium"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2.5 pt-0.5 text-[10px] studio-text-muted leading-relaxed border-t studio-divider bg-[hsl(var(--muted)/0.15)]">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Skeleton & Spinner (Loading State) */}
        <div className="space-y-2 pt-2 border-t studio-divider">
          <label className="text-xs font-medium studio-text-muted block">Skeleton & Spinner (Loading)</label>
          <div className="flex items-center gap-4">
            {/* Spinner */}
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <Loader2 className="w-4 h-4 text-[hsl(var(--primary))] animate-spin" />
              <span>Carregando...</span>
            </div>
            {/* Skeleton */}
            <div className="flex-1 space-y-1.5">
              <div className="h-2 bg-[hsl(var(--muted))] rounded animate-pulse w-3/4" />
              <div className="h-1.5 bg-[hsl(var(--muted))] rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
