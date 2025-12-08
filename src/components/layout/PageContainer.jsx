import { cn } from '@/lib/utils'

export function PageContainer({ children, className }) {
  return (
    <div className={cn('w-full px-4 py-4 md:container md:mx-auto md:p-6', className)}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
