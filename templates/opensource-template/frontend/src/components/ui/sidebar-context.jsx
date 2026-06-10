import * as React from "react"

const SIDEBAR_COOKIE = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const SidebarContext = React.createContext(null)

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  )
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)")
    const handler = () => setIsMobile(mql.matches)
    mql.addEventListener("change", handler)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", handler)
  }, [])
  return isMobile
}

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

function SidebarProvider({ defaultOpen = true, open: openProp, onOpenChange, className = "", style, children, ...props }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp !== undefined ? openProp : _open

  const setOpen = React.useCallback((value) => {
    const next = typeof value === "function" ? value(open) : value
    if (onOpenChange) onOpenChange(next)
    else _setOpen(next)
    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [open, onOpenChange])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((v) => !v)
    else setOpen((v) => !v)
  }, [isMobile, setOpen])

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"

  const value = React.useMemo(() => ({
    state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar,
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={value}>
      <div
        className={`group/sidebar-wrapper flex min-h-svh w-full ${className}`}
        style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem", ...style }}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export { SidebarProvider, useSidebar, useIsMobile }
