import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, MessageSquare, Settings, Sparkles } from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard' },
  { icon: Users, label: 'Contacts', href: '/contacts' },
  { icon: MessageSquare, label: 'Chat', href: '/conversations' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function PhoneLayout() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-0 md:p-8">
      {/* Phone Frame Container */}
      <div className="w-full h-full md:w-[400px] md:h-[850px] bg-background md:rounded-[3rem] md:border-[8px] md:border-gray-900 overflow-hidden shadow-2xl relative flex flex-col transition-all duration-300">
        {/* Dynamic Notch/Status Bar Area (Desktop only visual) */}
        <div className="hidden md:flex justify-center pt-2 pb-1 bg-background z-50">
          <div className="w-32 h-6 bg-gray-900 rounded-full" />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin pb-16 bg-background">
          <div className="min-h-full">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 left-0 right-0 h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-around px-2 z-40">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/70'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
