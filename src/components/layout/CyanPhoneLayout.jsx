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
        'min-h-screen w-full flex flex-col transition-colors duration-300',
        isDark
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
          : 'bg-gradient-to-br from-slate-100 via-slate-50 to-white'
      )}
    >
      {/* Ambient glow effect - reduced blur for mobile crispness */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-2xl',
            isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'
          )}
        />
        <div
          className={cn(
            'absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-2xl',
            isDark ? 'bg-cyan-500/5' : 'bg-cyan-500/10'
          )}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin relative z-10 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation - Glassmorphism Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-safe bg-gradient-to-t from-background to-transparent pointer-events-none">
        <div
          className={cn(
            'mx-auto mb-4 md:mb-6 max-w-md backdrop-blur-md rounded-2xl border transition-all duration-300 pointer-events-auto',
            isDark
              ? 'bg-slate-800/70 border-slate-700/50'
              : 'bg-white/85 border-slate-200 shadow-lg'
          )}
          style={{
            boxShadow: isDark
              ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 4px 16px -4px rgba(0,0,0,0.5)'
              : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 4px 16px -4px rgba(6,182,212,0.15)',
          }}
        >
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-200 touch-manipulation transform hover:scale-105 active:scale-95',
                    isActive
                      ? isDark
                        ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20'
                        : 'bg-cyan-500/10 text-cyan-600 shadow-md shadow-cyan-200/50'
                      : isDark
                        ? 'text-slate-500 hover:text-cyan-300'
                        : 'text-slate-400 hover:text-cyan-500'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </nav>
    </div>
  )
}
