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
        'fixed inset-0 flex items-center justify-center p-0 md:p-6 transition-colors duration-300',
        isDark
          ? 'bg-gradient-to-br from-purple-950 via-slate-950 to-black'
          : 'bg-gradient-to-br from-purple-50 via-slate-50 to-white'
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl',
            isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'
          )}
        />
        <div
          className={cn(
            'absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-3xl',
            isDark ? 'bg-fuchsia-500/10' : 'bg-fuchsia-300/20'
          )}
        />
      </div>

      {/* Phone Frame Container */}
      <div
        className={cn(
          'relative w-full h-full md:w-[400px] md:h-[860px] md:rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500',
          isDark ? 'shadow-purple-500/20' : 'shadow-purple-300/30'
        )}
      >
        {/* Gradient border for desktop */}
        <div
          className={cn(
            'hidden md:block absolute inset-0 rounded-[3rem] p-[2px]',
            isDark
              ? 'bg-gradient-to-b from-purple-500/40 via-fuchsia-500/20 to-purple-500/30'
              : 'bg-gradient-to-b from-purple-400/50 via-fuchsia-300/30 to-purple-400/40'
          )}
        >
          <div
            className={cn(
              'absolute inset-[2px] rounded-[2.9rem]',
              isDark ? 'bg-slate-950' : 'bg-white'
            )}
          />
        </div>

        {/* Inner container */}
        <div
          className={cn(
            'relative w-full h-full md:rounded-[2.85rem] flex flex-col overflow-hidden transition-colors duration-300',
            isDark
              ? 'bg-gradient-to-b from-slate-950 via-slate-950 to-black'
              : 'bg-gradient-to-b from-white via-slate-50 to-purple-50/50'
          )}
        >
          {/* Status Bar / Notch Area (Desktop only) */}
          <div
            className={cn(
              'hidden md:flex items-center justify-between px-8 pt-4 pb-2 z-50 text-sm',
              isDark ? 'text-white' : 'text-slate-800'
            )}
          >
            <span className="font-medium">9:41</span>
            <div
              className={cn(
                'w-28 h-7 rounded-full flex items-center justify-center',
                isDark ? 'bg-black' : 'bg-slate-900'
              )}
            >
              <div className="w-12 h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <div className="flex gap-[2px]">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn('w-1 h-3 rounded-full', isDark ? 'bg-white' : 'bg-slate-800')}
                    style={{ opacity: i <= 3 ? 1 : 0.3 }}
                  />
                ))}
              </div>
              <span className="ml-1">⚡</span>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
            <div className="min-h-full pb-24">
              <Outlet />
            </div>
          </main>

          {/* Bottom Navigation - Glassmorphism Style with 3D effects */}
          <nav className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-safe">
            <div
              className={cn(
                'mx-auto mb-4 md:mb-6 backdrop-blur-xl rounded-2xl border transition-all duration-300',
                isDark
                  ? 'bg-slate-800/60 border-purple-500/20'
                  : 'bg-white/80 border-purple-200 shadow-lg shadow-purple-200/30'
              )}
              style={{
                boxShadow: isDark
                  ? 'inset 0 1px 1px rgba(255,255,255,0.05), 0 8px 32px -8px rgba(0,0,0,0.5)'
                  : 'inset 0 1px 1px rgba(255,255,255,0.9), 0 8px 32px -8px rgba(168,85,247,0.2)',
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
                            ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/20'
                            : 'bg-purple-500/10 text-purple-600 shadow-md shadow-purple-200/50'
                          : isDark
                            ? 'text-slate-500 hover:text-purple-300'
                            : 'text-slate-400 hover:text-purple-500'
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
      </div>
    </div>
  )
}
