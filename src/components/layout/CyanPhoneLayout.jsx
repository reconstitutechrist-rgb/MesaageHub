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

export function CyanPhoneLayout() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col transition-colors duration-300 bg-noise',
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-[#0a0f1e] to-slate-950'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      )}
    >
      {/* Ambient glow effect - Enhanced for volume */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40',
            isDark ? 'bg-cyan-500/20' : 'bg-cyan-400/20'
          )}
        />
        <div
          className={cn(
            'absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-40',
            isDark ? 'bg-cyan-600/10' : 'bg-cyan-500/20'
          )}
        />
        {/* Central spotlight for depth */}
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
            /* Specific border color override for Cyan theme to blend with dock-3d */
            isDark ? 'border-white/10' : 'border-white/40'
          )}
        >
          <div className="flex items-center justify-around h-20 px-2"> {/* Increased height for floating feel */}
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'nav-btn-3d flex flex-col items-center justify-center w-16 h-16 rounded-xl touch-manipulation',
                    isActive 
                      ? 'active text-cyan-500 dark:text-cyan-400' 
                      : 'text-slate-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-300'
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
