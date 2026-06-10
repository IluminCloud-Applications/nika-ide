/**
 * ComponentInspector — injetado no template em dev mode.
 * Detecta qual arquivo, componente React, elemento HTML e texto
 * correspondem ao elemento clicado no preview.
 */

let active = false
let overlayEl = null

// ─── React Fiber lookup ───────────────────────────────────────────────────────

function getFiberFromDom(domNode) {
  const key = Object.keys(domNode).find(
    k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
  )
  return key ? domNode[key] : null
}

const ENTRY_RE   = /\/src\/(main|index)\.(jsx?|tsx?)$/
const MODULES_RE = /node_modules/

function isUserFile(fileName) {
  if (!fileName) return false
  if (ENTRY_RE.test(fileName))   return false
  if (MODULES_RE.test(fileName)) return false
  return true
}

/**
 * Retorna o fileName do arquivo de usuário mais próximo na fiber tree.
 */
function getFileNameFromFiber(fiber) {
  if (fiber._debugSource && isUserFile(fiber._debugSource.fileName)) {
    return fiber._debugSource.fileName
  }
  let f = fiber.return
  let depth = 0
  while (f && depth < 15) {
    if (f._debugSource && isUserFile(f._debugSource.fileName)) {
      return f._debugSource.fileName
    }
    f = f.return
    depth++
  }
  if (fiber._debugOwner?._debugSource && isUserFile(fiber._debugOwner._debugSource.fileName)) {
    return fiber._debugOwner._debugSource.fileName
  }
  return null
}

/**
 * Retorna o número da linha correspondente na fiber tree.
 */
function getLineNumberFromFiber(fiber) {
  if (fiber._debugSource) return fiber._debugSource.lineNumber
  let f = fiber.return
  let depth = 0
  while (f && depth < 15) {
    if (f._debugSource) return f._debugSource.lineNumber
    f = f.return
    depth++
  }
  if (fiber._debugOwner?._debugSource) {
    return fiber._debugOwner._debugSource.lineNumber
  }
  return null
}

/**
 * Retorna o nome do componente React que renderizou o elemento.
 * Sobe na fiber tree buscando o primeiro function/class component com nome.
 */
function getComponentName(fiber) {
  // _debugOwner é o componente que criou este elemento
  if (fiber._debugOwner) {
    const type = fiber._debugOwner.type
    const name = type?.displayName || type?.name
    if (name && name !== 'Anonymous' && name.length > 1) return name
  }

  // Sobe na tree buscando fiber de componente (não host/DOM)
  let f = fiber.return
  let depth = 0
  while (f && depth < 15) {
    const type = f.type
    if (type && typeof type === 'function') {
      const name = type.displayName || type.name
      if (name && name !== 'Anonymous' && name.length > 1) return name
    }
    f = f.return
    depth++
  }
  return null
}

/**
 * Retorna as classes CSS mais relevantes (filtra muito longas / muitas).
 */
function getRelevantClasses(el) {
  if (!el?.className || typeof el.className !== 'string') return null
  const classes = el.className.split(/\s+/).filter(c => c && c.length < 40)
  if (classes.length === 0) return null
  // Pega até 6 classes mais curtas (geralmente as mais descritivas)
  return classes.sort((a, b) => a.length - b.length).slice(0, 6).join(' ')
}

/**
 * Retorna o texto visível imediato do elemento (sem conteúdo de filhos SVG/ícones).
 */
function getVisibleText(el) {
  // Cria uma cópia para remover SVGs antes de pegar textContent
  const clone = el.cloneNode(true)
  clone.querySelectorAll('svg').forEach(svg => svg.remove())
  const text = clone.textContent?.trim() || ''
  return text.length > 0 && text.length <= 150 ? text : null
}

/**
 * Sobe no DOM para encontrar um nó que tenha fiber React.
 */
function findFiberInDom(startEl) {
  let node = startEl
  while (node && node !== document.documentElement) {
    const fiber = getFiberFromDom(node)
    if (fiber) return { fiber, domNode: node }
    node = node.parentElement
  }
  return null
}

/**
 * Sobe no DOM procurando o atributo `data-nikasrc="<arquivo>:<linha>"`,
 * carimbado pelo plugin Babel (vite.config.js) em DEV.
 * Fonte primária de origem — o React 19 removeu `fiber._debugSource`.
 */
function getSourceFromDom(startEl) {
  let node = startEl
  while (node && node.nodeType === 1 && node !== document.documentElement) {
    const raw = node.getAttribute && node.getAttribute('data-nikasrc')
    if (raw) {
      const i = raw.lastIndexOf(':')
      const fileName = i >= 0 ? raw.slice(0, i) : raw
      if (isUserFile(fileName)) {
        const lineNumber = i >= 0 ? (parseInt(raw.slice(i + 1), 10) || null) : null
        return { fileName, lineNumber, domNode: node }
      }
    }
    node = node.parentElement
  }
  return null
}

/**
 * Resolve o alvo do inspetor a partir do elemento sob o cursor.
 * Usa data-nikasrc (DOM) como fonte primária e o fiber como fallback (React ≤ 18).
 */
