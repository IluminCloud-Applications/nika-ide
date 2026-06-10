import * as React from "react"
import { createPortal } from "react-dom"

const SheetContext = React.createContext({ open: false, onOpenChange: () => {} })

function Sheet({ open: controlledOpen, onOpenChange, defaultOpen = false, children }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const handleOpenChange = React.useCallback((value) => {
    if (controlledOpen === undefined) setInternalOpen(value)
    onOpenChange?.(value)
  }, [controlledOpen, onOpenChange])

  return (
    <SheetContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(SheetContext)
  return (
    <button ref={ref} type="button" className={className} onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
})
SheetTrigger.displayName = "SheetTrigger"

const SheetContent = React.forwardRef(({ className = "", side = "right", children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(SheetContext)

  React.useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onOpenChange(false) }
    if (open) {
      document.addEventListener("keydown", handleEsc)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEsc)
      document.body.style.overflow = ""
    }
  }, [open, onOpenChange])

  if (!open) return null

  const sides = {
    top: "inset-x-0 top-0 border-b",
    bottom: "inset-x-0 bottom-0 border-t",
    left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
    right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
  }

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div
        ref={ref}
        className={`fixed z-50 gap-4 bg-background p-6 shadow-lg transition-transform ${sides[side] || sides.right} ${className}`}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
          onClick={() => onOpenChange(false)}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="3" x2="12" y2="12" /><line x1="12" y1="3" x2="3" y2="12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  )
})
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-2 text-center sm:text-left ${className}`} {...props} />
)

const SheetTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-semibold text-foreground ${className}`} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground ${className}`} {...props} />
))
SheetDescription.displayName = "SheetDescription"

const SheetFooter = ({ className = "", ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
)

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter }
