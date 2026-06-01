import * as React from "react"
import { useSidebar } from "./sidebar-context"

function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

const SidebarMenu = React.forwardRef(({ className = "", ...props }, ref) => (
  <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className = "", ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({
  asChild = false, isActive = false, tooltip, size = "default", className = "", children, ...props
}, ref) => {
  const { state } = useSidebar()
  const buttonClass = cn(
    "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>i]:size-4 [&>i]:shrink-0",
    size === "sm" && "h-7 text-xs",
    size === "lg" && "h-12 text-sm group-data-[collapsible=icon]:!p-0",
    isActive && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
    className
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ref, "data-active": isActive, className: buttonClass, ...props })
  }

  const button = (
    <button ref={ref} type="button" data-active={isActive} className={buttonClass} {...props}>
      {children}
    </button>
  )

  if (!tooltip || state !== "collapsed") return button

  return (
    <div className="relative group/tooltip">
      {button}
      <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 hidden rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover/tooltip:block whitespace-nowrap">
        {typeof tooltip === "string" ? tooltip : tooltip}
      </div>
    </div>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef(({ className = "", asChild = false, showOnHover = false, children, ...props }, ref) => {
  const actionClass = cn(
    "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 group-data-[collapsible=icon]:hidden",
    showOnHover && "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
    className
  )
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ref, className: actionClass, ...props })
  }
  return (
    <button ref={ref} type="button" data-sidebar="menu-action" className={actionClass} {...props}>
      {children}
    </button>
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuSub = React.forwardRef(({ className = "", ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden", className)}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef(({ ...props }, ref) => (
  <li ref={ref} {...props} />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef(({ asChild = false, isActive = false, className = "", children, ...props }, ref) => {
  const buttonClass = cn(
    "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>i]:size-4 [&>i]:shrink-0 text-sm",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
    className
  )
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { ref, "data-active": isActive, className: buttonClass, ...props })
  }
  return (
    <button ref={ref} type="button" data-active={isActive} className={buttonClass} {...props}>
      {children}
    </button>
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarMenuAction, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
}
