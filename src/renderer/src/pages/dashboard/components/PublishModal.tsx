import { useState, useEffect, useRef } from 'react'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  projectPath: string
}

interface ServerInfo {
  id: string
  name: string
  domain: string
}

export default function PublishModal({ isOpen, onClose, projectPath }: PublishModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null)
  
  // Custom dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Compose and deploy states
  const [hasCompose, setHasCompose] = useState(true)
  const [isProduction, setIsProduction] = useState(false)
  const [existingSlug, setExistingSlug] = useState<string | null>(null)
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    
    setError(null)
    setLoading(true)
    setExistingSlug(null)
    setCopiedPrompt(null)

    const initModal = async () => {
      try {
        // 1. Validar e ler o docker-compose.yml local
        try {
          const composePath = `${projectPath}/docker-compose.yml`
          const composeContent = await window.api.fs.readFile(composePath)
          setHasCompose(true)
          // Verifica se contém as labels do Traefik ou redes externas comuns da Ilumin
          const hasTraefik = composeContent.includes('traefik.enable') || 
                             composeContent.includes('traefik.docker.network') ||
                             composeContent.includes('ilumin-network')
          setIsProduction(hasTraefik)
        } catch {
          setHasCompose(false)
          setIsProduction(false)
        }

        // 2. Tentar ler o ilumin.md para ver se já possui slug configurado
        try {
          const iluminMdPath = `${projectPath}/ilumin.md`
          const iluminContent = await window.api.fs.readFile(iluminMdPath)
          const slugMatch = iluminContent.match(/slug:\s*([^\s\n\r]+)/i) || 
                            iluminContent.match(/appName:\s*([^\s\n\r]+)/i) ||
                            iluminContent.match(/app_name:\s*([^\s\n\r]+)/i)
          if (slugMatch && slugMatch[1]) {
            setExistingSlug(slugMatch[1].replace(/['"`]/g, ''))
          }
        } catch {
          // Não há ilumin.md ativo, tudo bem.
        }

        // 3. Buscar servidores ativos do IluminMCP
        const mcpState = await window.api.mcp.getState()
        const isIluminEnabled = mcpState['IluminMCP']?.enabled
        
        if (!isIluminEnabled) {
          setError('O IluminMCP não está ativo. Por favor, habilite o servidor MCP da Ilumin nas configurações para listar os servidores.')
          setLoading(false)
          return
        }

        const mcpResponse = await window.api.mcp.callIluminTool('list_servers', {})
        if (mcpResponse && mcpResponse.success && mcpResponse.result) {
          // A tool retorna os dados escapados no campo .content[0].text
          const rawText = mcpResponse.result.content?.[0]?.text
          if (rawText) {
            const parsedData = JSON.parse(rawText)
            if (parsedData.servers && Array.isArray(parsedData.servers)) {
              const mapped = parsedData.servers.map((s: any) => ({
                id: s.id,
                name: s.name || 'Servidor Sem Nome',
                domain: s.domain
              }))
              setServers(mapped)
              if (mapped.length > 0) {
                setSelectedServer(mapped[0])
              }
            }
          }
        } else {
          setError(mcpResponse?.error || 'Erro ao carregar a lista de servidores via MCP.')
        }
      } catch (err: any) {
        setError(err.message || 'Erro de comunicação ao carregar servidores.')
      } finally {
        setLoading(false)
      }
    }

    initModal()
  }, [isOpen, projectPath])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(type)
    setTimeout(() => setCopiedPrompt(null), 2500)
  }

  const getAjustarComposePrompt = () => {
    const sName = selectedServer?.name || 'Servidor'
    const sDomain = selectedServer?.domain || 'dominio.com'
    const slugInfo = existingSlug ? ` (slug atual: ${existingSlug})` : ''
    return `Por favor, ajuste o meu docker-compose.yml para produção na Ilumin Cloud. Execute a tool get_compose_guidelines para entender as regras de Traefik e redes da Ilumin. Em seguida, formate o compose corretamente. Depois que terminar de ajustar o compose, use a tool deploy_project para fazer o deploy do projeto no servidor ${sName} (domain ${sDomain})${slugInfo}. Caso encontre um arquivo ilumin.md, leia-o para reutilizar o slug/appName correto para fazer um update. Se não existir, crie-o após o deploy com as informações obtidas.`
  }

  const getDeployPrompt = () => {
    const sName = selectedServer?.name || 'Servidor'
    const sDomain = selectedServer?.domain || 'dominio.com'
    const slugArg = existingSlug ? ` usando o slug "${existingSlug}"` : ' para o deploy inicial'
    return `Estou com o docker-compose pronto para produção. Por favor, faça o deploy/update do projeto atual no servidor ${sName} (domain ${sDomain})${slugArg}. Leia o arquivo ilumin.md para obter o slug/appName atualizado e passe-o no argumento da tool deploy_project. Após terminar, atualize a data e a versão da build no ilumin.md.`
  }

  const getRevertPrompt = () => {
    return `Quero voltar a trabalhar localmente. Por favor, altere o arquivo docker-compose.yml de volta para o padrão de desenvolvimento local. Remova as labels do Traefik, remova as redes externas da Ilumin e adicione o mapeamento de portas das portas internas dos serviços (ex: expor o backend na porta 8742 e o postgres local em uma porta dedicada como 5435) para que eu possa rodar localmente pelo terminal da IDE.`
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass flex flex-col space-y-4 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2 tx-primary">
            <i className="ri-cloud-upload-line text-blue-500 text-lg" /> Publicar na Ilumin Cloud
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs tx-muted">Carregando servidores do Ilumin Cloud...</span>
          </div>
        ) : error ? (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <i className="ri-error-warning-line text-sm" /> Erro de Configuração
            </div>
            <p className="leading-relaxed">{error}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Dropdown Servidores Customizado */}
            <div className="space-y-1.5 relative text-left" ref={dropdownRef}>
              <label className="text-[11px] font-bold uppercase tracking-wider tx-muted">
                Selecione o Servidor Alvo
              </label>
              {servers.length === 0 ? (
                <div className="text-xs tx-faint p-2.5 bg-surface rounded-lg border border-line">
                  Nenhum servidor ativo encontrado.
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-xs font-medium rounded-lg px-3 py-2 border select-input outline-none focus:border-blue-500 flex items-center justify-between transition-colors hover:bg-white/5"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--tx-primary)' }}
                  >
                    <span className="truncate">
                      {selectedServer?.name} <span className="tx-muted font-normal text-[10px] ml-1">({selectedServer?.domain})</span>
                    </span>
                    <i className={`ri-arrow-down-s-line tx-muted text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-1 w-full editor-dropdown max-h-[160px] overflow-y-auto z-50 shadow-glass rounded-lg border" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
                      <div className="p-1 space-y-0.5">
                        {servers.map((s) => {
                          const isSelected = selectedServer?.id === s.id
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => {
                                setSelectedServer(s)
                                setIsDropdownOpen(false)
                              }}
                              className={`w-full text-left rounded-md px-3 py-1.5 transition-colors flex flex-col ${
                                isSelected ? 'bg-blue-500/10 text-blue-400 font-semibold border border-blue-500/25' : 'hover:bg-white/5 tx-secondary border border-transparent'
                              }`}
                            >
                              <span className="text-xs">{s.name}</span>
                              <span className="text-[9px] tx-muted font-normal">{s.domain}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Estado Compose */}
            {!hasCompose ? (
              <div 
                className="p-3 border rounded-xl text-xs flex gap-2.5"
                style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning-text)' }}
              >
                <i className="ri-alert-line text-base shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold" style={{ color: 'var(--warning-text)' }}>Nenhum docker-compose.yml detectado</div>
                  <p className="mt-0.5 leading-relaxed text-[11px]" style={{ color: 'var(--tx-secondary)' }}>
                    Para publicar, você precisa de um compose configurado. A IA pode criá-lo.
                  </p>
                </div>
              </div>
            ) : !isProduction ? (
              <div 
                className="p-3.5 border rounded-xl text-xs space-y-2"
                style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)' }}
              >
                <div className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--warning-text)' }}>
                  <i className="ri-alert-line text-sm" /> Modo Desenvolvimento
                </div>
                <p className="leading-relaxed" style={{ color: 'var(--tx-secondary)' }}>
                  Seu compose atual está configurado para Desenvolvimento Local. Para publicar na Ilumin Cloud, a IA precisa formatá-lo com as labels do Traefik.
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(getAjustarComposePrompt(), 'ajustar')}
                  className="w-full btn-primary text-xs font-semibold py-2 mt-1 flex items-center justify-center gap-1.5 rounded-lg"
                >
                  {copiedPrompt === 'ajustar' ? (
                    <>
                      <i className="ri-checkbox-circle-line" /> Copiado com sucesso!
                    </>
                  ) : (
                    <>
                      <i className="ri-file-copy-line" /> Copiar Prompt de Ajuste e Deploy
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs space-y-3">
                <div className="font-semibold flex items-center gap-1.5 text-green-300">
                  <i className="ri-checkbox-circle-line text-sm" /> Pronto para Produção
                </div>
                <p className="tx-muted leading-relaxed">
                  O docker-compose já está configurado para a Ilumin Cloud{existingSlug ? ` (App: ${existingSlug})` : ''}.
                </p>
                
                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(getDeployPrompt(), 'deploy')}
                    className="w-full btn-primary text-xs font-semibold py-2 flex items-center justify-center gap-1.5 rounded-lg"
                  >
                    {copiedPrompt === 'deploy' ? (
                      <><i className="ri-checkbox-circle-line" /> Prompt de Deploy Copiado!</>
                    ) : (
                      <><i className="ri-cloud-upload-line" /> Copiar Prompt para Publicar</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(getRevertPrompt(), 'revert')}
                    className="w-full text-xs font-medium py-2 rounded-lg transition-colors border hover:bg-white/5"
                    style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)' }}
                  >
                    {copiedPrompt === 'revert' ? (
                      <span className="text-green-400"><i className="ri-checkbox-circle-line" /> Prompt de Reversão Copiado!</span>
                    ) : (
                      <span>Voltar para Desenvolvimento Local</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
