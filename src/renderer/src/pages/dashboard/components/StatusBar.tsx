import { Folder, Circle, Globe, Loader2 } from 'lucide-react'

interface StatusBarProps {
  projectPath: string
  isRunning: boolean
  previewUrl: string
}

export default function StatusBar({ projectPath, isRunning, previewUrl }: StatusBarProps) {
  return (
    <div className="editor-statusbar select-none">
      {/* Left side */}
      <div className="flex items-center gap-3 tx-muted">
        <div className="flex items-center gap-1.5">
          <Folder className="w-3 h-3" />
          <span className="truncate max-w-[200px]">{projectPath}</span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 tx-muted">
        {isRunning && (
          <div className="flex items-center gap-1.5 tx-secondary">
            <Globe className="w-3 h-3" />
            <span>{previewUrl}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {isRunning ? (
            <>
              <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
              <span className="text-emerald-400">Executando</span>
            </>
          ) : (
            <>
              <Circle className="w-2.5 h-2.5 tx-faint fill-current" />
              <span>Ocioso</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
