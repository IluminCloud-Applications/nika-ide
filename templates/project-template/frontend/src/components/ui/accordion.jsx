import * as React from "react"

const AccordionContext = React.createContext({ type: "single", expandedItems: [], toggle: () => {} })

function Accordion({ type = "single", defaultValue, collapsible = false, className = "", children, ...props }) {
  const [expandedItems, setExpandedItems] = React.useState(
    defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
  )

  const toggle = React.useCallback((value) => {
    setExpandedItems((prev) => {
      const isOpen = prev.includes(value)
      if (type === "single") {
        return isOpen && collapsible ? [] : isOpen ? prev : [value]
      }
      return isOpen ? prev.filter((v) => v !== value) : [...prev, value]
    })
  }, [type, collapsible])

  return (
    <AccordionContext.Provider value={{ type, expandedItems, toggle }}>
      <div className={className} {...props}>{children}</div>
    </AccordionContext.Provider>
  )
}

const AccordionItem = React.forwardRef(({ className = "", value, ...props }, ref) => (
  <div ref={ref} className={`border-b ${className}`} data-accordion-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { expandedItems, toggle } = React.useContext(AccordionContext)
  const itemEl = ref?.current?.closest?.("[data-accordion-value]")
  const value = props["data-value"] || itemEl?.getAttribute("data-accordion-value") || ""

  // Use a callback ref to get the value from parent
  const triggerRef = React.useRef(null)
  const [itemValue, setItemValue] = React.useState("")

  React.useEffect(() => {
    if (triggerRef.current) {
      const parent = triggerRef.current.closest("[data-accordion-value]")
      if (parent) setItemValue(parent.getAttribute("data-accordion-value") || "")
    }
  }, [])

  const isOpen = expandedItems.includes(itemValue)

  return (
    <h3 className="flex">
      <button
        ref={(node) => {
          triggerRef.current = node
          if (node) {
            const parent = node.closest("[data-accordion-value]")
            if (parent) setItemValue(parent.getAttribute("data-accordion-value") || "")
          }
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        type="button"
        className={`flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline ${className}`}
        onClick={() => itemValue && toggle(itemValue)}
        aria-expanded={isOpen}
        {...props}
      >
        {children}
        <svg
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </h3>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const { expandedItems } = React.useContext(AccordionContext)
  const contentRef = React.useRef(null)
  const [itemValue, setItemValue] = React.useState("")

  React.useEffect(() => {
    if (contentRef.current) {
      const parent = contentRef.current.closest("[data-accordion-value]")
      if (parent) setItemValue(parent.getAttribute("data-accordion-value") || "")
    }
  }, [])

  const isOpen = expandedItems.includes(itemValue)

  return (
    <div
      ref={(node) => {
        contentRef.current = node
        if (node) {
          const parent = node.closest("[data-accordion-value]")
          if (parent) setItemValue(parent.getAttribute("data-accordion-value") || "")
        }
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      className={`overflow-hidden text-sm ${isOpen ? "pb-4 pt-0" : "h-0"}`}
      {...props}
    >
      {isOpen && <div className={className}>{children}</div>}
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
