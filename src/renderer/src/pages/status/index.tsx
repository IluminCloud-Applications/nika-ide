import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2 } from 'lucide-react'
import ToolCard, { ToolStatus } from './components/ToolCard'
import InstallModal from './components/InstallModal'
import StatusHeader from './components/StatusHeader'
import StatusBanner from './components/StatusBanner'
import PageShell from '../../components/layout/PageShell'
import { TOOLS_META } from './toolsMeta'

type CheckState = Record<string, { version: string | null; installed: boolean; loading: boolean }>

export default function StatusPage() {
  const [checks, setChecks]               = useState<CheckState>({})
  const [globalLoading, setGlobalLoading]  = useState(false)
  const [aiInstalling, setAiInstalling]    = useState(false)
  const [aiDone, setAiDone]                = useState(false)
  const [modalTool, setModalTool]          = useState<ToolStatus | null>(null)
  const [installingIds, setInstallingIds]  = useState<Set<string>>(new Set())
  const [platform, setPlatform]            = useState<string | null>(null)

  const runAllChecks = useCallback(async () => {
    setGlobalLoading(true)
    setChecks(prev => {
      const next = { ...prev }
      TOOLS_META.forEach(t => { next[t.id] = { ...next[t.id], loading: true } })
      return next
    })
    try {
      const results = await window.api.system.checkTools()
      const next: CheckState = {}
      results.forEach((r: any) => {
        next[r.id] = { version: r.version, installed: r.installed, loading: false }
      })
      setChecks(next)
    } catch (e) {
      console.error(e)
    } finally {
      setGlobalLoading(false)
    }
  }, [])

  const recheckSingle = async (id: string) => {
    setChecks(prev => ({ ...prev, [id]: { ...prev[id], loading: true } }))
    try {
      const result = await window.api.system.checkTool(id)
      setChecks(prev => ({ ...prev, [id]: { version: result.version, installed: result.installed, loading: false } }))
    } catch {
      setChecks(prev => ({ ...prev, [id]: { ...prev[id], loading: false } }))
    }
  }

  const handleInstallComplete = useCallback(async (toolId: string) => {
    setInstallingIds(prev => { const next = new Set(prev); next.delete(toolId); return next })
    await recheckSingle(toolId)
  }, [])

  const handleInstallWithAI = async () => {
    const missingIds = tools.filter(t => !t.installed).map(t => t.id)
    if (!missingIds.length) return
    setAiInstalling(true)
    try {
      await window.api.system.installWithAI(missingIds)
      setAiDone(true)
      setTimeout(() => setAiDone(false), 3000)
    } catch (e) {
      console.error(e)
    } finally {
      setAiInstalling(false)
    }
  }

  useEffect(() => {
    window.api.system.getPlatform().then(setPlatform).catch(console.error)
    runAllChecks()
  }, [runAllChecks])

  const tools: ToolStatus[] = TOOLS_META
    .filter(meta => {
      if (meta.id === 'wsl') {
        return platform === 'win32'
      }
      return true
    })
    .map(meta => ({
      ...meta,
      version: checks[meta.id]?.version ?? null,
      installed: checks[meta.id]?.installed ?? false,
    }))

  const totalInstalled   = tools.filter(t => t.installed).length
  const totalMissing     = tools.filter(t => !t.installed && !checks[t.id]?.loading)
  const requiredMissing  = totalMissing.filter(t => t.required)
  const allReady         = totalMissing.length === 0 && !globalLoading
  const hasMissing       = totalMissing.length > 0 && !globalLoading

  const categories = [
    { key: 'core',    label: 'Core' },
    { key: 'runtime', label: 'Runtime' },
    { key: 'ai',      label: 'AI CLI' },
  ] as const

  return (
    <PageShell>
      <StatusHeader
        hasMissing={hasMissing}
        globalLoading={globalLoading}
        aiInstalling={aiInstalling}
        aiDone={aiDone}
        onInstallWithAI={handleInstallWithAI}
        onRunAllChecks={runAllChecks}
      />

      <StatusBanner
        globalLoading={globalLoading}
        allReady={allReady}
        totalInstalled={totalInstalled}
        totalTools={tools.length}
        totalMissing={totalMissing}
        requiredMissing={requiredMissing}
        checks={checks}
        tools={tools}
      />

      <div className="flex flex-col gap-8">
        {categories.map(({ key, label }) => {
          const catTools     = tools.filter(t => t.category === key)
          const catInstalled = catTools.filter(t => t.installed).length
          return (
            <section key={key}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-xs font-semibold tx-muted uppercase tracking-widest">{label}</h2>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--line-subtle)' }} />
                <span className="text-[11px] tx-faint flex items-center gap-1">
                  {catInstalled}/{catTools.length}
                  {catInstalled === catTools.length && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-0.5" />}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {catTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    loading={checks[tool.id]?.loading ?? globalLoading}
                    installing={installingIds.has(tool.id)}
                    onInstallClick={setModalTool}
                    onRecheck={recheckSingle}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {modalTool && (
        <InstallModal
          toolId={modalTool.id}
          toolLabel={modalTool.label}
          installUrl={modalTool.installUrl}
          isOpen={!!modalTool}
          onClose={() => setModalTool(null)}
          onInstallComplete={handleInstallComplete}
        />
      )}
    </PageShell>
  )
}
