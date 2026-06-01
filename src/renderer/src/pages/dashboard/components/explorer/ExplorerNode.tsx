import { useState } from 'react'
import { Folder, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'
import { getFileIcon } from './fileIcons'

export interface FileItem {
  name: string
  isDirectory: boolean
  path: string
}

interface ExplorerNodeProps {
  item: FileItem
  depth: number
  onSelectFile: (path: string) => void
}

export default function ExplorerNode({ item, depth, onSelectFile }: ExplorerNodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [children, setChildren] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(false)

  const toggleOpen = async () => {
    if (!item.isDirectory) {
      onSelectFile(item.path)
      return
    }
    const nextState = !isOpen
    setIsOpen(nextState)
    if (nextState && children.length === 0) {
      setLoading(true)
      try {
        const list = await window.api.fs.readDir(item.path)
        const sorted = list.sort((a: FileItem, b: FileItem) => {
          if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
          return a.isDirectory ? -1 : 1
        })
        setChildren(sorted)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const { Icon, color } = getFileIcon(item.name)
  const paddingLeft = 8 + depth * 14

  return (
    <div className="select-none">
      <div
        onClick={toggleOpen}
        style={{ paddingLeft }}
        className="flex items-center gap-1.5 py-[3px] pr-2 rounded-[4px] cursor-pointer transition-colors group tx-muted"
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--tx-primary)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ''; (e.currentTarget as HTMLElement).style.color = '' }}
      >
        {item.isDirectory ? (
          <>
            {isOpen
              ? <ChevronDown className="w-3 h-3 tx-faint flex-shrink-0" />
              : <ChevronRight className="w-3 h-3 tx-faint flex-shrink-0" />
            }
            {isOpen
              ? <FolderOpen className="w-3.5 h-3.5 text-blue-400/80 flex-shrink-0" />
              : <Folder className="w-3.5 h-3.5 text-blue-400/60 flex-shrink-0" />
            }
          </>
        ) : (
          <>
            <span className="w-3 flex-shrink-0" />
            <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
          </>
        )}
        <span className="truncate text-[11px] font-medium">{item.name}</span>
      </div>

      {item.isDirectory && isOpen && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0"
            style={{ left: paddingLeft + 5, borderLeft: '1px solid var(--line-subtle)' }}
          />
          {loading ? (
            <div className="text-[10px] tx-faint py-1" style={{ paddingLeft: paddingLeft + 20 }}>
              Carregando...
            </div>
          ) : children.length === 0 ? (
            <div className="text-[10px] tx-faint py-1" style={{ paddingLeft: paddingLeft + 20 }}>
              (vazio)
            </div>
          ) : (
            children.map(child => (
              <ExplorerNode
                key={child.path}
                item={child}
                depth={depth + 1}
                onSelectFile={onSelectFile}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