function getOuterHTML(el) {
  if (!el) return null
  const maxLen = 2000
  let html = el.outerHTML
  if (html.length > maxLen) {
    const clone = el.cloneNode(false)
    html = clone.outerHTML.replace('></', '>...</')
  }
  return html
}

function resolveTarget(el) {
  const src   = getSourceFromDom(el)
  const found = findFiberInDom(el)
  const fileName = src ? src.fileName : (found ? getFileNameFromFiber(found.fiber) : null)
  const finalFileName = fileName || 'Desconhecido'
  return {
    fileName:      finalFileName,
    lineNumber:    src ? src.lineNumber : (found ? getLineNumberFromFiber(found.fiber) : null),
    domNode:       src ? src.domNode    : (found ? found.domNode : el),
    componentName: found ? getComponentName(found.fiber) : null,
  }
}

// ─── Overlay visual ───────────────────────────────────────────────────────────

function ensureOverlay() {
  if (overlayEl && document.documentElement.contains(overlayEl)) return overlayEl
  overlayEl = document.createElement('div')
  overlayEl.id = '__ls_hl__'
  Object.assign(overlayEl.style, {
    position:      'fixed',
    zIndex:        '2147483647',
    pointerEvents: 'none',
    border:        '2px solid #3b82f6',
    background:    'rgba(59,130,246,0.08)',
    borderRadius:  '3px',
    boxShadow:     '0 0 0 3px rgba(59,130,246,0.15)',
    transition:    'all 60ms ease',
  })
  const badge = document.createElement('div')
  badge.id = '__ls_badge__'
  Object.assign(badge.style, {
    position:     'absolute',
    bottom:       '100%',
    left:         '-2px',
    marginBottom: '3px',
    background:   '#1d4ed8',
    color:        '#fff',
    fontSize:     '11px',
    fontFamily:   'ui-monospace,monospace',
    fontWeight:   '500',
    padding:      '2px 8px',
    borderRadius: '4px 4px 0 0',
    whiteSpace:   'nowrap',
    boxShadow:    '0 -2px 8px rgba(0,0,0,0.4)',
  })
  overlayEl.appendChild(badge)
  document.documentElement.appendChild(overlayEl)
  return overlayEl
}

function showHighlight(rect, label) {
  const ov = ensureOverlay()
  Object.assign(ov.style, {
    display: '',
    top:     rect.top + 'px',
    left:    rect.left + 'px',
    width:   rect.width + 'px',
    height:  rect.height + 'px',
  })
  const badge = document.getElementById('__ls_badge__')
  if (badge) badge.textContent = label
}

function hideOverlay() {
  if (overlayEl) overlayEl.style.display = 'none'
}

function destroyOverlay() {
  overlayEl?.remove()
  overlayEl = null
}

// ─── elementFromPoint sem interferência do overlay ────────────────────────────

function elementAt(x, y) {
  if (overlayEl) overlayEl.style.visibility = 'hidden'
  const el = document.elementFromPoint(x, y)
  if (overlayEl) overlayEl.style.visibility = ''
  return el
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function handleMouseMove(x, y) {
  if (!active) return
  const el = elementAt(x, y)
  if (!el || el === document.body || el === document.documentElement) {
    hideOverlay(); return
  }
  const t = resolveTarget(el)
  if (!t) { hideOverlay(); return }

  const tagName = t.domNode.tagName?.toLowerCase() || ''
  const rect    = t.domNode.getBoundingClientRect()

  // Badge: "ComponentName > <tag>" ou só o arquivo
  const label = t.componentName
    ? `${t.componentName} › <${tagName}>`
    : (t.fileName !== 'Desconhecido' ? `${t.fileName.split('/').slice(-2).join('/')} › <${tagName}>` : `<${tagName}>`)

  showHighlight(rect, label)
}

function handleClick(x, y) {
  if (!active) return null
  const el = elementAt(x, y)
  if (!el) return null

  const t = resolveTarget(el)

  return {
    type:          'found',
    fileName:      t.fileName,
    lineNumber:    t.lineNumber,
    componentName: t.componentName,
    tagName:       t.domNode.tagName?.toLowerCase() || null,
    visibleText:   getVisibleText(t.domNode),
    cssClasses:    getRelevantClasses(t.domNode),
    htmlContent:   getOuterHTML(t.domNode),
  }
}

// ─── Enable / Disable ────────────────────────────────────────────────────────

function enable() {
  active = true
  document.documentElement.style.cursor = 'crosshair'
}

function disable() {
  active = false
  document.documentElement.style.cursor = ''
  destroyOverlay()
}

// ─── API exposta para o Nika IDE (via executeJavaScript) ─────────────────────

window.__nikainspector = { enable, disable, handleMouseMove, handleClick }

// ─── Bridge legado (fallback via postMessage / preload) ──────────────────────

window.addEventListener('message', (e) => {
  if (!e.data?.type) return
  const { type, x, y } = e.data
  if (type === '__LS_INSPECTOR_ENABLE__')    enable()
  if (type === '__LS_INSPECTOR_DISABLE__')   disable()
  if (type === '__LS_INSPECTOR_MOUSEMOVE__') handleMouseMove(x, y)
  if (type === '__LS_INSPECTOR_CLICK_AT__')  handleClick(x, y)
})

export {}
