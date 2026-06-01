import { useState } from 'react'
import { Settings, Folder, Save, X, Check } from 'lucide-react'

interface WorkspaceSettingsProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
  onSave: (path: string) => void
}

export default function WorkspaceSettings({ isOpen, onClose, currentPath, onSave }: WorkspaceSettingsProps) {
  const [path, setPath] = useState(currentPath)
  const [saved, setSaved] = useState(false)

  const handleSelectFolder = async () => {
    try {
      const selected = await window.api.settings.selectWorkspace()
      if (selected) setPath(selected)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    try {
      await window.api.settings.set({ workspacePath: path })
      onSave(path)
      setSaved(true)
      setTimeout(() => { setSaved(false); onClose() }, 800)
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-glass flex flex-col space-y-5 animate-slide-up" style={{ willChange: 'transform' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-100">
            <Settings className="text-blue-500 w-5 h-5" /> Configurações
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-800 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Pasta Padrão de Projetos</label>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Quando definida, novos projetos serão criados automaticamente como subpastas desta pasta.
            O nome do projeto vira o nome da subpasta (ex: "Meu App" → meu-app/).
          </p>
          <div className="flex gap-2 mt-1">
            <input
              readOnly
              value={path}
              onClick={handleSelectFolder}
              placeholder="Nenhuma pasta selecionada"
              className="flex-1 glass-input p-2.5 rounded-lg text-sm font-mono cursor-pointer truncate"
            />
            <button
              type="button"
              onClick={handleSelectFolder}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 transition flex items-center gap-1.5"
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" /> Selecionar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm font-medium transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!path}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-semibold shadow transition"
          >
            {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
