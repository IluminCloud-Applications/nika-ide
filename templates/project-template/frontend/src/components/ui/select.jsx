import * as React from "react"
import { createPortal } from "react-dom"

const SelectContext = React.createContext({
  value: "", onValueChange: () => {}, open: false, setOpen: () => {}, triggerRef: { current: null }
})

function Select({ children, value: controlledValue, onValueChange, defaultValue = "" }) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef(null)
  const value = controlledValue !== undefined ? controlledValue : internalValue

  const handleValueChange = React.useCallback((v) => {
    if (controlledValue === undefined) setInternalValue(v)
    onValueChange?.(v)
    setOpen(false)
  }, [controlledValue, onValueChange])

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen, triggerRef }}>
      {children}
    </SelectContext.Provider>
  )
}

const SelectValue = ({ placeholder = "" }) => {
  const { value } = React.useContext(SelectContext)
  return <span className={value ? "" : "text-muted-foreground"}>{value || placeholder}</span>
}

const SelectTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(SelectContext)

  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      type="button"
      className={`flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      {children}
      <svg className="h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { open, setOpen, triggerRef } = React.useContext(SelectContext)
  const [pos, setPos] = React.useState({ top: 0, left: 0, width: 0 })

  React.useEffect(() => {
    if (!open) return
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: rect.width })
    }
    const handleClick = (e) => {
      if (!e.target.closest("[data-select-content]")) setOpen(false)
    }
    const handleEsc = (e) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleEsc)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleEsc)
    }
  }, [open, setOpen, triggerRef])

  if (!open) return null

  return createPortal(
    <div
      ref={ref}
      data-select-content
      className={`z-50 max-h-96 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md ${className}`}
      style={{ position: "absolute", top: pos.top, left: pos.left, minWidth: pos.width }}
      {...props}
    >
      {children}
    </div>,
    document.body
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ className = "", value, children, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(SelectContext)
  const isSelected = selectedValue === value

  return (
    <div
      ref={ref}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent ${
        isSelected ? "bg-accent" : ""
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {isSelected && (
        <span className="absolute right-2">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
