import { useState, useRef, useCallback, useEffect } from 'react'
import { ArrowLeft, Play, Square, Terminal as TermIcon, History as HistoryIcon, Palette, User, Lock, Share2, Save, CloudUpload } from 'lucide-react'
import { Project } from '../../App'

import FileExplorer from './components/FileExplorer'
import StatusBar from './components/StatusBar'
import PreviewBar, { ViewportMode } from './components/PreviewBar'
import CenterTabs, { CenterView } from './components/CenterTabs'
import CodePanel from './components/CodePanel'
import RunnerLogsPanel from './components/RunnerLogsPanel'
import InspectorPanel from './components/InspectorToast'
import QuickPromptsPanel from './components/QuickPromptsPanel'
import GitHistoryModal from '../projects/components/GitHistoryModal'
import SaveVersionModal from './components/SaveVersionModal'
import PublishModal from './components/PublishModal'
import KanbanBoard from './components/tasks/KanbanBoard'
import DatabasePanel from './components/database'
import SystemPanel from './components/system'
import DesignPreviewModal from './components/DesignPreviewModal'
import UserModal from './components/UserModal'
import { generateCssFileContent } from '../studio/utils/cssParser'
import { DesignPalette } from '../studio/utils/defaultDesigns'
import IconPickerModal from './components/IconPickerModal'
import { useTerminalContext } from '../../context/TerminalContext'
import ProjectTabs from './components/ProjectTabs'
import EnvDrawer from './components/EnvDrawer'
import ShareTunnelModal from './components/ShareTunnelModal'
import { INSPECTOR_CODE } from './utils/inspectorCode'

