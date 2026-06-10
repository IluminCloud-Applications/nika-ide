import * as React from "react"

const CommandContext = React.createContext({ search: "", setSearch: () => {} })

const Command = React.forwardRef(({ className = "", children, ...props }, ref) => {
  const [search, setSearch] = React.useState("")

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <div
        ref={ref}
        className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground ${className}`}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
})
Command.displayName = "Command"

const CommandInput = React.forwardRef(({ className = "", placeholder = "Search...", ...props }, ref) => {
  const { search, setSearch } = React.useContext(CommandContext)

  return (
    <div className="flex items-center border-b px-3">
      <svg className="mr-2 h-4 w-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        ref={ref}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className={`flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      />
    </div>
  )
})
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef(({ className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className}`}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`py-6 text-center text-sm ${className}`} {...props} />
))
CommandEmpty.displayName = "CommandEmpty"

const CommandGroup = React.forwardRef(({ className = "", heading, children, ...props }, ref) => (
  <div
    ref={ref}
    className={`overflow-hidden p-1 text-foreground ${className}`}
    {...props}
  >
    {heading && (
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
    )}
    {children}
  </div>
))
CommandGroup.displayName = "CommandGroup"

const CommandItem = React.forwardRef(({ className = "", disabled = false, children, ...props }, ref) => {
  const { search } = React.useContext(CommandContext)
  const textContent = typeof children === "string" ? children : ""

  // Basic filter: hide items that don't match search (only for string children)
  if (search && textContent && !textContent.toLowerCase().includes(search.toLowerCase())) {
    return null
  }

  return (
    <div
      ref={ref}
      className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
        disabled ? "pointer-events-none opacity-50" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
})
CommandItem.displayName = "CommandItem"

const CommandSeparator = React.forwardRef(({ className = "", ...props }, ref) => (
  <div ref={ref} className={`-mx-1 h-px bg-border ${className}`} {...props} />
))
CommandSeparator.displayName = "CommandSeparator"

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator }
