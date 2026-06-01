import { ReactNode } from 'react'

/**
 * ModalShell — wrapper padrão para todos os modais do app.
 * Backdrop, animação, header e close button padronizados baseados no UserModal.
 */
interface ModalShellProps {
  onClose: () => void
  children: ReactNode
  className?: string
  width?: string
  accentColor?: string   // optional top color bar
  noCloseOnBackdrop?: boolean
}

export default function ModalShell({ onClose, children, className = '', width = 'max-w-lg', accentColor, noCloseOnBackdrop }: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => !noCloseOnBackdrop && e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${width} max-h-[90vh] glass-panel rounded-2xl shadow-glass flex flex-col animate-slide-up overflow-y-auto ${className}`}
        style={{ willChange: 'transform' }}
      >
        {accentColor && (
          <div 
            className="h-1 w-full shrink-0 transition-colors duration-300" 
            style={{ backgroundColor: accentColor }} 
          />
        )}
        {children}
      </div>
    </div>
  )
}

export function ModalHeader({ icon, title, subtitle, onClose }: {
  icon?: ReactNode
  title: string
  subtitle?: string
  onClose: () => void
}) {
  return (
    <div 
      className="flex items-center justify-between px-6 py-4 shrink-0" 
      style={{ borderBottom: '1px solid var(--line-subtle)' }}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className="text-accent flex items-center shrink-0">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold tx-primary flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-[11px] tx-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="btn-ghost p-1.5 rounded-lg transition"
        title="Fechar"
      >
        <i className="ri-close-line text-lg" />
      </button>
    </div>
  )
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div 
      className="flex items-center justify-end gap-2.5 px-6 py-4 shrink-0"
      style={{ borderTop: '1px solid var(--line-subtle)' }}
    >
      {children}
    </div>
  )
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="text-[11px] font-semibold uppercase tracking-wider tx-muted">
      {children}
    </label>
  )
}
