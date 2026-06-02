/**
 * Module-level store for xterm instances.
 * Persists Terminal objects across React mount/unmount cycles so that
 * closing the drawer or navigating away does NOT destroy the session.
 *
 * Pattern: xterm element lives in a hidden "parking" div when not visible,
 * and gets moved into the visible container when the tab is shown.
 */
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'

export interface StoredTerminal {
  term: Terminal
  fit: FitAddon
  wrapper: HTMLDivElement
  terminalId: string
  tabId: string
  dataCleanup: (() => void) | null
  exitCleanup: (() => void) | null
  exited: boolean
}

const instances = new Map<string, StoredTerminal>()
let parkingDiv: HTMLDivElement | null = null

const TERM_THEME = {
  background: '#09090b',
  foreground: '#e4e4e7',
  cursor: '#3b82f6',
  selectionBackground: '#3b82f644',
}

function getParkingDiv(): HTMLDivElement {
  if (!parkingDiv) {
    parkingDiv = document.createElement('div')
    Object.assign(parkingDiv.style, {
      position: 'fixed', top: '-9999px', left: '-9999px',
      width: '1px', height: '1px', overflow: 'hidden',
      pointerEvents: 'none', opacity: '0',
    })
    parkingDiv.setAttribute('aria-hidden', 'true')
    document.body.appendChild(parkingDiv)
  }
  return parkingDiv
}

export function has(tabId: string): boolean {
  return instances.has(tabId)
}

export function get(tabId: string): StoredTerminal | undefined {
  return instances.get(tabId)
}

/** Create a new xterm instance, wire it to the PTY, and park it offscreen. */
export function create(tabId: string, terminalId: string): StoredTerminal {
  const existing = instances.get(tabId)
  if (existing) return existing

  const wrapper = document.createElement('div')
  wrapper.style.width = '100%'
  wrapper.style.height = '100%'

  const term = new Terminal({
    theme: TERM_THEME,
    cursorBlink: true,
    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    fontSize: 12,
    lineHeight: 1.3,
    scrollback: 5000,
  })

  const fit = new FitAddon()
  term.loadAddon(fit)
  try { term.loadAddon(new WebLinksAddon()) } catch {}
  term.open(wrapper)

  // User input → PTY
  term.onData(data => window.api.terminal.write(terminalId, data))
  term.onResize(({ cols, rows }) => window.api.terminal.resize(terminalId, cols, rows))

  // PTY output → xterm  (permanent, lives as long as the instance)
  const dataCleanup = window.api.terminal.onData(terminalId, (data: string) => {
    term.write(data)
  })

  const instance: StoredTerminal = {
    term, fit, wrapper, terminalId, tabId,
    dataCleanup, exitCleanup: null, exited: false,
  }

  // PTY exit → mark exited
  const exitCleanup = window.api.terminal.onExit(terminalId, () => {
    instance.exited = true
    term.write('\n\r\x1b[90m[Sessão terminada]\x1b[0m')
  })
  instance.exitCleanup = exitCleanup

  // Park offscreen until explicitly attached
  getParkingDiv().appendChild(wrapper)
  instances.set(tabId, instance)
  return instance
}

/** Move the xterm wrapper into the visible container and fit. */
export function attach(tabId: string, container: HTMLDivElement): boolean {
  const inst = instances.get(tabId)
  if (!inst) return false
  container.appendChild(inst.wrapper)
  requestAnimationFrame(() => fitSync(tabId))
  setTimeout(() => fitSync(tabId), 80)
  return true
}

/** Park the xterm wrapper offscreen (keeps instance alive). */
export function detach(tabId: string): void {
  const inst = instances.get(tabId)
  if (!inst) return
  getParkingDiv().appendChild(inst.wrapper)
}

/** Fit terminal to container and sync PTY dimensions. */
export function fitSync(tabId: string): void {
  const inst = instances.get(tabId)
  if (!inst) return
  try {
    inst.fit.fit()
    window.api.terminal.resize(inst.terminalId, inst.term.cols, inst.term.rows)
    inst.term.scrollToBottom()
    inst.term.refresh(0, inst.term.rows - 1)
  } catch {}
}

/** Fully destroy xterm instance and clean up IPC listeners. */
export function destroy(tabId: string): void {
  const inst = instances.get(tabId)
  if (!inst) return
  inst.dataCleanup?.()
  inst.exitCleanup?.()
  try { inst.term.dispose() } catch {}
  inst.wrapper.remove()
  instances.delete(tabId)
}

/** Paste text into a terminal instance and focus it. */
export function pasteToTerminal(tabId: string, text: string): boolean {
  const inst = instances.get(tabId)
  if (!inst || inst.exited) return false
  inst.term.paste(text)
  inst.term.focus()
  return true
}

/** Destroy all stored instances (app teardown). */
export function destroyAll(): void {
  for (const tabId of instances.keys()) {
    destroy(tabId)
  }
}