export default function DashboardPage({
  project,
  openProjects = [],
  activeProjectId = null,
  onSelectProjectTab = () => {},
  onCloseProjectTab = () => {},
  onAddProjectTab = () => {},
  onBack
}: {
  project: Project
  openProjects?: Project[]
  activeProjectId?: string | null
  onSelectProjectTab?: (projectId: string) => void
  onCloseProjectTab?: (projectId: string) => void
  onAddProjectTab?: (project: Project) => void
  onBack: () => void
}) {
  const { drawerVisible, setDrawerVisible } = useTerminalContext()
  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [centerView, setCenterView]           = useState<CenterView>('preview')
  const [userModalOpen, setUserModalOpen]       = useState(false)
  const [designModalOpen, setDesignModalOpen]   = useState(false)
  const [envDrawerOpen, setEnvDrawerOpen]       = useState(false)
  const [shareModalOpen, setShareModalOpen]     = useState(false)

  // Atalho Ctrl+B para alternar a barra lateral
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  const [activeFile, setActiveFile]           = useState<string | null>(null)
  const [gitHistoryOpen, setGitHistoryOpen]   = useState(false)
  const [saveVersionOpen, setSaveVersionOpen] = useState(false)
  const [savingVersion, setSavingVersion]     = useState(false)
  const [explorerKey, setExplorerKey]         = useState(0)
  const [isIluminEnabled, setIsIluminEnabled] = useState(false)
  const [publishModalOpen, setPublishModalOpen] = useState(false)

  useEffect(() => {
    window.api.mcp.getState()
      .then((state) => setIsIluminEnabled(!!state['IluminMCP']?.enabled))
      .catch(() => setIsIluminEnabled(false))
  }, [])
  const [codePanelKey, setCodePanelKey]       = useState(0)
  const [gitStatusMsg, setGitStatusMsg]       = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    if (!gitStatusMsg) return
    const t = setTimeout(() => setGitStatusMsg(null), 3000)
    return () => clearTimeout(t)
  }, [gitStatusMsg])

  const handleSaveVersion = async (message: string) => {
    setSavingVersion(true)
    try {
      const result = await window.api.projects.gitCommit(project.path, message)
      if (result.noChanges) {
        setGitStatusMsg({ text: 'Nenhuma alteração para salvar.', type: 'info' })
      } else {
        setGitStatusMsg({ text: 'Versão salva com sucesso!', type: 'success' })
        setSaveVersionOpen(false)
      }
    } catch (err: any) {
      setGitStatusMsg({ text: 'Erro ao salvar versão: ' + err.message, type: 'error' })
    } finally {
      setSavingVersion(false)
    }
  }

  const handleRollback = async (hash: string) => {
    try {
      if (diffCommitHash) {
        await window.api.projects.gitStopDiffPreview(project.path, diffCommitHash)
        setDiffCommitHash(null)
        setDiffPreviewUrl(null)
      }
      await window.api.projects.gitRollback(project.path, hash)
      setGitStatusMsg({ text: 'Projeto revertido com sucesso!', type: 'success' })
      
      // Force refresh file explorer and the active file
      setExplorerKey(prev => prev + 1)
      setCodePanelKey(prev => prev + 1)
      if (activeFile) {
        const current = activeFile
        setActiveFile(null)
        setTimeout(() => setActiveFile(current), 50)
      }
    } catch (e: any) {
      setGitStatusMsg({ text: 'Erro no rollback: ' + e.message, type: 'error' })
      throw e
    }
  }

  const [diffPreviewUrl, setDiffPreviewUrl]   = useState<string | null>(null)
  const [diffCommitHash, setDiffCommitHash]   = useState<string | null>(null)
  const [diffPreviewLoading, setDiffPreviewLoading] = useState(false)
  const [diffFullScreen, setDiffFullScreen]   = useState(false)

  const handlePreview = async (hash: string) => {
    if (diffCommitHash === hash) {
      handleStopDiffPreview()
      return
    }

    if (!isRunning) {
      handleToggleRun()
    }

    setDiffCommitHash(hash)
    setDiffPreviewLoading(true)
    setCenterView('preview')
    setGitHistoryOpen(false)
    setGitStatusMsg({ text: 'Iniciando visualização comparativa da versão...', type: 'info' })

    try {
      const result = await window.api.projects.gitStartDiffPreview(project.path, hash)
      setDiffPreviewUrl(result.url)
      
      // Give a tiny timeout for Vite to boot up
      setTimeout(() => {
        setDiffPreviewLoading(false)
        setGitStatusMsg({ text: 'Comparação visual ativa!', type: 'success' })
      }, 1000)
    } catch (err: any) {
      setDiffPreviewLoading(false)
      setDiffCommitHash(null)
      setDiffPreviewUrl(null)
      setGitStatusMsg({ text: 'Erro ao carregar pré-visualização: ' + err.message, type: 'error' })
    }
  }

  const handleStopDiffPreview = async () => {
    if (!diffCommitHash) return
    const hash = diffCommitHash
    setDiffCommitHash(null)
    setDiffPreviewUrl(null)
    setDiffFullScreen(false)
    try {
      await window.api.projects.gitStopDiffPreview(project.path, hash)
      setGitStatusMsg({ text: 'Comparação de versão encerrada.', type: 'info' })
    } catch (e) {
      console.error('Failed to stop diff preview:', e)
    }
  }

  useEffect(() => {
    return () => {
      if (diffCommitHash) {
        window.api.projects.gitStopDiffPreview(project.path, diffCommitHash)
      }
    }
  }, [project.path, diffCommitHash])
  const [isRunning, setIsRunning]             = useState(false)
  const [previewReady, setPreviewReady]       = useState(false)
  const [previewUrl, setPreviewUrl]           = useState('http://localhost:5177')
  const [iframeKey, setIframeKey]             = useState(0)
  const [viewport, setViewport]               = useState<ViewportMode>('desktop')
  const [inspectorActive, setInspectorActive] = useState(false)
  const [inspectorContext, setInspectorContext] = useState<{
    fileName: string
    lineNumber: number | null
    componentName: string | null
    tagName: string | null
    visibleText: string | null
    cssClasses: string | null
    htmlContent: string | null
  } | null>(null)
  const [showIconPicker, setShowIconPicker]   = useState(false)
  const [webviewEl, setWebviewEl]             = useState<any>(null)
  const iframeRef = useRef<any>(null)
  // Path do preload do webview resolvido de forma síncrona (sem IPC)
  const webviewPreloadPath = window.api.system.webviewPreloadPath

  // Ref callback: atualiza estado quando webview monta/desmonta
  const webviewRefCallback = useCallback((el: any) => {
    iframeRef.current = el
    setWebviewEl(el)
  }, [])

  // ─── Pré-visualização de Design (paleta) ──────────────────────────────────
  // Paleta em prévia no momento (overlay ao vivo, sem gravar em disco). Null = sem prévia.
  const [previewPalette, setPreviewPalette] = useState<DesignPalette | null>(null)
  const [applyingDesign, setApplyingDesign] = useState(false)

  const buildOverrideCss = (root: Record<string, string>, dark: Record<string, string>) => {
    const toBlock = (sel: string, vars: Record<string, string>) =>
      `${sel} {\n${Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}`
    return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');\n` +
      `${toBlock(':root', root)}\n` +
      `${toBlock('.dark', Object.keys(dark).length ? dark : root)}\n` +
      `body { font-family: 'Inter', sans-serif; }`
  }

  // Injeta/atualiza um <style> de prévia dentro do app rodando (não-destrutivo).
  // Usa executeJavaScript (mais confiável que insertCSS para CSS vars).
  const injectPreviewCss = async (css: string) => {
    const wv: any = iframeRef.current
    if (!wv || typeof wv.executeJavaScript !== 'function') return
    const js = `(function(){var id='__ls_design_preview__';var el=document.getElementById(id);` +
      `if(!el){el=document.createElement('style');el.id=id;document.head.appendChild(el);}` +
      `el.textContent=${JSON.stringify(css)};})();`
    await wv.executeJavaScript(js, true).catch((e: any) => console.error('Falha ao injetar prévia:', e))
  }

  const removePreviewCss = async () => {
    const wv: any = iframeRef.current
    if (!wv || typeof wv.executeJavaScript !== 'function') return
    const js = `(function(){var el=document.getElementById('__ls_design_preview__');if(el)el.remove();})();`
    await wv.executeJavaScript(js, true).catch(() => {})
  }

  // Injeta a prévia ao vivo e fecha o modal — o estado original fica preservado
  // (o overlay é removível, o arquivo não é tocado até "Aplicar definitivamente").
  const handleDesignPreview = useCallback(async (palette: DesignPalette) => {
    setDesignModalOpen(false)
    await injectPreviewCss(buildOverrideCss(palette.root, palette.dark))
    setPreviewPalette(palette)
  }, [])

  // Cancela a prévia: remove o overlay e volta ao estado original.
  const handleDesignCancelPreview = useCallback(async () => {
    await removePreviewCss()
    setPreviewPalette(null)
  }, [])

  // Aplica definitivamente: grava no index.css (fonte de verdade). O Vite recarrega via HMR.
  const handleDesignApplyDefinitive = useCallback(async () => {
    if (!previewPalette) return
    setApplyingDesign(true)
    try {
      const css = generateCssFileContent(previewPalette.root, previewPalette.dark)
      await window.api.fs.writeFile(`${project.path}/frontend/src/index.css`, css)
      await removePreviewCss()
      setPreviewPalette(null)
      if (project.status === 'published') {
        try { await window.api.projects.updateStatus(project.id, 'modified') } catch {}
      }
      setGitStatusMsg({ text: 'Design aplicado ao projeto!', type: 'success' })
    } catch (err: any) {
      setGitStatusMsg({ text: 'Erro ao aplicar design: ' + err.message, type: 'error' })
    } finally {
      setApplyingDesign(false)
    }
  }, [previewPalette, project.path, project.id, project.status])

  // Reinjeta a prévia se o webview recarregar (HMR/refresh) enquanto há prévia ativa.
  const reinjectPreviewOnLoad = useCallback(() => {
    if (previewPalette) injectPreviewCss(buildOverrideCss(previewPalette.root, previewPalette.dark))
  }, [previewPalette])

  // Se o projeto parar / o preview deixar de estar pronto, a prévia (overlay) some junto.
  useEffect(() => {
    if (!(isRunning && previewReady) && previewPalette) {
      setPreviewPalette(null)
    }
  }, [isRunning, previewReady, previewPalette])

  const lastMouseMoveRef = useRef<number>(0)

  // Executa JS diretamente dentro do webview (mais confiável que IPC bridge)
  const execInWebview = useCallback((code: string): Promise<any> => {
    const wv: any = iframeRef.current
    if (!wv || typeof wv.executeJavaScript !== 'function') return Promise.resolve(null)
    try {
      if (typeof wv.isDestroyed === 'function' && wv.isDestroyed()) return Promise.resolve(null)
      return wv.executeJavaScript(code, true).catch(() => null)
    } catch {
      return Promise.resolve(null)
    }
  }, [])

  // ESC desativa o inspector
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && inspectorActive) {
        setInspectorActive(false)
        execInWebview('window.__nikainspector?.disable()')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inspectorActive, execInWebview])

  // Garante que o inspector está injetado no webview
  const ensureInspectorInjected = useCallback(async () => {
    const exists = await execInWebview('typeof window.__nikainspector !== "undefined"')
    if (!exists) await execInWebview(INSPECTOR_CODE)
  }, [execInWebview])

  const toggleInspector = async () => {
    const next = !inspectorActive
    setInspectorActive(next)
    if (next) {
      await ensureInspectorInjected()
      execInWebview('window.__nikainspector?.enable()')
      setInspectorContext(null)
    } else {
      execInWebview('window.__nikainspector?.disable()')
    }
  }

  // Altera a classe de ícone fisicamente no arquivo
  const handleSelectIcon = async (newIconClass: string) => {
    if (!inspectorContext) return
    const { fileName, cssClasses, lineNumber } = inspectorContext
    if (!cssClasses) return

    const oldIconClass = cssClasses.split(/\s+/).find(c => c.startsWith('ri-'))
    if (!oldIconClass) {
      setGitStatusMsg({ text: 'Nenhum ícone Remix correspondente encontrado no elemento.', type: 'error' })
      return
    }

    try {
      const content: string = await window.api.fs.readFile(fileName)
      const lines = content.split('\n')
      
      const foundIdx = findLineWithIconText(lines, oldIconClass, lineNumber ?? 1)
      if (foundIdx === -1) {
        throw new Error(`Ícone "${oldIconClass}" não foi encontrado no arquivo de código.`)
      }

      // Substitui somente a classe do ícone
      lines[foundIdx] = lines[foundIdx].replace(oldIconClass, newIconClass)
      await window.api.fs.writeFile(fileName, lines.join('\n'))

      setGitStatusMsg({ text: `Ícone alterado para "${newIconClass}" com sucesso!`, type: 'success' })
      setShowIconPicker(false)
      setInspectorContext(null)
    } catch (err: any) {
      setGitStatusMsg({ text: err.message || 'Erro ao alterar ícone.', type: 'error' })
    }
  }

  // Busca linha que possui o ícone a substituir
  function findLineWithIconText(lines: string[], targetText: string, hintLine: number): number {
    const matches: number[] = []
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(targetText)) matches.push(i)
    }
    if (matches.length === 0) return -1
    if (matches.length === 1) return matches[0]
    const center = Math.max(0, hintLine - 1)
    return matches.reduce((best, idx) =>
      Math.abs(idx - center) < Math.abs(best - center) ? idx : best
    )
  }

  // Re-envia estado ao iframe quando ele recarrega
  const handleIframeLoad = useCallback(async () => {
    if (inspectorActive) {
      await ensureInspectorInjected()
      execInWebview('window.__nikainspector?.enable()')
    }
    reinjectPreviewOnLoad()
  }, [inspectorActive, execInWebview, ensureInspectorInjected, reinjectPreviewOnLoad])

  // Encaminha mousemove do overlay para o webview via executeJavaScript (throttled ~35ms)
  const handleOverlayMouseMove = useCallback((e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastMouseMoveRef.current < 35) return
    lastMouseMoveRef.current = now

    const wv = iframeRef.current
    if (!wv) return
    const rect = wv.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    execInWebview(`window.__nikainspector?.handleMouseMove(${x}, ${y})`)
  }, [execInWebview])

  // Encaminha clique do overlay e lê o resultado direto
  const handleOverlayClick = useCallback(async (e: React.MouseEvent) => {
    const wv = iframeRef.current
    if (!wv) return
    const rect = wv.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const result = await execInWebview(`window.__nikainspector?.handleClick(${x}, ${y})`)

    if (result?.type === 'found') {
      setInspectorContext({
        fileName:      result.fileName,
        lineNumber:    result.lineNumber ?? null,
        componentName: result.componentName ?? null,
        tagName:       result.tagName ?? null,
        visibleText:   result.visibleText ?? null,
        cssClasses:    result.cssClasses ?? null,
        htmlContent:   result.htmlContent ?? null,
      })
      setInspectorActive(false)
      execInWebview('window.__nikainspector?.disable()')
    } else if (result?.type === 'no_source') {
      const el = document.getElementById('__ls_inspector_banner__')
      if (el) { el.classList.add('animate-bounce'); setTimeout(() => el.classList.remove('animate-bounce'), 600) }
    }
  }, [execInWebview])

  const handleToggleRun = async () => {
    if (isRunning) {
      await window.api.runner.stop(project.path)
      setIsRunning(false)
      setPreviewReady(false)
      if (diffCommitHash) {
        await handleStopDiffPreview()
      }
    } else {
      setPreviewReady(false)
      setIsRunning(true)
      await window.api.runner.start(project.path)
    }
  }

  const handleAutologin = () => {
    const webview = iframeRef.current as any
    if (webview && typeof webview.executeJavaScript === 'function') {
      webview.executeJavaScript(`
        (() => {
          const setReactValue = (el, val) => {
            if (!el) return;
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            if (setter) {
              setter.call(el, val);
              el.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              el.value = val;
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          };

          const emailInput = document.querySelector('input[type="email"], #email');
          const passwordInput = document.querySelector('input[type="password"], #password');
          const submitButton = document.querySelector('button[type="submit"]');

          if (emailInput && passwordInput && submitButton) {
            setReactValue(emailInput, 'nika@test.com');
            setReactValue(passwordInput, 'nika123');
            
            setTimeout(() => {
              submitButton.click();
            }, 150);
          } else {
            console.error("Login fields not found");
          }
        })();
      `)
    }
  }

  // Detecta quando o Vite está pronto nos logs
  useEffect(() => {
    if (!isRunning) return
    let isReady = false
    const unsub = window.api.runner.onLog((payload: { label: string; data: string }) => {
      if (payload.label !== 'frontend') return
      if (isReady) return
      const text = payload.data
      if (text.includes('ready in') || text.includes('Local:') || text.includes('localhost:')) {
        isReady = true
        setTimeout(() => setPreviewReady(true), 800)
      }
    })
    return () => unsub()
  }, [isRunning])

  // Escuta sinal do browser-bridge para iniciar o app caso a AI invoque ferramentas de MCP de browser
  useEffect(() => {
    const unsub = window.api.runner.onStartAppSignal(() => {
      if (!isRunning) {
        handleToggleRun()
      }
    })
    return () => unsub()
  }, [isRunning, handleToggleRun])

  // Escuta sinal do browser-bridge para parar o app caso a AI invoque ferramentas de MCP de stop
  useEffect(() => {
    const unsub = window.api.runner.onStopAppSignal(() => {
      if (isRunning) {
        handleToggleRun()
      }
    })
    return () => unsub()
  }, [isRunning, handleToggleRun])

  // Escuta sinal do browser-bridge para atualizar Git/arquivos após commit via AI
  useEffect(() => {
    const unsub = window.api.runner.onGitRefreshSignal(() => {
      setExplorerKey(prev => prev + 1)
      setGitStatusMsg({ text: 'Versão salva via AI!', type: 'success' })
    })
    return () => unsub()
  }, [])

  // Recarrega o webview quando o viewport muda para aplicar o useragent de forma limpa
  useEffect(() => {
    if (previewReady && webviewEl) {
      handleRefreshPreview()
    }
  }, [viewport]) // eslint-disable-line react-hooks/exhaustive-deps

  // Console e Rede do preview são capturados no processo principal (via CDP do
  // webContents do webview) e bufferizados pelo store devtoolsLogs o tempo todo,
  // independente da aba aberta. Aqui só tratamos o inspector via ipc-message.

  // Mensagens do inspector e dom-ready — depende de webviewEl para rodar
  // somente quando a webview está de fato montada no DOM.
  useEffect(() => {
    if (!webviewEl) return

    const handleIpcMessage = (e: any) => {
      if (e.channel === 'webview-message') {
        const message = e.args[0]
        window.dispatchEvent(new MessageEvent('message', { data: message }))
      }
    }

    const handleDomReady = () => {
      handleIframeLoad()
    }

    const handleNavigate = (e: any) => {
      if (e.url) {
        setPreviewUrl(e.url)
      }
    }

    webviewEl.addEventListener('ipc-message', handleIpcMessage)
    webviewEl.addEventListener('dom-ready', handleDomReady)
    webviewEl.addEventListener('did-navigate', handleNavigate)
    webviewEl.addEventListener('did-navigate-in-page', handleNavigate)

    return () => {
      webviewEl.removeEventListener('ipc-message', handleIpcMessage)
      webviewEl.removeEventListener('dom-ready', handleDomReady)
      webviewEl.removeEventListener('did-navigate', handleNavigate)
      webviewEl.removeEventListener('did-navigate-in-page', handleNavigate)
    }
  }, [webviewEl, handleIframeLoad])

  const handleBack = async () => {
    if (diffCommitHash) {
      try {
        await window.api.projects.gitStopDiffPreview(project.path, diffCommitHash)
      } catch (e) {}
    }
    if (isRunning) await window.api.runner.stop(project.path)
    onBack()
  }

  const handleRefreshPreview = () => setIframeKey(k => k + 1)

  const handleSelectFile = (path: string) => {
    setActiveFile(path)
    setCenterView('code')
  }

  return (
    <div className="editor-root flex-1 flex flex-col h-full overflow-hidden relative">
      {/* Top Navigation */}
      <header className="editor-header backdrop-blur-sm z-20 relative">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button onClick={handleBack} className="btn-ghost p-1.5 flex-shrink-0" title="Voltar para Projetos">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`editor-icon-btn flex-shrink-0 ${!sidebarOpen ? 'active' : ''}`}
            title={sidebarOpen ? 'Recolher Barra Lateral (Ctrl+B)' : 'Expandir Barra Lateral (Ctrl+B)'}
          >
            <i className={sidebarOpen ? 'ri-sidebar-fold-line text-xs' : 'ri-sidebar-unfold-line text-xs'} />
          </button>
          <ProjectTabs
            openProjects={openProjects}
            activeProjectId={activeProjectId}
            onSelectProjectTab={onSelectProjectTab}
            onCloseProjectTab={onCloseProjectTab}
            onAddProjectTab={onAddProjectTab}
          />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2">
          <CenterTabs active={centerView} onChange={setCenterView} />
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          {isIluminEnabled && (
            <button
              onClick={() => setPublishModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
              title="Publicar na Ilumin Cloud"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              Publicar
            </button>
          )}
          <button
            onClick={handleToggleRun}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
              isRunning
                ? 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
            }`}
            title={isRunning ? 'Parar projeto' : 'Iniciar projeto'}
          >
            {isRunning ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isRunning ? 'Parar' : 'Iniciar'}
          </button>
          <div className="divider-y h-5" />
          <button
            onClick={() => setUserModalOpen(!userModalOpen)}
            disabled={!(isRunning && previewReady)}
            className={`editor-icon-btn ${userModalOpen ? 'active' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isRunning && previewReady ? 'Usuário Padrão & Autologin' : 'Inicie o projeto para configurar usuário & autologin'}
          >
            <User className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDesignModalOpen(true)}
            disabled={!(isRunning && previewReady)}
            className={`editor-icon-btn ${designModalOpen ? 'active' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isRunning && previewReady ? 'Pré-visualizar Design' : 'Inicie o projeto para pré-visualizar designs'}
          >
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShareModalOpen(!shareModalOpen)}
            disabled={!(isRunning && previewReady)}
            className={`editor-icon-btn ${shareModalOpen ? 'active' : ''} disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isRunning && previewReady ? 'Compartilhar — Link Público via Cloudflare Tunnel' : 'Inicie o projeto para compartilhar'}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setGitHistoryOpen(!gitHistoryOpen)}
            className={`editor-icon-btn ${gitHistoryOpen ? 'active' : ''}`}
            title="Histórico Git"
          >
            <HistoryIcon className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setEnvDrawerOpen(!envDrawerOpen)}
            className={`editor-icon-btn ${envDrawerOpen ? 'active' : ''}`}
            title="Variáveis de Ambiente"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setSaveVersionOpen(true)}
            className="editor-icon-btn"
            title="Salvar Versão"
          >
            <Save className="w-3.5 h-3.5" />
          </button>


          <button
            onClick={() => setDrawerVisible(!drawerVisible)}
            className={`editor-icon-btn ${drawerVisible ? 'active' : ''}`}
            title="Terminal"
          >
            <TermIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>



      {isRunning && !previewReady && (
        <div className="h-0.5 flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--surface-overlay)' }}>
          <div className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 animate-[shimmer_2s_ease-in-out_infinite]"
            style={{ backgroundSize: '200% 100%', width: '100%' }} />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Floating Expand Handle when sidebar is closed */}
        {!sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(true)}
            className="absolute left-0 top-0 bottom-0 w-1.5 hover:w-3.5 hover:bg-blue-600/10 hover:border-blue-500/40 cursor-pointer flex items-center justify-center transition-all duration-200 z-35 group"
            style={{ borderRight: '1px solid var(--line-subtle)' }}
            title="Expandir Barra Lateral"
          >
            <i className="ri-arrow-right-s-line text-[10px] tx-faint group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all" />
          </div>
        )}

        <div
          className={`editor-sidebar flex-col transition-all duration-300 ${
            sidebarOpen ? 'w-60 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
          }`}
        >
          <FileExplorer key={`explorer-${explorerKey}`} projectPath={project.path} onSelectFile={handleSelectFile} />
          <QuickPromptsPanel />
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
          <div className="flex-1 flex flex-col min-h-0 relative">
            {/* View de Tarefas */}
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{ display: centerView === 'tasks' ? 'flex' : 'none' }}
            >
              <KanbanBoard projectPath={project.path} />
            </div>

            {/* View de Preview */}
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{ display: centerView === 'preview' ? 'flex' : 'none' }}
            >
              {isRunning && previewReady ? (
                <>
                  <PreviewBar
                    url={previewUrl}
                    onUrlChange={setPreviewUrl}
                    onRefresh={handleRefreshPreview}
                    onHome={() => setPreviewUrl('http://localhost:5177')}
                    onOpenExternal={url => window.api.system.openUrl(url)}
                    viewport={viewport}
                    onViewportChange={setViewport}
                    inspectorActive={inspectorActive}
                    onToggleInspector={toggleInspector}
                  />
                  <div className="flex-1 flex w-full min-h-0 overflow-hidden relative" style={{ backgroundColor: 'var(--surface-base)' }}>
                    {diffPreviewUrl ? (
                      <div className="absolute inset-0 flex" style={{ borderColor: 'var(--line)' }}>
                        {/* Left Side: Current local version */}
                        {!diffFullScreen && (
                          <div className="flex-1 flex flex-col min-h-0 min-w-0">
                            <div className="h-7 px-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider select-none shrink-0 tx-muted"
                              style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
                              <span>Versão Atual (Edição)</span>
                              <span className="text-[9px] tx-faint font-mono">Porta 5177</span>
                            </div>
                            <div className="flex-1 w-full relative overflow-hidden" style={{ backgroundColor: 'var(--surface-overlay)' }}>
                              {/* @ts-ignore */}
                              <webview
                                ref={webviewRefCallback}
                                key={iframeKey}
                                src={previewUrl}
                                preload={webviewPreloadPath}
                                webpreferences="contextIsolation=no"
                                className="absolute inset-0 flex bg-white w-full h-full"
                                useragent={viewport === 'mobile' ? 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36' : undefined}
                              />
                              {/* Overlay quando inspector ativo */}
                              {inspectorActive && (
                                <div
                                  className="absolute inset-0 z-10 cursor-crosshair"
                                  onMouseMove={handleOverlayMouseMove}
                                  onClick={handleOverlayClick}
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Right Side: Diff comparison version */}
                        <div className="flex-1 flex flex-col min-h-0 min-w-0 animate-fade-in relative" style={{ borderLeft: diffFullScreen ? 'none' : '1px solid var(--line)' }}>
                          <div className="h-7 px-3 flex items-center justify-between text-[10px] text-blue-400 font-semibold uppercase tracking-wider select-none shrink-0"
                            style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'rgba(59,130,246,0.05)' }}>
                            <span className="flex items-center gap-1">
                              <i className="ri-history-line" /> Versão Histórica ({diffCommitHash?.slice(0, 7)})
                            </span>
                            <div className="flex items-center gap-3">
                              {/* Botão de Toggle FullScreen */}
                              <button
                                onClick={() => setDiffFullScreen(!diffFullScreen)}
                                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-medium transition"
                                title={diffFullScreen ? "Ver Lado a Lado" : "Ver Apenas Versão Histórica"}
                              >
                                <i className={diffFullScreen ? "ri-split-screen-line text-xs text-blue-400" : "ri-aspect-ratio-line text-xs text-blue-400"} />
                                <span className="text-[9px] tx-secondary">{diffFullScreen ? "Dividir" : "Tela Cheia"}</span>
                              </button>

                              <span className="text-[9px] tx-faint font-mono">Porta 5178</span>
                              <button 
                                onClick={handleStopDiffPreview}
                                className="btn-ghost p-0.5 rounded"
                                title="Fechar Comparação"
                              >
                                <i className="ri-close-line text-sm" />
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 w-full relative overflow-hidden" style={{ backgroundColor: 'var(--surface-overlay)' }}>
                            {diffPreviewLoading ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ backgroundColor: 'var(--surface-base)' }}>
                                <i className="ri-loader-4-line text-2xl text-blue-500 animate-spin" />
                                <span className="text-xs tx-muted font-medium">Iniciando servidor da versão anterior...</span>
                              </div>
                            ) : (
                              <>
                                {/* @ts-ignore */}
                                <webview
                                  src={diffPreviewUrl}
                                  className="absolute inset-0 w-full h-full bg-white animate-fade-in flex"
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-full flex ${viewport === 'mobile' ? 'items-center justify-center overflow-hidden' : 'items-stretch overflow-hidden'} relative`}
                        style={{ backgroundColor: 'var(--surface-base)', flex: '1 1 0', minHeight: 0 }}
                      >
                        <div
                          className="relative transition-all duration-300"
                          style={viewport === 'mobile'
                            ? { width: '412px', height: 'min(915px, calc(100% - 32px))', flexShrink: 0, border: '1px solid #27272a', borderRadius: '12px', display: 'flex', overflow: 'hidden' }
                            : { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'flex' }
                          }
                        >
                          {/* @ts-ignore */}
                          <webview
                            ref={webviewRefCallback}
                            key={iframeKey}
                            src={previewUrl}
                            preload={webviewPreloadPath}
                            webpreferences="contextIsolation=no"
                            className="bg-white w-full h-full animate-fade-in"
                            useragent={viewport === 'mobile' ? 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36' : undefined}
                          />
                          {/* Overlay quando inspector ativo */}
                          {inspectorActive && (
                            <div
                              className="absolute inset-0 z-10 cursor-crosshair"
                              onMouseMove={handleOverlayMouseMove}
                              onClick={handleOverlayClick}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prompt builder ao clicar num componente */}
                    {inspectorContext && (
                      <InspectorPanel
                        fileName={inspectorContext.fileName}
                        componentName={inspectorContext.componentName}
                        tagName={inspectorContext.tagName}
                        visibleText={inspectorContext.visibleText}
                        cssClasses={inspectorContext.cssClasses}
                        htmlContent={inspectorContext.htmlContent}
                        onDismiss={() => setInspectorContext(null)}
                        onChangeIcon={() => setShowIconPicker(true)}
                      />
                    )}

                    {/* Modal seletor de ícone */}
                    {showIconPicker && inspectorContext && (
                      <IconPickerModal
                        currentIconClass={inspectorContext.cssClasses?.split(/\s+/).find(c => c.startsWith('ri-')) ?? null}
                        onSelectIcon={handleSelectIcon}
                        onDismiss={() => setShowIconPicker(false)}
                      />
                    )}

                    {/* Banner de instrução */}
                    {inspectorActive && !inspectorContext && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-fade-in">
                        <div id="__ls_inspector_banner__" className="flex items-center gap-2 bg-blue-600/90 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/30">
                          <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse" />
                          Clique num elemento para inspecionar · Esc para cancelar
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : isRunning ? (
                <PreviewLoadingState />
              ) : (
                <PreviewIdleState onStart={handleToggleRun} />
              )}
            </div>

            {/* View de Código */}
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{ display: centerView === 'code' ? 'flex' : 'none' }}
            >
              <CodePanel
                key={`codepanel-${codePanelKey}`}
                filePath={activeFile}
                onSelectFile={() => {}}
              />
            </div>

            {/* View de Banco de Dados */}
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{ display: centerView === 'database' ? 'flex' : 'none' }}
            >
              <DatabasePanel 
                projectPath={project.path} 
                onStartApp={handleToggleRun} 
                isRunning={isRunning} 
              />
            </div>

            {/* View de Sistema / Gerenciamento */}
            <div
              className="flex-1 flex flex-col min-h-0"
              style={{ display: centerView === 'system' ? 'flex' : 'none' }}
            >
              <SystemPanel
                projectPath={project.path}
                isRunning={isRunning}
                onStopApp={() => { if (isRunning) handleToggleRun() }}
              />
            </div>


          </div>
          <RunnerLogsPanel isRunning={isRunning} projectPath={project.path} />
        </div>

        {/* Env Drawer lateral */}
        <EnvDrawer
          isOpen={envDrawerOpen}
          onClose={() => setEnvDrawerOpen(false)}
          projectPath={project.path}
        />
      </div>

      <StatusBar projectPath={project.path} isRunning={isRunning} previewUrl={previewUrl} />

      {/* Modal de Pré-visualização de Design */}
      <DesignPreviewModal
        isOpen={designModalOpen}
        onClose={() => setDesignModalOpen(false)}
        onPreview={handleDesignPreview}
      />

      {/* Banner flutuante de prévia de design ativa */}
      {previewPalette && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 pl-4 pr-2 py-2 rounded-xl border card backdrop-blur-md shadow-2xl animate-slide-up"
          style={{ borderColor: '#3b82f650' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Palette className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs tx-primary">
              Pré-visualizando <strong className="font-semibold">{previewPalette.name}</strong>
            </span>
            <div className="flex items-center gap-1 ml-1">
              {previewPalette.swatch.map((c, i) => (
                <span key={i} className="w-3 h-3 rounded-sm border border-black/20" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDesignCancelPreview}
              disabled={applyingDesign}
              className="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40"
            >
              <i className="ri-arrow-go-back-line" /> Voltar
            </button>
            <button
              onClick={handleDesignApplyDefinitive}
              disabled={applyingDesign}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 transition"
            >
              {applyingDesign
                ? <><i className="ri-loader-4-line animate-spin" /> Aplicando...</>
                : <><i className="ri-check-line" /> Aplicar definitivamente</>}
            </button>
          </div>
        </div>
      )}

      {/* Modais de Versões */}
      <SaveVersionModal
        isOpen={saveVersionOpen}
        onClose={() => setSaveVersionOpen(false)}
        onSave={handleSaveVersion}
        saving={savingVersion}
        projectPath={project.path}
      />

      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        projectPath={project.path}
        isRunning={isRunning}
        onAutologin={handleAutologin}
      />

      <ShareTunnelModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        localPort={5177}
        projectPath={project.path}
      />

      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        projectPath={project.path}
      />

      {gitHistoryOpen && (
        <GitHistoryModal
          project={project}
          isOpen={true}
          onClose={() => setGitHistoryOpen(false)}
          onRollback={handleRollback}
          onStatusChange={async () => {
            try {
              await window.api.projects.updateStatus(project.id, 'draft')
            } catch (e) {
              console.error(e)
            }
          }}
          onPreview={handlePreview}
          activePreviewHash={diffCommitHash}
        />
      )}

      {/* Local Premium Toast Notifications */}
      {gitStatusMsg && (
        <div 
          className="fixed bottom-10 right-10 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl border card backdrop-blur-md shadow-2xl animate-slide-up"
          style={{
            borderColor: gitStatusMsg.type === 'success' ? '#10b98150' : gitStatusMsg.type === 'error' ? '#ef444450' : '#3b82f650',
            color: gitStatusMsg.type === 'success' ? '#10b981' : gitStatusMsg.type === 'error' ? '#ef4444' : '#3b82f6'
          }}
        >
          <i className={gitStatusMsg.type === 'success' ? 'ri-checkbox-circle-fill text-lg' : gitStatusMsg.type === 'error' ? 'ri-error-warning-fill text-lg' : 'ri-information-fill text-lg'} />
          <span className="text-xs font-semibold tx-primary">{gitStatusMsg.text}</span>
        </div>
      )}
    </div>
  )
}

function PreviewIdleState({ onStart }: { onStart: () => void }) {
  return (
    <div className="editor-idle-state">
      <div className="p-5 rounded-2xl card">
        <Play className="w-10 h-10 tx-faint" />
      </div>
      <div>
        <h3 className="text-base font-semibold tx-secondary mb-1.5">Projeto Ocioso</h3>
        <p className="tx-muted text-xs leading-relaxed max-w-xs">
          Clique em <strong className="tx-secondary">Iniciar</strong> para executar o servidor de
          desenvolvimento e ver a visualização ao vivo.
        </p>
      </div>
      <button
        onClick={onStart}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition"
      >
        <Play className="w-3.5 h-3.5" />
        Iniciar Projeto
      </button>
    </div>
  )
}

function PreviewLoadingState() {
  return (
    <div className="editor-loading-state">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--line)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm font-semibold tx-secondary">Iniciando servidor...</p>
        <p className="text-xs tx-muted max-w-xs leading-relaxed">
          Instalando dependências e iniciando o Vite.<br />
          O preview abrirá automaticamente.
        </p>
      </div>
      <div className="flex items-center gap-2 text-[10px] tx-muted">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          npm install
        </span>
        <span className="tx-faint">→</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
          vite dev
        </span>
        <span className="tx-faint">→</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--tx-faint)' }} />
          preview
        </span>
      </div>
    </div>
  )
}
