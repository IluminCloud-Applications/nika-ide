interface McpToggleProps {
  enabled: boolean
  onToggle: () => void
  syncing?: boolean
}

export default function McpToggle({ enabled, onToggle, syncing }: McpToggleProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      disabled={syncing}
      title={syncing ? 'Sincronizando com projetos...' : undefined}
      className={`shrink-0 w-10 h-6 rounded-full border transition-all duration-200 relative ${
        syncing ? 'opacity-60 cursor-wait' : ''
      } ${
        enabled ? 'bg-blue-600 border-blue-500' : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200 ${
          enabled ? 'left-[calc(100%-21px)]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}
