/**
 * Estimates the number of tokens in a text string.
 * Uses a regex-based heuristic that approximates BPE tokenization
 * (similar to how GPT/Claude tokenizers work).
 *
 * The approach: split text into word-like chunks, numbers,
 * punctuation, and whitespace groups — each counts as ~1 token.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  // Match: words, numbers, individual punctuation/operators, whitespace groups
  // This approximates BPE tokenization fairly well for code and prose
  const matches = text.match(
    /[a-zA-Z]+|[0-9]+|[^\s\w]|\s+/g
  )

  return matches ? matches.length : 0
}

export function countLines(text: string): number {
  if (!text) return 0
  return text.split('\n').length
}

export function countChars(text: string): number {
  return text.length
}

/** Formats a number with thousand separators (pt-BR style) */
export function formatNumber(n: number): string {
  return n.toLocaleString('pt-BR')
}
