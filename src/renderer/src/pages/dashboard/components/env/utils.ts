export interface EnvEntry {
  key: string
  value: string
  comment?: string
}

/**
 * Parses .env file content into an array of EnvEntry objects.
 * Handles comments, empty lines, and standard KEY=value pairs.
 */
export function parseEnvContent(content: string): EnvEntry[] {
  const lines = content.split(/\r?\n/)
  const entries: EnvEntry[] = []

  lines.forEach((line) => {
    const trimmed = line.trim()
    
    // Check if it is a comment or empty line
    if (!trimmed) {
      return
    }
    
    if (trimmed.startsWith('#')) {
      // It's a comment, we can attach it to the next key or save it
      // For simplicity, we just skip it or keep it as metadata if needed
      return
    }

    const firstEq = trimmed.indexOf('=')
    if (firstEq === -1) {
      // Invalid format, skip
      return
    }

    const key = trimmed.slice(0, firstEq).trim()
    let value = trimmed.slice(firstEq + 1).trim()

    // Strip quotes if they surround the value
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (key) {
      entries.push({ key, value })
    }
  })

  return entries
}

/**
 * Converts an array of EnvEntry back into .env string format.
 */
export function serializeEnvEntries(entries: EnvEntry[]): string {
  return entries
    .filter(e => e.key.trim() !== '')
    .map(e => `${e.key.trim()}=${e.value}`)
    .join('\n') + '\n'
}
