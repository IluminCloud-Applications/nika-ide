import { useMemo } from 'react'
import { Hash, Type, Coins } from 'lucide-react'
import { estimateTokens, countLines, countChars, formatNumber } from '@/utils/textStats'

interface FileStatsBarProps {
  content: string
}

export default function FileStatsBar({ content }: FileStatsBarProps) {
  const stats = useMemo(() => ({
    lines: countLines(content),
    chars: countChars(content),
    tokens: estimateTokens(content),
  }), [content])

  return (
    <div className="flex items-center gap-4 text-[10px] tx-muted font-medium">
      <div className="flex items-center gap-1" title="Linhas">
        <Hash className="w-3 h-3 tx-faint" />
        <span>{formatNumber(stats.lines)} linhas</span>
      </div>

      <div className="divider-y h-3" />

      <div className="flex items-center gap-1" title="Caracteres">
        <Type className="w-3 h-3 tx-faint" />
        <span>{formatNumber(stats.chars)} chars</span>
      </div>

      <div className="divider-y h-3" />

      <div className="flex items-center gap-1" title="Tokens estimados (aprox. BPE)">
        <Coins className="w-3 h-3 text-blue-400/70" />
        <span className="text-blue-400/80">~{formatNumber(stats.tokens)} tokens</span>
      </div>
    </div>
  )
}
