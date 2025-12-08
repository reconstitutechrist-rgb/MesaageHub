import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, getInitials } from '@/lib/utils'

export function UserAvatar({ user, className, size = 'default' }) {
  const sizeClasses = {
    sm: 'h-6 w-6 text-xs',
    default: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-14 w-14 text-lg',
  }

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user?.avatar} alt={user?.name} />
      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
    </Avatar>
  )
}
