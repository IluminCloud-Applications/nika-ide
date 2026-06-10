import * as React from "react"

const CollapsibleContext = React.createContext({ open: false, onOpenChange: () => {} })

function Collapsible({ open: openProp, defaultOpen = false, onOpenChange, className = "", children, ...props }) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : openState

  const handleOpenChange = (value) => {
    setOpenState(value)
    onOpenChange?.(value)
  }

  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      <div data-state={open ? "open" : "closed"} className={className} {...props}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

function CollapsibleTrigger({ asChild = false, children, ...props }) {
  const { open, onOpenChange } = React.useContext(CollapsibleContext)

  const handleClick = () => onOpenChange(!open)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: (e) => {
        handleClick()
        children.props.onClick?.(e)
      },
      "data-state": open ? "open" : "closed",
    })
  }

  return (
    <button type="button" onClick={handleClick} data-state={open ? "open" : "closed"} {...props}>
      {children}
    </button>
  )
}

function CollapsibleContent({ className = "", children, ...props }) {
  const { open } = React.useContext(CollapsibleContext)

  if (!open) return null

  return (
    <div data-state="open" className={className} {...props}>
      {children}
    </div>
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
