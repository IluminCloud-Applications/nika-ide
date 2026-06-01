/**
 * Extracts all unique placeholders in the format {{variable_name}} from a template string.
 */
export function extractVariables(template: string): string[] {
  if (!template) return []
  const regex = /\{\{([^}]+)\}\}/g
  const matches = new Set<string>()
  let match
  while ((match = regex.exec(template)) !== null) {
    matches.add(match[1].trim())
  }
  return Array.from(matches)
}

/**
 * Replaces the placeholders in a template with user-provided values.
 */
export function compilePrompt(template: string, values: Record<string, string>): string {
  if (!template) return ''
  let compiled = template
  Object.entries(values).forEach(([variable, val]) => {
    const escapedVar = variable.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    const regex = new RegExp(`\\{\\{\\s*${escapedVar}\\s*\\}\\}`, 'g')
    compiled = compiled.replace(regex, val || `{{${variable}}}`)
  })
  return compiled
}
