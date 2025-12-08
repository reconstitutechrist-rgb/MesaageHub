import { Link } from 'react-router-dom'
import { cn, formatRelativeTime, truncate } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Badge } from '@/components/ui/badge'
import { Pin, Volume2, VolumeX } from 'lucide-react'

export function ConversationItem({ conversation, isActive = false }) {
  const { id, participant, lastMessage, unreadCount, isPinned, isMuted } = conversation

  return (
    <Link
      to={`/conversations/${id}`}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted/50',
        isActive && 'bg-muted',
        unreadCount > 0 && 'bg-muted/30'
      )}
    >
      <div className="relative flex-shrink-0">
        <UserAvatar user={participant} />
        {participant?.isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('font-medium truncate', unreadCount > 0 && 'font-semibold')}>
            {participant?.name || 'Unknown'}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isPinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            {isMuted && <VolumeX className="h-3 w-3 text-muted-foreground" />}
            {lastMessage?.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              'text-sm truncate',
              unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
            )}
          >
            {lastMessage?.content ? truncate(lastMessage.content, 40) : 'No messages yet'}
          </p>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
