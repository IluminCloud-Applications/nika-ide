import * as React from "react"
import { createPortal } from "react-dom"

const ContextMenuContext = React.createContext({
  open: false,
  setOpen: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
})

export function ContextMenu({ children }) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition }}>
      <div className="relative inline-block w-full">{children}</div>
    </ContextMenuContext.Provider>
  )
}

export const ContextMenuTrigger = React.forwardRef(({ className = "", children, asChild = false, ...props }, ref) => {
  const { setOpen, setPosition } = React.useContext(ContextMenuContext)

  const handleContextMenu = (e) => {
    e.preventDefault()
    setOpen(true)
    setPosition({ x: e.clientX, y: e.clientY })
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: `${children.props.className || ""} ${className}`.trim(),
      onContextMenu: (e) => {
        children.props.onContextMenu?.(e)
        handleContextMenu(e)
      },
      ...props
    })
  }

  return (
    <div
      ref={ref}
      className={className}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {children}
    </div>
  )
})
ContextMenuTrigger.displayName = "ContextMenuTrigger"

export const ContextMenuContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, setOpen, position } = React.useContext(ContextMenuContext)
  const contentRef = React.useRef(null)
  const [adjustedPos, setAdjustedPos] = React.useState(null)

  React.useLayoutEffect(() => {
    if (!open) {
      setAdjustedPos(null)
      return
    }
    const menuWidth = contentRef.current?.offsetWidth || 160
    const menuHeight = contentRef.current?.offsetHeight || 120
    let top = position.y
    let left = position.x
    if (left + menuWidth > window.innerWidth) left = window.innerWidth - menuWidth - 8
    if (top + menuHeight > window.innerHeight) top = window.innerHeight - menuHeight - 8
    setAdjustedPos({ top, left })
  }, [open, position])

  React.useEffect(() => {
    if (!open) return
    const handleOutsideClick = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleEsc = (e) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, setOpen])

  if (!open) return null

  const style = adjustedPos 
    ? { position: "fixed", top: adjustedPos.top, left: adjustedPos.left } 
    : { position: "fixed", top: position.y, left: position.x, opacity: 0 }

  return createPortal(
    <div
      ref={(node) => {
        contentRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      style={style}
      role="menu"
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
ContextMenuContent.displayName = "ContextMenuContent"

export const ContextMenuItem = React.forwardRef(({ className = "", disabled = false, variant = "default", onClick, ...props }, ref) => {
  const { setOpen } = React.useContext(ContextMenuContext)
  
  const variantStyles = variant === "destructive" 
    ? "text-destructive hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
    : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"

  return (
    <div
      ref={ref}
      role="menuitem"
      className={`relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${variantStyles} ${className}`}
      onClick={(e) => {
        if (!disabled) {
          onClick?.(e)
          setOpen(false)
        }
      }}
      {...props}
    />
  )
})
ContextMenuItem.displayName = "ContextMenuItem"

export const ContextMenuSeparator = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`-mx-1 my-1 h-px bg-border ${className}`} {...props} />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

export const ContextMenuGroup = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={className} role="group" {...props} />
))
ContextMenuGroup.displayName = "ContextMenuGroup"
