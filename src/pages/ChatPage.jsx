import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  UserAvatar,
  MessageBubble,
  TypingIndicator,
  OnlineStatus,
  ConfirmDialog,
  EmptyState,
} from '@/components/common'
import { useKeyboardShortcut, SHORTCUTS } from '@/hooks'
import { groupMessagesByDate, formatMessageDate, generateId } from '@/lib/utils'
import {
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Trash2,
  Bell,
  BellOff,
  UserX,
  MessageSquare,
} from 'lucide-react'

// Mock current user - would come from AuthContext in real app
const currentUser = {
  id: 'current-user',
  name: 'You',
  avatar: null,
}

// Mock conversation data - would come from API
const mockConversations = {
  1: {
    id: '1',
    participant: {
      id: 'user-1',
      name: 'Alice Johnson',
      avatar: null,
      status: 'online',
      lastSeen: null,
    },
    isMuted: false,
    messages: [
      {
        id: 'm1',
        content: 'Hey! How are you doing?',
        senderId: 'user-1',
        timestamp: new Date(Date.now() - 86400000 * 2), // 2 days ago
        status: 'read',
      },
      {
        id: 'm2',
        content: "I'm doing great, thanks for asking! Just finished that project we discussed.",
        senderId: 'current-user',
        timestamp: new Date(Date.now() - 86400000 * 2 + 60000),
        status: 'read',
      },
      {
        id: 'm3',
        content: "That's awesome! I'd love to see it when you have time.",
        senderId: 'user-1',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        status: 'read',
      },
      {
        id: 'm4',
        content: 'Sure! I can share it with you later today.',
        senderId: 'current-user',
        timestamp: new Date(Date.now() - 86400000 + 300000),
        status: 'read',
      },
      {
        id: 'm5',
        content: 'Are you free for a quick call?',
        senderId: 'user-1',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        status: 'read',
      },
    ],
  },
  2: {
    id: '2',
    participant: {
      id: 'user-2',
      name: 'Bob Smith',
      avatar: null,
      status: 'offline',
      lastSeen: new Date(Date.now() - 1800000), // 30 min ago
    },
    isMuted: true,
    messages: [
      {
        id: 'm1',
        content: 'Did you see the game last night?',
        senderId: 'user-2',
        timestamp: new Date(Date.now() - 7200000),
        status: 'read',
      },
    ],
  },
}

export default function ChatPage() {
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const fileInputRef = useRef(null)

  // State
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Load conversation data
  useEffect(() => {
    if (conversationId && mockConversations[conversationId]) {
      const conv = mockConversations[conversationId]
      setConversation(conv)
      setMessages(conv.messages)
      setIsMuted(conv.isMuted)
    } else {
      setConversation(null)
      setMessages([])
    }
  }, [conversationId])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [conversationId])

  // Simulate typing indicator
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderId === 'current-user') {
        setIsTyping(true)
        const timeout = setTimeout(() => setIsTyping(false), 2000)
        return () => clearTimeout(timeout)
      }
    }
  }, [messages])

  // Send message handler
  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault()

      const content = newMessage.trim()
      if (!content || isSending) return

      setIsSending(true)

      const message = {
        id: generateId(),
        content,
        senderId: 'current-user',
        timestamp: new Date(),
        status: 'sending',
      }

      // Optimistic update
      setMessages((prev) => [...prev, message])
      setNewMessage('')

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Update message status to sent
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, status: 'sent' } : m)))

      // Simulate delivery after another moment
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, status: 'delivered' } : m))
        )
      }, 1000)

      setIsSending(false)
      inputRef.current?.focus()
    },
    [newMessage, isSending]
  )

  // Handle file attachment
  const handleAttachment = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file and send as attachment
      console.log('File selected:', file.name)
      // Reset input
      e.target.value = ''
    }
  }, [])

  // Delete conversation
  const handleDeleteConversation = useCallback(() => {
    // In a real app, call API to delete
    console.log('Deleting conversation:', conversationId)
    setShowDeleteDialog(false)
    navigate('/conversations')
  }, [conversationId, navigate])

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    // In a real app, call API to update mute status
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcut(SHORTCUTS.ESCAPE, () => {
    navigate('/conversations')
  })

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages)

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="No conversation selected"
          description="Select a conversation from the list to start chatting"
          action={<Button onClick={() => navigate('/conversations')}>View Conversations</Button>}
        />
      </div>
    )
  }

  const { participant } = conversation

  return (
    <div className="flex h-full flex-col">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate('/conversations')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <UserAvatar user={participant} showStatus status={participant.status} />
          <div>
            <h2 className="font-semibold">{participant.name}</h2>
            <OnlineStatus
              isOnline={participant.status === 'online'}
              lastSeen={participant.lastSeen}
              className="text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" title="Voice call">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" title="Video call">
            <Video className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleToggleMute}>
                {isMuted ? (
                  <>
                    <Bell className="mr-2 h-4 w-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <BellOff className="mr-2 h-4 w-4" />
                    Mute
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserX className="mr-2 h-4 w-4" />
                Block user
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              description={`Start your conversation with ${participant.name}`}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date separator */}
                <div className="mb-4 flex items-center justify-center">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {formatMessageDate(new Date(date))}
                  </span>
                </div>
                {/* Messages for this date */}
                <div className="space-y-2">
                  {dateMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === currentUser.id}
                      sender={message.senderId === currentUser.id ? currentUser : participant}
                      showAvatar={message.senderId !== currentUser.id}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && <TypingIndicator userName={participant.name} />}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleAttachment}
            title="Attach file"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending}
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone and all messages will be permanently deleted."
        confirmText="Delete"
        onConfirm={handleDeleteConversation}
        variant="destructive"
      />
    </div>
  )
}
