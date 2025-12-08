import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { Separator } from '@/components/ui/separator'
import { groupMessagesByDate, formatMessageDate } from '@/lib/utils'

export function MessageList({ messages, currentUserId, className }) {
  const bottomRef = useRef(null)
  const groupedMessages = groupMessagesByDate(messages)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!messages || messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <ScrollArea className={className}>
      <div className="flex flex-col gap-4 p-4">
        {Object.entries(groupedMessages).map(([date, dayMessages]) => (
          <div key={date}>
            <div className="flex items-center gap-4 my-4">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground font-medium">
                {formatMessageDate(date)}
              </span>
              <Separator className="flex-1" />
            </div>

            <div className="flex flex-col gap-2">
              {dayMessages.map((message, index) => {
                const isOwn = message.senderId === currentUserId
                const showAvatar =
                  !isOwn && (index === 0 || dayMessages[index - 1]?.senderId !== message.senderId)

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                  />
                )
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
