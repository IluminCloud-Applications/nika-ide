import { ReactNode } from 'react'

/**
 * PageShell — wrapper padrão para todas as páginas principais.
 * Usa classes semânticas do design system para adaptar ao tema light/dark.
 */
export default function PageShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`page-root ${className}`}>
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 p-8">
        {children}
      </div>
    </div>
  )
}
