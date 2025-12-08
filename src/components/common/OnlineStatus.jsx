import { cn, formatRelativeTime } from '@/lib/utils'

export function OnlineStatus({ isOnline, lastSeen, showText = true, size = 'default' }) {
  const sizeClasses = {
    sm: 'h-2 w-2',
    default: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          sizeClasses[size],
          isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'
        )}
      />
      {showText && (
        <span className={cn('text-xs', isOnline ? 'text-green-600' : 'text-muted-foreground')}>
          {isOnline ? 'Online' : lastSeen ? `Last seen ${formatRelativeTime(lastSeen)}` : 'Offline'}
        </span>
      )}
    </div>
  )
}
