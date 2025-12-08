import { cn } from '@/lib/utils'

export function PageContainer({ children, className }) {
  return <div className={cn('container mx-auto p-6', className)}>{children}</div>
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
