type PageHeaderProps = {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-muted sm:text-base">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
