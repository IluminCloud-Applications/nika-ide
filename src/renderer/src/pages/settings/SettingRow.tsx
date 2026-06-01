import React from 'react'

interface SettingRowProps {
  icon: React.ElementType
  iconColor: string
  title: string
  description: string
  children: React.ReactNode
  noWrapper?: boolean
}

export default function SettingRow({ icon: Icon, iconColor, title, description, children, noWrapper }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 px-5 py-5 last:border-0"
      style={{ borderBottom: '1px solid var(--line-subtle)' }}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {noWrapper ? (
          <div className="shrink-0 mt-0.5 flex items-center justify-center w-8 h-8">
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
        ) : (
          <div className="p-2 rounded-lg shrink-0 mt-0.5" style={{ backgroundColor: 'var(--surface-overlay)' }}>
            <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium tx-primary">{title}</p>
          <p className="text-xs tx-muted mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0 flex items-center">
        {children}
      </div>
    </div>
  )
}
