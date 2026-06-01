import { useState, useEffect } from 'react'
import { Plug2 } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { McpServer, DEFAULT_MCPS } from './types'
import McpCard from './components/McpCard'
import McpAuthModal from './components/McpAuthModal'
import McpCustomModal from './components/McpCustomModal'
import { PageHeader, FilterBar, EmptyState } from '../../components/ui/PageWidgets'

export default function McpPage() {
  const [mcps, setMcps]           = useState<McpServer[]>([])
  const [search, setSearch]       = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [syncing, setSyncing]     = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [selectedMcp, setSelectedMcp] = useState<McpServer | null>(null)
  const [mcpToEdit, setMcpToEdit] = useState<{ id: string; name: string; configText: string } | null>(null)

  const loadAllMcps = () => {
    if (!window.api?.mcp) return
    Promise.all([
      window.api.mcp.getState(),
      window.api.mcp.getCustomMcps()
    ]).then(([state, customState]) => {
      const mappedBuiltins = DEFAULT_MCPS.map(m => {
        const persisted = state[m.id]
        return persisted ? { ...m, enabled: persisted.enabled, apiKey: persisted.apiKey } : m
      })

      const mappedCustoms = Object.values(customState || {}).map((c: any) => {
        const isRemote = !!c.config?.url
        return {
          id: c.id,
          name: c.name || c.id,
          tagline: isRemote ? 'Servidor MCP Remoto' : 'Servidor MCP Local',
          description: isRemote
            ? `URL: ${c.config.url}`
            : `Comando: ${c.config.command} ${c.config.args?.join(' ') || ''}`,
          category: 'custom' as const,
          tags: isRemote ? ['remote', 'custom'] : ['local', 'custom'],
          enabled: c.enabled,
          requiresAuth: false,
          gradient: 'from-amber-600/20 to-amber-500/5',
          iconBg: 'bg-amber-500/15 border-amber-500/25',
          isCustom: true,
          configText: JSON.stringify(c.config, null, 2)
        }
      })

      setMcps([...mappedBuiltins, ...mappedCustoms])
    })
  }

  useEffect(() => {
    loadAllMcps()
  }, [])

  const handleToggle = async (mcp: McpServer) => {
    if (mcp.enabled) {
      setMcps(prev => prev.map(m => m.id === mcp.id ? { ...m, enabled: false } : m))
      setSyncing(mcp.id)
      if (window.api?.mcp) await window.api.mcp.setEnabled(mcp.id, false, mcp.apiKey)
      setSyncing(null)
    } else {
      if (mcp.requiresAuth) {
        setSelectedMcp(mcp)
        setModalOpen(true)
      } else {
        setMcps(prev => prev.map(m => m.id === mcp.id ? { ...m, enabled: true } : m))
        setSyncing(mcp.id)
        if (window.api?.mcp) await window.api.mcp.setEnabled(mcp.id, true)
        setSyncing(null)
      }
    }
  }

  const handleAuthConfirm = async (apiKey: string) => {
    if (!selectedMcp) return
    const targetId = selectedMcp.id
    setMcps(prev => prev.map(m => m.id === targetId ? { ...m, enabled: true, apiKey } : m))
    setSyncing(targetId)
    if (window.api?.mcp) await window.api.mcp.setEnabled(targetId, true, apiKey)
    setSyncing(null)
  }

  const handleEdit = (mcp: McpServer) => {
    setMcpToEdit({
      id: mcp.id,
      name: mcp.name,
      configText: mcp.configText || ''
    })
    setCustomModalOpen(true)
  }

  const handleDelete = async (mcpId: string) => {
    if (!window.api?.mcp) return
    if (confirm('Tem certeza que deseja remover este servidor MCP?')) {
      setSyncing(mcpId)
      await window.api.mcp.deleteCustomMcp(mcpId)
      setSyncing(null)
      loadAllMcps()
    }
  }

  const filtered = mcps.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.tags.some(t => t.includes(search.toLowerCase()))
    
    let matchCategory = true
    if (activeCategory === 'default') {
      matchCategory = !m.isCustom
    } else if (activeCategory === 'custom') {
      matchCategory = !!m.isCustom
    }
    
    return matchSearch && matchCategory
  })

  const enabledCount = mcps.filter(m => m.enabled).length
  const categories = [
    { key: 'all', label: 'Todos' },
    { key: 'default', label: 'Padrão' },
    { key: 'custom', label: 'Customizados' },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Model Context Protocol"
        subtitle={<>Estenda a inteligência do agente com servidores e ferramentas externas. <span className="tx-faint">{enabledCount} ativos de {mcps.length}.</span></>}
        action={{
          label: 'Adicionar MCP',
          onClick: () => { setMcpToEdit(null); setCustomModalOpen(true) }
        }}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Buscar servidor MCP ou tecnologia..." filters={categories} activeFilter={activeCategory} onFilter={setActiveCategory} />

      {filtered.length === 0
        ? <EmptyState icon={Plug2} message="Nenhum servidor MCP encontrado." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
            {filtered.map(mcp => (
              <McpCard
                key={mcp.id}
                mcp={mcp}
                onToggle={() => handleToggle(mcp)}
                onEdit={() => handleEdit(mcp)}
                onDelete={() => handleDelete(mcp.id)}
                syncing={syncing === mcp.id}
              />
            ))}
          </div>
        )
      }

      <McpAuthModal
        isOpen={modalOpen}
        mcpId={selectedMcp?.id || ''}
        mcpName={selectedMcp?.name || ''}
        initialKey={selectedMcp?.apiKey || ''}
        onClose={() => { setModalOpen(false); setSelectedMcp(null) }}
        onConfirm={handleAuthConfirm}
      />

      <McpCustomModal
        isOpen={customModalOpen}
        mcpToEdit={mcpToEdit}
        onClose={() => { setCustomModalOpen(false); setMcpToEdit(null) }}
        onConfirm={loadAllMcps}
      />
    </PageShell>
  )
}
