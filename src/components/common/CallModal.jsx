import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { UserAvatar } from './UserAvatar'
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react'

export function CallModal({ call, onEndCall }) {
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideo, setIsVideo] = useState(false)

  // Timer
  useEffect(() => {
    if (call.status === 'connected') {
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setDuration(0)
    }
  }, [call.status])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!call.isActive) return null

  return (
    <Dialog open={call.isActive} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-none shadow-2xl"
        hideCloseButton
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{call.contact.name}</h2>
            <p className="text-muted-foreground">
              {call.status === 'ringing' ? 'Calling...' : formatDuration(duration)}
            </p>
          </div>

          <div className="relative">
            <UserAvatar
              user={call.contact}
              className="h-32 w-32 border-4 border-background shadow-xl"
            />
            {call.status === 'ringing' && (
              <span className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            )}
          </div>

          <div className="flex items-center justify-center gap-6 w-full">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-16 w-16 rounded-full shadow-lg hover:bg-red-600"
              onClick={onEndCall}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 rounded-full"
              onClick={() => setIsVideo(!isVideo)}
            >
              {isVideo ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
