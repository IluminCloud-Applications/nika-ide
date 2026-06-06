/**
 * Código injetável do inspector de componentes React.
 * Executado via executeJavaScript dentro do webview quando o inspector é ativado.
 * Idempotente: se window.__nikainspector já existe, não faz nada.
 */
export const INSPECTOR_CODE = `(function(){
if(window.__nikainspector) return;

var active = false, overlayEl = null;

function getFiberFromDom(n){
  var k=Object.keys(n).find(function(k){return k.startsWith('__reactFiber')||k.startsWith('__reactInternalInstance')});
  return k?n[k]:null;
}
var ENTRY_RE=/\\/src\\/(main|index)\\.(jsx?|tsx?)$/,MODULES_RE=/node_modules/;
function isUserFile(f){return f&&!ENTRY_RE.test(f)&&!MODULES_RE.test(f)}

function getFileNameFromFiber(fiber){
  if(fiber._debugSource&&isUserFile(fiber._debugSource.fileName)) return fiber._debugSource.fileName;
  var f=fiber.return,d=0;
  while(f&&d<15){if(f._debugSource&&isUserFile(f._debugSource.fileName))return f._debugSource.fileName;f=f.return;d++}
  if(fiber._debugOwner&&fiber._debugOwner._debugSource&&isUserFile(fiber._debugOwner._debugSource.fileName))return fiber._debugOwner._debugSource.fileName;
  return null;
}
function getLineNumberFromFiber(fiber){
  if(fiber._debugSource)return fiber._debugSource.lineNumber;
  var f=fiber.return,d=0;
  while(f&&d<15){if(f._debugSource)return f._debugSource.lineNumber;f=f.return;d++}
  if(fiber._debugOwner&&fiber._debugOwner._debugSource)return fiber._debugOwner._debugSource.lineNumber;
  return null;
}
function getComponentName(fiber){
  if(fiber._debugOwner){var t=fiber._debugOwner.type,n=t&&(t.displayName||t.name);if(n&&n!=='Anonymous'&&n.length>1)return n}
  var f=fiber.return,d=0;
  while(f&&d<15){var t2=f.type;if(t2&&typeof t2==='function'){var n2=t2.displayName||t2.name;if(n2&&n2!=='Anonymous'&&n2.length>1)return n2}f=f.return;d++}
  return null;
}
function getRelevantClasses(el){
  if(!el||!el.className||typeof el.className!=='string')return null;
  var c=el.className.split(/\\s+/).filter(function(s){return s&&s.length<40});
  return c.length?c.sort(function(a,b){return a.length-b.length}).slice(0,6).join(' '):null;
}
function getVisibleText(el){
  var cl=el.cloneNode(true);cl.querySelectorAll('svg').forEach(function(s){s.remove()});
  var t=(cl.textContent||'').trim();return t.length>0&&t.length<=150?t:null;
}
function findFiberInDom(startEl){
  var node=startEl;
  while(node&&node!==document.documentElement){var fb=getFiberFromDom(node);if(fb)return{fiber:fb,domNode:node};node=node.parentElement}
  return null;
}
function getSourceFromDom(startEl){
  var node=startEl;
  while(node&&node.nodeType===1&&node!==document.documentElement){
    var raw=node.getAttribute&&node.getAttribute('data-nikasrc');
    if(raw){var i=raw.lastIndexOf(':'),fileName=i>=0?raw.slice(0,i):raw;
      if(isUserFile(fileName))return{fileName:fileName,lineNumber:i>=0?(parseInt(raw.slice(i+1),10)||null):null,domNode:node}}
    node=node.parentElement;
  }
  return null;
}
function getOuterHTML(el){
  if(!el)return null;
  var maxLen = 2000;
  var html = el.outerHTML;
  if(html.length > maxLen){
    var clone = el.cloneNode(false);
    html = clone.outerHTML.replace('></', '>...</');
  }
  return html;
}
function resolveTarget(el){
  var src=getSourceFromDom(el),found=findFiberInDom(el);
  var fileName=src?src.fileName:(found?getFileNameFromFiber(found.fiber):null);
  var finalFileName = fileName || 'Desconhecido';
  var lineNumber = src?src.lineNumber:(found?getLineNumberFromFiber(found.fiber):null);
  var domNode = src?src.domNode:(found?found.domNode:el);
  var componentName = found?getComponentName(found.fiber):null;
  return{fileName:finalFileName,lineNumber:lineNumber,domNode:domNode,componentName:componentName};
}

function ensureOverlay(){
  if(overlayEl&&document.documentElement.contains(overlayEl))return overlayEl;
  overlayEl=document.createElement('div');overlayEl.id='__ls_hl__';
  Object.assign(overlayEl.style,{position:'fixed',zIndex:'2147483647',pointerEvents:'none',border:'2px solid #3b82f6',background:'rgba(59,130,246,0.08)',borderRadius:'3px',boxShadow:'0 0 0 3px rgba(59,130,246,0.15)',transition:'all 60ms ease'});
  var badge=document.createElement('div');badge.id='__ls_badge__';
  Object.assign(badge.style,{position:'absolute',bottom:'100%',left:'-2px',marginBottom:'3px',background:'#1d4ed8',color:'#fff',fontSize:'11px',fontFamily:'ui-monospace,monospace',fontWeight:'500',padding:'2px 8px',borderRadius:'4px 4px 0 0',whiteSpace:'nowrap',boxShadow:'0 -2px 8px rgba(0,0,0,0.4)'});
  overlayEl.appendChild(badge);document.documentElement.appendChild(overlayEl);return overlayEl;
}
function showHighlight(rect,label){
  var ov=ensureOverlay();Object.assign(ov.style,{display:'',top:rect.top+'px',left:rect.left+'px',width:rect.width+'px',height:rect.height+'px'});
  var b=document.getElementById('__ls_badge__');if(b)b.textContent=label;
}
function hideOverlay(){if(overlayEl)overlayEl.style.display='none'}
function destroyOverlay(){if(overlayEl)overlayEl.remove();overlayEl=null}

function elementAt(x,y){if(overlayEl)overlayEl.style.visibility='hidden';var el=document.elementFromPoint(x,y);if(overlayEl)overlayEl.style.visibility='';return el}

function handleMouseMove(x,y){
  if(!active)return;var el=elementAt(x,y);
  if(!el||el===document.body||el===document.documentElement){hideOverlay();return}
  var t=resolveTarget(el);if(!t){hideOverlay();return}
  var tagName=t.domNode.tagName?t.domNode.tagName.toLowerCase():'',rect=t.domNode.getBoundingClientRect();
  var label=t.componentName?t.componentName+' > <'+tagName+'>':(t.fileName!=='Desconhecido'?t.fileName.split('/').slice(-2).join('/')+' > <'+tagName+'>':'<'+tagName+'>');
  showHighlight(rect,label);
}

function handleClick(x,y){
  if(!active)return null;var el=elementAt(x,y);if(!el)return null;
  var t=resolveTarget(el);
  return{type:'found',fileName:t.fileName,lineNumber:t.lineNumber,componentName:t.componentName,tagName:t.domNode.tagName?t.domNode.tagName.toLowerCase():null,visibleText:getVisibleText(t.domNode),cssClasses:getRelevantClasses(t.domNode),htmlContent:getOuterHTML(t.domNode)};
}

function enable(){active=true;document.documentElement.style.cursor='crosshair'}
function disable(){active=false;document.documentElement.style.cursor='';destroyOverlay()}

window.__nikainspector={enable:enable,disable:disable,handleMouseMove:handleMouseMove,handleClick:handleClick};
})();`
