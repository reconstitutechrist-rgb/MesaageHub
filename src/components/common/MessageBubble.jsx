import { cn, formatRelativeTime } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'
import { MESSAGE_STATUS } from '@/lib/constants'

const statusIcons = {
  [MESSAGE_STATUS.SENDING]: Clock,
  [MESSAGE_STATUS.SENT]: Check,
  [MESSAGE_STATUS.DELIVERED]: CheckCheck,
  [MESSAGE_STATUS.READ]: CheckCheck,
  [MESSAGE_STATUS.FAILED]: AlertCircle,
}

export function MessageBubble({ message, isOwn = false, showAvatar = true, showTimestamp = true }) {
  const StatusIcon = statusIcons[message.status] || Check

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[85%] sm:max-w-[75%] md:max-w-[65%]',
        isOwn ? 'ml-auto flex-row-reverse' : ''
      )}
    >
      {showAvatar && !isOwn && (
        <UserAvatar user={message.sender} size="sm" className="mt-1 flex-shrink-0" />
      )}

      <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
        {!isOwn && message.sender?.name && (
          <span className="text-xs text-muted-foreground mb-1">{message.sender.name}</span>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-2 max-w-full break-words',
            isOwn ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'
          )}
        >
          <p className="text-base sm:text-sm whitespace-pre-wrap">{message.content}</p>

          {message.attachment && (
            <div className="mt-2">
              {message.attachment.type === 'image' ? (
                <img
                  src={message.attachment.url}
                  alt={message.attachment.name}
                  className="rounded-lg max-w-full max-h-60 object-cover"
                />
              ) : (
                <a
                  href={message.attachment.url}
                  className="text-xs underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {message.attachment.name}
                </a>
              )}
            </div>
          )}
        </div>

        {showTimestamp && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(message.createdAt)}
            </span>
            {isOwn && (
              <StatusIcon
                className={cn(
                  'h-3 w-3',
                  message.status === MESSAGE_STATUS.READ
                    ? 'text-primary'
                    : message.status === MESSAGE_STATUS.FAILED
                      ? 'text-destructive'
                      : 'text-muted-foreground'
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
