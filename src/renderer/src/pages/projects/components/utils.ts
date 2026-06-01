export type SortCol = 'name' | 'createdAt'
export type SortDir = 'asc' | 'desc'

const PINNED_KEY = 'pinned_projects'

export function loadPinned(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(PINNED_KEY) || '[]')) } catch { return new Set() }
}

export function savePinned(s: Set<string>) {
  localStorage.setItem(PINNED_KEY, JSON.stringify([...s]))
}
