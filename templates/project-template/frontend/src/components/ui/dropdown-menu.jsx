import * as React from "react"
import { createPortal } from "react-dom"

const DropdownMenuContext = React.createContext({ open: false, onOpenChange: () => {} })
const DropdownMenuSubContext = React.createContext({ open: false, setOpen: () => {} })

export function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export const DropdownMenuTrigger = React.forwardRef(({ className = "", children, asChild = false, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext)
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: `${children.props.className || ""} ${className}`.trim(),
      onClick: (e) => { children.props.onClick?.(e); onOpenChange(!open) },
      "aria-expanded": open,
      ...props
    })
  }
  return (
    <button ref={ref} type="button" className={className} onClick={() => onOpenChange(!open)} aria-expanded={open} {...props}>
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

export const DropdownMenuContent = React.forwardRef(({ className = "", children, align = "start", ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DropdownMenuContext)
  const contentRef = React.useRef(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (!open) return
    const handleOutside = (e) => { if (contentRef.current && !contentRef.current.contains(e.target)) onOpenChange(false) }
    const handleEsc = (e) => { if (e.key === "Escape") onOpenChange(false) }
    const trigger = contentRef.current?.parentElement
    if (trigger) {
      const rect = trigger.getBoundingClientRect()
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: align === "end" ? rect.right + window.scrollX - (contentRef.current?.offsetWidth || 0) : rect.left + window.scrollX,
      })
    }
    document.addEventListener("mousedown", handleOutside)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleOutside)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, onOpenChange, align])

  if (!open) return null
  return createPortal(
    <div
      ref={(n) => { contentRef.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n }}
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      style={{ position: "absolute", top: pos.top, left: pos.left }}
      role="menu"
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

export const DropdownMenuItem = React.forwardRef(({ className = "", disabled = false, onClick, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DropdownMenuContext)
  return (
    <div
      ref={ref}
      role="menuitem"
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      onClick={(e) => { if (!disabled) { onClick?.(e); onOpenChange(false) } }}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

export const DropdownMenuSeparator = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`-mx-1 my-1 h-px bg-border ${className}`} {...props} />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export const DropdownMenuLabel = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`px-2 py-1.5 text-sm font-semibold ${className}`} {...props} />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export const DropdownMenuShortcut = ({ className = "", ...props }) => (
  <span className={`ml-auto text-xs tracking-widest opacity-60 ${className}`} {...props} />
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export const DropdownMenuGroup = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={className} role="group" {...props} />
))
DropdownMenuGroup.displayName = "DropdownMenuGroup"

export const DropdownMenuPortal = ({ children }) => <>{children}</>

export const DropdownMenuSub = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <DropdownMenuSubContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </DropdownMenuSubContext.Provider>
  )
}

export const DropdownMenuSubTrigger = React.forwardRef(({ className = "", children, disabled = false, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownMenuSubContext)
  return (
    <div
      ref={ref}
      role="menuitem"
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      data-state={open ? "open" : "closed"}
      onMouseEnter={() => { if (!disabled) setOpen(true) }}
      onClick={(e) => { if (!disabled) { setOpen(!open); props.onClick?.(e) } }}
      {...props}
    >
      {children}
      <i className="ri-arrow-right-s-line ml-auto h-4 w-4" />
    </div>
  )
})
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

export const DropdownMenuSubContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, setOpen } = React.useContext(DropdownMenuSubContext)
  const contentRef = React.useRef(null)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (!open) return
    const handleOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        const trigger = contentRef.current?.parentElement?.querySelector('[role="menuitem"]')
        if (trigger && trigger.contains(e.target)) return
        setOpen(false)
      }
    }
    const trigger = contentRef.current?.parentElement?.querySelector('[role="menuitem"]')
    if (trigger) {
      const rect = trigger.getBoundingClientRect()
      setPos({ top: rect.top + window.scrollY - 4, left: rect.right + window.scrollX - 2 })
    }
    document.addEventListener("mousedown", handleOutside)
    return () => document.removeEventListener("mousedown", handleOutside)
  }, [open, setOpen])

  if (!open) return null
  return createPortal(
    <div
      ref={(n) => { contentRef.current = n; if (typeof ref === "function") ref(n); else if (ref) ref.current = n }}
      className={`z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      style={{ position: "absolute", top: pos.top, left: pos.left }}
      role="menu"
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

export const DropdownMenuCheckboxItem = React.forwardRef(({ className = "", children, checked, onCheckedChange, disabled = false, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DropdownMenuContext)
  return (
    <div
      ref={ref}
      role="menuitemcheckbox"
      aria-checked={checked}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      onClick={(e) => { if (!disabled) { onCheckedChange?.(!checked); props.onClick?.(e); onOpenChange(false) } }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <i className="ri-check-line text-xs" />}
      </span>
      {children}
    </div>
  )
})
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

export const DropdownMenuRadioGroup = ({ value, onValueChange, children, ...props }) => {
  return (
    <div role="radiogroup" {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            checked: child.props.value === value,
            onSelect: () => onValueChange?.(child.props.value)
          })
        }
        return child;
      })}
    </div>
  )
}
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

export const DropdownMenuRadioItem = React.forwardRef(({ className = "", children, checked, onSelect, disabled = false, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DropdownMenuContext)
  return (
    <div
      ref={ref}
      role="menuitemradio"
      aria-checked={checked}
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      onClick={(e) => { if (!disabled) { onSelect?.(); props.onClick?.(e); onOpenChange(false) } }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <i className="ri-checkbox-blank-circle-fill text-[6px]" />}
      </span>
      {children}
    </div>
  )
})
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"
