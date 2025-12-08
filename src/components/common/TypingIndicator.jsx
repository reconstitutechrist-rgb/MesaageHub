import { cn } from '@/lib/utils'

export function TypingIndicator({ users = [], className }) {
  if (!users || users.length === 0) return null

  const displayText =
    users.length === 1
      ? `${users[0].name} is typing`
      : users.length === 2
        ? `${users[0].name} and ${users[1].name} are typing`
        : `${users[0].name} and ${users.length - 1} others are typing`

  return (
    <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
      <div className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce" />
      </div>
      <span>{displayText}</span>
    </div>
  )
}
