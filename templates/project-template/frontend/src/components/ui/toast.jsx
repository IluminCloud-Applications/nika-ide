import * as React from "react"
import { createPortal } from "react-dom"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

const ToastContext = React.createContext({ toasts: [], addToast: () => {}, removeToast: () => {} })

let toastCount = 0

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([])

  const addToast = React.useCallback(({ title, description, variant = "default", duration = TOAST_REMOVE_DELAY }) => {
    const id = ++toastCount
    setToasts((prev) => [...prev, { id, title, description, variant, duration }].slice(-TOAST_LIMIT))
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration)
    return id
  }, [])

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]">
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function Toast({ toast, onClose }) {
  const variants = {
    default: "border bg-background text-foreground",
    destructive: "border-destructive bg-destructive text-destructive-foreground",
  }

  return (
    <div
      className={`group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md p-4 shadow-lg transition-all ${
        variants[toast.variant] || variants.default
      }`}
      role="alert"
    >
      <div className="grid gap-1">
        {toast.title && <div className="text-sm font-semibold">{toast.title}</div>}
        {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
      </div>
      <button
        onClick={onClose}
        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
      >
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="3" x2="12" y2="12" /><line x1="12" y1="3" x2="3" y2="12" />
        </svg>
      </button>
    </div>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return { toast: context.addToast, dismiss: context.removeToast, toasts: context.toasts }
}

export { ToastProvider, Toast, useToast }
