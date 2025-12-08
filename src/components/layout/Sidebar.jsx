import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { mainNavigation, userNavigation } from '@/config/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAuth } from '@/components/providers/AuthProvider'
import { UserAvatar } from '@/components/common/UserAvatar'
import { MessageSquare } from 'lucide-react'

function SidebarNavigation({ onNavigate }) {
  return (
    <>
      <nav className="space-y-1">
        {mainNavigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <Separator className="my-4" />

      <nav className="space-y-1">
        {userNavigation.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function SidebarUserSection() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <UserAvatar user={user} size="sm" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium text-sidebar-foreground">
          {user.name || 'User'}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email || 'user@example.com'}</p>
      </div>
    </div>
  )
}

export function Sidebar({ className }) {
  return (
    <aside className={cn('flex w-64 flex-col border-r bg-sidebar', className)}>
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <MessageSquare className="h-6 w-6 text-sidebar-primary" />
        <span className="ml-2 text-lg font-semibold text-sidebar-foreground">MessageHub</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <SidebarNavigation />
      </ScrollArea>

      {/* User section at bottom */}
      <div className="border-t p-4">
        <SidebarUserSection />
      </div>
    </aside>
  )
}

export function MobileSidebar({ open, onOpenChange }) {
  const handleNavigate = () => {
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="flex h-14 flex-row items-center border-b px-4">
          <MessageSquare className="h-6 w-6 text-primary" />
          <SheetTitle className="ml-2 text-lg font-semibold">MessageHub</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 px-3 py-4">
          <SidebarNavigation onNavigate={handleNavigate} />
        </ScrollArea>

        <div className="border-t p-4">
          <SidebarUserSection />
        </div>
      </SheetContent>
    </Sheet>
  )
}
