import { cn, formatRelativeTime } from '@/lib/utils'
import { UserAvatar } from './UserAvatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MessageSquare, MoreVertical, UserX, Info } from 'lucide-react'

export function ContactCard({ contact, onMessage, onBlock, onViewProfile }) {
  const { name, email, isOnline, lastSeen } = contact

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
                <h3 className="font-semibold truncate">{name}</h3>
                {email && <p className="text-sm text-muted-foreground truncate">{email}</p>}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => onMessage?.(contact)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Message
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
