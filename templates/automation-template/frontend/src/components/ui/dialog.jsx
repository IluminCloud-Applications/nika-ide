import * as React from "react"
import { createPortal } from "react-dom"

const DialogContext = React.createContext({ open: false, onOpenChange: () => {} })

function Dialog({ open: controlledOpen, onOpenChange, defaultOpen = false, children }) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen

  const handleOpenChange = React.useCallback(
    (value) => {
      if (controlledOpen === undefined) setInternalOpen(value)
      onOpenChange?.(value)
    },
    [controlledOpen, onOpenChange]
  )

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  return (
    <button ref={ref} type="button" className={className} onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  )
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, onOpenChange } = React.useContext(DialogContext)

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/80" onClick={() => onOpenChange(false)} />
      <div
        ref={ref}
        className={`fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg ${className}`}
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className = "", ...props }) => (
  <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />
)

const DialogTitle = React.forwardRef(({ className = "", ...props }, ref) => (
  <h2 ref={ref} className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props} />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className = "", ...props }, ref) => (
  <p ref={ref} className={`text-sm text-muted-foreground ${className}`} {...props} />
))
DialogDescription.displayName = "DialogDescription"

const DialogFooter = ({ className = "", ...props }) => (
  <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />
)

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter }
