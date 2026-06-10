import * as React from "react"
import { createPortal } from "react-dom"

const TooltipContext = React.createContext({ delayDuration: 300 })

function TooltipProvider({ children, delayDuration = 300 }) {
  return (
    <TooltipContext.Provider value={{ delayDuration }}>
      {children}
    </TooltipContext.Provider>
  )
}

function Tooltip({ children }) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const timeoutRef = React.useRef(null)
  const { delayDuration } = React.useContext(TooltipContext)

  const handleOpen = () => {
    timeoutRef.current = setTimeout(() => setOpen(true), delayDuration)
  }

  const handleClose = () => {
    clearTimeout(timeoutRef.current)
    setOpen(false)
  }

  React.useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const context = React.useMemo(() => ({ open, triggerRef, handleOpen, handleClose }), [open])

  return (
    <TooltipInternalContext.Provider value={context}>
      {children}
    </TooltipInternalContext.Provider>
  )
}

const TooltipInternalContext = React.createContext({
  open: false, triggerRef: { current: null }, handleOpen: () => {}, handleClose: () => {}
})

const TooltipTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { triggerRef, handleOpen, handleClose } = React.useContext(TooltipInternalContext)

  return (
    <span
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={className}
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
      onFocus={handleOpen}
      onBlur={handleClose}
      {...props}
    >
      {children}
    </span>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className = "", sideOffset = 4, children, ...props }, ref) => {
  const { open, triggerRef } = React.useContext(TooltipInternalContext)
  const [pos, setPos] = React.useState({ top: 0, left: 0 })

  React.useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({
        top: rect.top + window.scrollY - sideOffset,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    }
  }, [open, sideOffset, triggerRef])

  if (!open) return null

  return createPortal(
    <div
      ref={ref}
      className={`z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 ${className}`}
      style={{ position: "absolute", top: pos.top, left: pos.left, transform: "translate(-50%, -100%)" }}
      role="tooltip"
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
