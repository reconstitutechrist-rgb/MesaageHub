import { cn, formatRelativeTime } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCall } from '@/components/providers/CallProvider'
import { MessageSquare, MoreVertical, UserX, Info, Flame, Phone } from 'lucide-react'

export function ContactCard({ contact, onMessage, onBlock, onViewProfile }) {
  const { startCall } = useCall()
  const { name, email, isOnline, lastSeen, engagementScore = 0 } = contact

  const getEngagementColor = (score) => {
    if (score >= 80) return 'text-red-500 fill-red-500'
    if (score >= 50) return 'text-orange-500 fill-orange-500'
    return 'text-gray-300'
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative flex-shrink-0">
            <UserAvatar user={contact} size="lg" />
            {isOnline && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold truncate">{name}</h3>
                  <Flame
                    className={cn('h-4 w-4', getEngagementColor(engagementScore))}
                    title={`Engagement Score: ${engagementScore}`}
                  />
                </div>
                {email && <p className="text-sm text-muted-foreground truncate">{email}</p>}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-8 sm:w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewProfile?.(contact)}>
                    <Info className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMessage?.(contact)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onBlock?.(contact)}
                    className="text-destructive focus:text-destructive"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Block Contact
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {contact.interests && contact.interests.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {contact.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] px-1 py-0 h-5">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mt-3">
              <span
                className={cn('text-xs', isOnline ? 'text-green-600' : 'text-muted-foreground')}
              >
                {isOnline
                  ? 'Online'
                  : lastSeen
                    ? `Last seen ${formatRelativeTime(lastSeen)}`
                    : 'Offline'}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                className="flex-1 h-11"
                onClick={() => onMessage?.(contact)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message
              </Button>
              <Button variant="outline" className="flex-1 h-11" onClick={() => startCall(contact)}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
