import { useState, useEffect, useRef } from 'react'
import { Agent } from '../../agents/types'
import { DEFAULT_AGENTS } from '../../agents/utils/defaultAgents'

interface AgentSelectorProps {
  projectPath: string
}

const DEFAULT_AGENT = DEFAULT_AGENTS.find(a => a.id === 'padrao') || DEFAULT_AGENTS[0]

export default function AgentSelector({ projectPath }: AgentSelectorProps) {
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS)
  const [activeAgent, setActiveAgent] = useState<Agent>(DEFAULT_AGENT)
  const [isOpen, setIsOpen] = useState(false)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Carrega agentes personalizados além dos padrão
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

  // Ao abrir/alternar o projeto, restaura o agente persistido (ou o padrão)
  // e grava as instruções nos arquivos consumidos pelos CLIs de IA.
  useEffect(() => {
    if (!projectPath || agents.length === 0) return
    const savedId = localStorage.getItem(`terminal_active_agent:${projectPath}`)
    const agent = agents.find(a => a.id === savedId) || DEFAULT_AGENT
    const applyAgent = async () => {
      try {
        await window.api.fs.writeFile(`${projectPath}/GEMINI.md`, agent.systemInstructions)
        await window.api.fs.writeFile(`${projectPath}/CLAUDE.md`, agent.systemInstructions)
        await window.api.fs.writeFile(`${projectPath}/AGENTS.md`, agent.systemInstructions)
        setActiveAgent(agent)
      } catch (err) {
        console.error('Erro ao aplicar o agente do projeto:', err)
      }
    }
    applyAgent()
  }, [projectPath, agents])

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
      await window.api.fs.writeFile(`${projectPath}/GEMINI.md`, agent.systemInstructions)
      await window.api.fs.writeFile(`${projectPath}/CLAUDE.md`, agent.systemInstructions)
      await window.api.fs.writeFile(`${projectPath}/AGENTS.md`, agent.systemInstructions)
      localStorage.setItem(`terminal_active_agent:${projectPath}`, agent.id)
      setActiveAgent(agent)
      setIsOpen(false)
    } catch (err) {
      console.error('Erro ao aplicar agente:', err)
    }
  }

  return (
    <div className="relative min-w-0" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 max-w-full pl-1.5 pr-1.5 py-1 rounded-md transition group"
        style={{ backgroundColor: isOpen ? 'var(--line-subtle)' : 'transparent' }}
        onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--line-subtle)' }}
        onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
        title="Agente de IA — clique para alterar as instruções do projeto"
      >
        <i className="ri-robot-2-line text-blue-400 text-base flex-shrink-0 leading-none flex items-center relative -top-px" />
        <span className="text-[13px] font-semibold tx-secondary truncate max-w-[140px] leading-none">
          {activeAgent.name}
        </span>
        <i className={`ri-arrow-down-s-line tx-muted text-sm transition-transform flex-shrink-0 leading-none flex items-center ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[280px] editor-dropdown max-h-[360px] overflow-y-auto z-50">
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
