import * as React from "react"

const TabsContext = React.createContext({ value: "", onValueChange: () => {} })

const Tabs = React.forwardRef(
  ({ className = "", defaultValue = "", value: controlledValue, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue)
    const value = controlledValue !== undefined ? controlledValue : internalValue

    const handleValueChange = React.useCallback(
      (newValue) => {
        if (controlledValue === undefined) setInternalValue(newValue)
        onValueChange?.(newValue)
      },
      [controlledValue, onValueChange]
    )

    return (
      <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
    role="tablist"
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className = "", value, ...props }, ref) => {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isActive = selectedValue === value

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-background text-foreground shadow"
          : "hover:bg-background/50 hover:text-foreground"
      } ${className}`}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className = "", value, ...props }, ref) => {
  const { value: selectedValue } = React.useContext(TabsContext)

  if (selectedValue !== value) return null

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
