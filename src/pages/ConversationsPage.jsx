import { useState, useEffect, useRef } from 'react'
import { PageContainer, PageHeader } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { MarketingAIModal } from '@/components/common/MarketingAIModal'
import {
  MessageSquare,
  Plus,
  X,
  Paperclip,
  Image as ImageIcon,
  Mail,
  Phone,
  Sparkles,
  FileText,
  Calendar,
  Clock,
  Mic,
  Square,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useLocalStorage, useDebounce } from '@/hooks'
import { initialContacts, initialTemplates } from '@/data/mockData'
import { toast } from 'sonner'

export default function ConversationsPage() {
  const conversations = [] // This would come from your API

  // State
  const [contacts] = useLocalStorage('contacts', initialContacts)
  const [showComposeDialog, setShowComposeDialog] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [message, setMessage] = useState('')
  const [recipients, setRecipients] = useState([])
  const [attachments, setAttachments] = useState([])
  const [scheduledDate, setScheduledDate] = useState('')

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef(null)

  const fileInputRef = useRef(null)

  const debouncedMessage = useDebounce(message, 500)

  // Auto-targeting logic: scan message for interests
  useEffect(() => {
    if (!debouncedMessage) return

    const lowerMessage = debouncedMessage.toLowerCase()

    // Find contacts whose interests match the message content
    const matchedContacts = contacts.filter((contact) => {
      if (!contact.interests || contact.interests.length === 0) return false
      // Check if any interest keyword appears in the message
      return contact.interests.some((interest) => lowerMessage.includes(interest.toLowerCase()))
    })

    // Add new matches to recipients list
    setRecipients((prev) => {
      const currentIds = new Set(prev.map((c) => c.id))
      const newRecipients = matchedContacts.filter((c) => !currentIds.has(c.id))

      if (newRecipients.length === 0) return prev

      // Notify user of auto-added recipients
      if (newRecipients.length === 1) {
        toast.info(`Auto-added ${newRecipients[0].name} based on interest match`)
      } else {
        toast.info(`Auto-added ${newRecipients.length} recipients based on interest match`)
      }

      return [...prev, ...newRecipients]
    })
  }, [debouncedMessage, contacts])

  const handleRemoveRecipient = (id) => {
    setRecipients((prev) => prev.filter((c) => c.id !== id))
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleStartRecording = () => {
    setIsRecording(true)
    setRecordingSeconds(0)
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1)
    }, 1000)
  }

  const handleStopRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    setIsRecording(false)

    // Create mock audio file
    const mins = Math.floor(recordingSeconds / 60)
    const secs = recordingSeconds % 60
    const duration = `${mins}:${secs.toString().padStart(2, '0')}`
    const fileName = `Voice Note (${duration}).mp3`
    const file = new File([''], fileName, { type: 'audio/mp3' })

    setAttachments((prev) => [...prev, file])
    toast.success('Voice note attached')
  }

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [])

  const handleAIImageGenerated = (file, targetingText) => {
    setAttachments([file])
    // Pre-fill message with targeting text to trigger auto-selection
    setMessage(targetingText)
    setShowComposeDialog(true)
    toast.success('AI Image attached and message updated!')
  }

  const handleSendMessage = () => {
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient')
      return
    }
    if (!message.trim() && attachments.length === 0) {
      toast.error('Please enter a message or attach a file')
      return
    }

    if (scheduledDate) {
      const date = new Date(scheduledDate).toLocaleString()
      toast.success(`Message scheduled for ${date} to ${recipients.length} recipients`)
    } else {
      toast.success(`Message sent to ${recipients.length} recipients`)
    }

    // Reset state
    setShowComposeDialog(false)
    setMessage('')
    setRecipients([])
    setAttachments([])
    setScheduledDate('')
  }

  const getMethodIcon = (method) => {
    switch (method) {
      case 'phone':
        return <Phone className="h-3 w-3 mr-1" />
      case 'email':
      default:
        return <Mail className="h-3 w-3 mr-1" />
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Conversations" description="Manage your message threads">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAIModal(true)}>
            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
            AI Studio
          </Button>
          <Button onClick={() => setShowComposeDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Compose Message
          </Button>
        </div>
      </PageHeader>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <EmptyState
              icon={MessageSquare}
              title="No conversations yet"
              description="Start a new conversation or use the AI Studio to create marketing content."
              action={
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button variant="outline" onClick={() => setShowAIModal(true)}>
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                    Open AI Studio
                  </Button>
                  <Button onClick={() => setShowComposeDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Compose Message
                  </Button>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">{/* Conversation list would go here */}</div>
      )}

      {/* AI Marketing Studio Modal */}
      <MarketingAIModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        onImageGenerated={handleAIImageGenerated}
      />

      {/* Schedule Message Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Message</DialogTitle>
            <DialogDescription>Choose a date and time to send this message.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-time">Date & Time</Label>
              <Input
                id="schedule-time"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setScheduledDate('')
                setShowScheduleDialog(false)
              }}
            >
              Clear
            </Button>
            <Button onClick={() => setShowScheduleDialog(false)}>Confirm Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Compose Message Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Compose Message</DialogTitle>
            <DialogDescription>
              Write your message. Recipients will be automatically added based on their interests.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Recipients ({recipients.length})</Label>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
                {recipients.length === 0 && (
                  <span className="text-muted-foreground text-sm py-1">
                    Recipients will appear here...
                  </span>
                )}
                {recipients.map((contact) => (
                  <Badge
                    key={contact.id}
                    variant="secondary"
                    className="h-7 pr-1 flex items-center"
                  >
                    {getMethodIcon(contact.preferredMethod)}
                    {contact.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => handleRemoveRecipient(contact.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message">Message</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <FileText className="mr-1 h-3 w-3" />
                      Templates
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Choose a Template</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {initialTemplates.map((template) => (
                      <DropdownMenuItem
                        key={template.id}
                        onClick={() =>
                          setMessage((prev) =>
                            prev ? `${prev}\n\n${template.content}` : template.content
                          )
                        }
                      >
                        {template.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <textarea
                id="message"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type your message here... (e.g., 'We have a sale on gold rings')"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-muted p-2 rounded-md text-sm"
                    >
                      <ImageIcon className="h-4 w-4" />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 text-red-600 rounded-md animate-pulse">
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                  <span className="text-sm font-medium">
                    Recording... {Math.floor(recordingSeconds / 60)}:
                    {recordingSeconds % 60 < 10 ? '0' : ''}
                    {recordingSeconds % 60}
                  </span>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />

                {isRecording ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={handleStopRecording}
                    className="animate-pulse"
                  >
                    <Square className="h-4 w-4 mr-2 fill-current" />
                    Stop Recording
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" type="button" onClick={handleStartRecording}>
                    <Mic className="h-4 w-4 mr-2" />
                    Voice Note
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach Media
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  onClick={() => {
                    setShowComposeDialog(false)
                    setShowAIModal(true)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create with AI
                </Button>

                <div className="ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowScheduleDialog(true)}
                    className={scheduledDate ? 'text-blue-600 bg-blue-50' : ''}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {scheduledDate
                      ? new Date(scheduledDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Schedule'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage}>
              {scheduledDate ? (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Message
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
