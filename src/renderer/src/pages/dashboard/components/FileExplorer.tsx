import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, RefreshCw, FolderTree, X, ChevronRight, Loader2, FolderOpen } from 'lucide-react'
import ExplorerNode, { FileItem } from './explorer/ExplorerNode'
import { getFileIcon } from './explorer/fileIcons'

interface FileExplorerProps {
  projectPath: string
  onSelectFile: (path: string) => void
}



interface SearchResult {
  path: string
  name: string
  matches: { line: number; text: string }[]
}

export default function FileExplorer({ projectPath, onSelectFile }: FileExplorerProps) {
  const [rootItems, setRootItems] = useState<FileItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null)
  const [searching, setSearching] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const loadRoot = async () => {
    try {
      const list = await window.api.fs.readDir(projectPath)
      const sorted = list.sort((a: FileItem, b: FileItem) => {
        if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
        return a.isDirectory ? -1 : 1
      })
      setRootItems(sorted)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRefreshClick = () => {
    loadRoot()
    window.dispatchEvent(new CustomEvent('fs:force-refresh'))
  }

  useEffect(() => {
    loadRoot()
    setSearchQuery('')
    setSearchResults(null)
  }, [projectPath])

  useEffect(() => {
    if (!window.api.fs.onChanged) return
    const unsubscribe = window.api.fs.onChanged((payload) => {
      const normalizedPath = payload.path.replace(/\\/g, '/')
      const normalizedProjectPath = projectPath.replace(/\\/g, '/')
      const fileDir = normalizedPath.substring(0, normalizedPath.lastIndexOf('/'))
      if (fileDir === normalizedProjectPath) {
        loadRoot()
      }
    })
    return () => unsubscribe()
  }, [projectPath])

  // Debounced search - searches both names and file contents
  const runSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    window.api.fs.searchFiles(projectPath, q.trim())
      .then((results: SearchResult[]) => setSearchResults(results))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false))
  }, [projectPath])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    if (!value.trim()) {
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    searchTimerRef.current = setTimeout(() => runSearch(value), 400)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults(null)
    setSearching(false)
  }

  const projectName = projectPath.split('/').pop() || 'Projeto'

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="editor-panel-header">
        <div className="flex items-center gap-1.5 min-w-0">
          <FolderTree className="w-3.5 h-3.5 tx-muted shrink-0" />
          <span className="text-[11px] font-semibold tx-muted uppercase tracking-widest truncate max-w-[110px]">
            {projectName}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => window.api.system.openPath(projectPath)}
            className="btn-ghost p-1 rounded hover:text-blue-400 transition"
            title="Abrir no Explorador de Arquivos"
          >
            <FolderOpen className="w-3.5 h-3.5 tx-muted" />
          </button>
          <button
            onClick={handleRefreshClick}
            className="btn-ghost p-1 rounded hover:text-blue-400 transition"
            title="Recarregar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--line-subtle)' }}>
        <div className="editor-search-input">
          {searching
            ? <Loader2 className="w-3 h-3 text-blue-400 animate-spin flex-shrink-0" />
            : <Search className="w-3 h-3 tx-faint flex-shrink-0" />
          }
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Buscar arquivo ou conteúdo..."
          />
          {searchQuery && (
            <button onClick={clearSearch} className="btn-ghost p-0 flex-shrink-0">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Tree or Search Results */}
      <div className="flex-1 overflow-y-auto py-1 px-1">
        {searchResults !== null ? (
          <SearchResultsList results={searchResults} onSelectFile={onSelectFile} />
        ) : (
          rootItems.length === 0 ? (
            <div className="text-[10px] tx-muted text-center py-6">Nenhum arquivo encontrado</div>
          ) : (
            rootItems.map(item => (
              <ExplorerNode
                key={item.path}
                item={item}
                depth={0}
                onSelectFile={onSelectFile}
              />
            ))
          )
        )}
      </div>

    </div>
  )
}

function SearchResultsList({ results, onSelectFile }: { results: SearchResult[]; onSelectFile: (p: string) => void }) {
  if (results.length === 0) {
    return <div className="text-[10px] tx-muted text-center py-6">Nenhum resultado encontrado</div>
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="px-2 py-1 text-[10px] tx-faint font-semibold uppercase tracking-widest">
        {results.length} resultado{results.length !== 1 ? 's' : ''}
      </div>
      {results.map(result => {
        const { Icon, color } = getFileIcon(result.name)
        const relPath = result.path
        const pathParts = relPath.split('/')
        const displayPath = pathParts.slice(-3, -1).join('/')
        return (
          <div key={result.path} className="rounded-[4px] overflow-hidden">
            <button
              onClick={() => onSelectFile(result.path)}
              className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left transition-colors group"
              style={{ ':hover': { backgroundColor: 'var(--surface-overlay)' } } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-overlay)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
            >
              <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-medium tx-secondary truncate">{result.name}</div>
                {displayPath && (
                  <div className="text-[10px] tx-faint truncate">{displayPath}</div>
                )}
              </div>
              <ChevronRight className="w-3 h-3 tx-faint group-hover:tx-muted flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
            {result.matches.length > 0 && (
              <div className="ml-5 mb-1" style={{ borderLeft: '2px solid rgba(59,130,246,0.3)' }}>
                {result.matches.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => onSelectFile(result.path)}
                    className="w-full flex items-start gap-1.5 px-2 py-0.5 text-left transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-overlay)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <span className="text-[10px] text-blue-400/60 font-mono flex-shrink-0 w-8 text-right">{m.line}</span>
                    <span className="text-[10px] tx-muted truncate font-mono">{m.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
