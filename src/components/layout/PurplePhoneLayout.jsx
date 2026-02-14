import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Users, MessageSquare, Settings } from 'lucide-react'
import { useTheme } from 'next-themes'

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Users, label: 'Contacts', href: '/contacts' },
  { icon: MessageSquare, label: 'Chat', href: '/conversations' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

export function PurplePhoneLayout() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col transition-colors duration-300 bg-noise',
        isDark
          ? 'bg-gradient-to-br from-purple-950 via-[#1a0b2e] to-black'
          : 'bg-gradient-to-br from-purple-50 via-white to-purple-100'
      )}
    >
      {/* Ambient glow effect - Enhanced for volume */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute top-[-10%] left-1/3 w-[500px] h-[500px] rounded-full blur-[100px] opacity-40',
            isDark ? 'bg-purple-600/20' : 'bg-purple-400/20'
          )}
        />
        <div
          className={cn(
            'absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-40',
            isDark ? 'bg-fuchsia-600/10' : 'bg-fuchsia-400/20'
          )}
        />
        {/* Central spotlight */}
        <div 
          className={cn(
             'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20',
             isDark ? 'bg-white/5' : 'bg-white/40'
          )}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative z-10 pb-28 phone-scroll-container">
        <Outlet />
      </main>

      {/* Bottom Navigation - Volumetric Dock */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe pt-2 pointer-events-none">
        <div
          className={cn(
            'mx-auto mb-4 md:mb-6 max-w-md dock-3d transition-all duration-300 pointer-events-auto',
            /* Specific border color override for Purple theme */
            isDark ? 'border-purple-300/10' : 'border-purple-300/40'
          )}
        >
          <div className="flex items-center justify-around h-20 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'nav-btn-3d flex flex-col items-center justify-center w-16 h-16 rounded-xl touch-manipulation',
                    isActive 
                      ? 'active text-purple-500 dark:text-purple-400' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-purple-500 dark:hover:text-purple-300'
                  )
                }
              >
                <item.icon className="w-6 h-6 mb-1 transition-transform duration-300" />
                <span className="text-[10px] font-bold tracking-wide uppercase text-sharp opacity-90">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
