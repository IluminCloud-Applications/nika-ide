import * as React from "react"
import { createPortal } from "react-dom"

const PopoverContext = React.createContext({ open: false, setOpen: () => {}, triggerRef: { current: null } })

function Popover({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const setOpen = React.useCallback((value) => {
    if (controlledOpen === undefined) setInternalOpen(value)
    onOpenChange?.(value)
  }, [controlledOpen, onOpenChange])

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      {children}
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)

  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      type="button"
      className={className}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(
  ({ className = "", align = "center", sideOffset = 4, children, ...props }, ref) => {
    const { open, setOpen, triggerRef } = React.useContext(PopoverContext)
    const contentRef = React.useRef(null)
    const [pos, setPos] = React.useState({ top: 0, left: 0 })

    React.useEffect(() => {
      if (!open) return
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        const left = align === "end" ? rect.right + window.scrollX
          : align === "start" ? rect.left + window.scrollX
          : rect.left + window.scrollX + rect.width / 2
        setPos({ top: rect.bottom + window.scrollY + sideOffset, left })
      }
      const handleClick = (e) => {
        if (contentRef.current && !contentRef.current.contains(e.target) && !triggerRef.current?.contains(e.target)) {
          setOpen(false)
        }
      }
      const handleEsc = (e) => { if (e.key === "Escape") setOpen(false) }
      document.addEventListener("mousedown", handleClick)
      document.addEventListener("keydown", handleEsc)
      return () => {
        document.removeEventListener("mousedown", handleClick)
        document.removeEventListener("keydown", handleEsc)
      }
    }, [open, setOpen, triggerRef, align, sideOffset])

    if (!open) return null

    const transform = align === "end" ? "translateX(-100%)" : align === "center" ? "translateX(-50%)" : "none"

    return createPortal(
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        className={`z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ${className}`}
        style={{ position: "absolute", top: pos.top, left: pos.left, transform }}
        {...props}
      >
        {children}
      </div>,
      document.body
    )
  }
)
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
