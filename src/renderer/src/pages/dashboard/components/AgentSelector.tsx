import { useState, useEffect, useRef } from 'react'
import { Agent } from '../../agents/types'
import { DEFAULT_AGENTS } from '../../agents/utils/defaultAgents'

interface AgentSelectorProps {
  projectPath: string
  activeAgent: Agent | null
  onSelectAgent: (agent: Agent) => void
}

export default function AgentSelector({ projectPath, activeAgent, onSelectAgent }: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadAgents = async () => {
      try {
        const custom = await window.api.agents.list()
        setAgents([...DEFAULT_AGENTS, ...custom])
      } catch {
        setAgents(DEFAULT_AGENTS)
      }
    }
    loadAgents()
  }, [])

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleAgentClick = async (agent: Agent) => {
    try {
      const geminiPath = `${projectPath}/GEMINI.md`
      const claudePath = `${projectPath}/CLAUDE.md`
      const agentsPath = `${projectPath}/AGENTS.md`
      await window.api.fs.writeFile(geminiPath, agent.systemInstructions)
      await window.api.fs.writeFile(claudePath, agent.systemInstructions)
      await window.api.fs.writeFile(agentsPath, agent.systemInstructions)
      onSelectAgent(agent)
      setIsOpen(false)
    } catch (err) {
      console.error('Erro ao aplicar agente:', err)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border transition text-[11px] font-medium"
        style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-secondary)' }}
        title="Selecione o Agente de IA para o projeto"
      >
        <i className="ri-robot-2-line text-blue-400 text-xs" />
        <span className="truncate max-w-[110px] tx-secondary">
          Agente: {activeAgent ? activeAgent.name : 'Carregando...'}
        </span>
        <i className={`ri-arrow-down-s-line tx-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-76 editor-dropdown max-h-[360px] overflow-y-auto">
          <div className="p-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
            <span className="text-[9px] font-semibold tx-muted uppercase tracking-widest block px-1">
              Agente de Instrução AI
            </span>
          </div>
          <div className="p-1 space-y-0.5">
            {agents.map((agent) => {
              const isActive = activeAgent?.id === agent.id
              const isExpanded = expandedAgentId === agent.id
              return (
                <div
                  key={agent.id}
                  className={`rounded-md border transition-all overflow-hidden ${
                    isActive ? 'border-blue-500/20' : 'border-transparent'
                  }`}
                  style={isActive ? { backgroundColor: 'var(--surface-overlay)' } : {}}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--surface-overlay)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = '' }}
                >
                  <div className="flex items-center justify-between p-1.5">
                    <button
                      onClick={() => handleAgentClick(agent)}
                      className="flex-1 text-left flex items-center gap-2 min-w-0 py-0.5"
                    >
                      <i className={`ri-robot-2-line text-xs ${isActive ? 'text-emerald-400' : 'tx-muted'}`} />
                      <span className={`text-[11px] truncate font-medium ${isActive ? 'text-emerald-400 font-semibold' : 'tx-secondary'}`}>
                        {agent.name}
                      </span>
                      {isActive && (
                        <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center">
                          Ativo
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setExpandedAgentId(isExpanded ? null : agent.id)}
                      className="btn-ghost p-1 rounded flex items-center justify-center"
                      title="Ver detalhes"
                    >
                      <i className={`text-xs transition-transform ${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 pt-1 space-y-1.5" style={{ borderTop: '1px solid var(--line-subtle)', backgroundColor: 'var(--surface-overlay)' }}>
                      <p className="text-[10px] leading-relaxed tx-muted">
                        {agent.description}
                      </p>
                      <div className="space-y-1">
                        <span className="text-[8px] font-semibold tx-faint uppercase tracking-wider block">
                          Instruções do Sistema:
                        </span>
                        <div className="w-full max-h-20 overflow-y-auto p-1.5 rounded font-mono text-[9px] tx-muted whitespace-pre-wrap" style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}>
                          {agent.systemInstructions}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
