import * as React from "react"
import { useSidebar } from "./sidebar-context"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const Sidebar = React.forwardRef(({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className = "",
  children,
  ...props
}, ref) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return openMobile ? (
      <div className="fixed inset-0 z-50 flex">
        <div className="fixed inset-0 bg-black/50" onClick={() => setOpenMobile(false)} />
        <div
          ref={ref}
          data-sidebar="sidebar"
          data-mobile="true"
          className={cn("relative z-50 flex h-full w-[18rem] flex-col bg-sidebar", className)}
          {...props}
        >
          {children}
        </div>
      </div>
    ) : null
  }

  if (collapsible === "none") {
    return (
      <div
        ref={ref}
        className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-side={side}
      data-variant={variant}
      className={cn(
        "group peer hidden md:block text-sidebar-foreground",
        "duration-200 transition-[width] ease-linear",
        state === "expanded" ? "w-[--sidebar-width]" : collapsible === "icon" ? "w-[--sidebar-width-icon]" : "w-0",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex h-full flex-col overflow-hidden bg-sidebar",
        state === "collapsed" && collapsible === "icon" && "items-center"
      )}>
        {children}
      </div>
    </div>
  )
})
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef(({ className = "", onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="trigger"
      className={cn("flex h-7 w-7 items-center justify-center rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", className)}
      onClick={(e) => { onClick?.(e); toggleSidebar() }}
      {...props}
    >
      <i className="ri-side-bar-line text-base" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef(({ className = "", ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef(({ className = "", ...props }, ref) => (
  <main
    ref={ref}
    className={cn("relative flex min-h-svh flex-1 flex-col bg-background", className)}
    {...props}
  />
))
SidebarInset.displayName = "SidebarInset"

export { Sidebar, SidebarTrigger, SidebarRail, SidebarInset }
