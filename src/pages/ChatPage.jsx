import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/common/UserAvatar'
import { Send } from 'lucide-react'

export default function ChatPage() {
  const { id: _conversationId } = useParams()
  const messages = [] // This would come from your API

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-3 border-b p-4">
        <UserAvatar user={{ name: 'Contact Name' }} />
        <div>
          <h2 className="font-semibold">Contact Name</h2>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">{/* Messages would be rendered here */}</div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="border-t p-4">
        <form className="flex gap-2">
          <Input placeholder="Type a message..." className="flex-1" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
