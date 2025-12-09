import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Users2, MessagesSquare, SlidersHorizontal } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: Users2, label: 'Contacts', href: '/contacts' },
  { icon: MessagesSquare, label: 'Chat', href: '/conversations' },
  { icon: SlidersHorizontal, label: 'Settings', href: '/settings' },
]

export function PhoneLayout() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-0 md:p-6">
      {/* Ambient glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Phone Frame Container */}
      <div className="relative w-full h-full md:w-[400px] md:h-[860px] md:rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500">
        {/* Gradient border for desktop */}
        <div className="hidden md:block absolute inset-0 rounded-[3rem] p-[2px] bg-gradient-to-b from-white/20 via-white/5 to-white/10">
          <div className="absolute inset-[2px] rounded-[2.9rem] bg-background" />
        </div>

        {/* Inner container */}
        <div className="relative w-full h-full bg-background md:rounded-[2.85rem] flex flex-col overflow-hidden">
          {/* Status Bar / Notch Area (Desktop only) */}
          <div className="hidden md:flex items-center justify-center pt-3 pb-2 bg-background/80 backdrop-blur-sm z-50">
            <div className="w-28 h-7 bg-black rounded-full flex items-center justify-center">
              <div className="w-12 h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-full" />
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin gradient-subtle">
            <div className="min-h-full pb-24">
              <Outlet />
            </div>
          </main>

          {/* Bottom Navigation - Glassmorphism Style */}
          <nav className="absolute bottom-0 left-0 right-0 z-40 px-4 pb-safe">
            <div className="mx-auto mb-4 md:mb-6 glass-strong rounded-2xl border border-white/10 shadow-lg">
              <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        'relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 touch-manipulation',
                        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {/* Active indicator glow */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-xl bg-primary/10 nav-glow" />
                        )}

                        {/* Icon container */}
                        <div
                          className={cn(
                            'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
                            isActive && 'bg-primary/15 scale-110'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'w-5 h-5 transition-all duration-300',
                              isActive && 'stroke-[2.5px]'
                            )}
                          />
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            'text-[10px] font-medium mt-0.5 transition-all duration-300',
                            isActive && 'text-primary font-semibold'
                          )}
                        >
                          {item.label}
                        </span>
                      </>
                    )}
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
