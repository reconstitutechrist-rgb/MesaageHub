import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Bell, Menu, Moon, Search, Sun, User, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useKeyboardShortcut, SHORTCUTS, useDebounce } from '@/hooks'
import { getInitials } from '@/lib/utils'

export function Header({ onMenuClick }) {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [_isSearchFocused, setIsSearchFocused] = useState(false)
  // Debounced value available for future API integration
  const _debouncedSearch = useDebounce(searchQuery, 300)

  // Mock notification count
  const notificationCount = 3

  // Handle search
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        navigate(`/conversations?search=${encodeURIComponent(searchQuery)}`)
        setShowMobileSearch(false)
      }
    },
    [searchQuery, navigate]
  )

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  // Keyboard shortcuts
  useKeyboardShortcut(SHORTCUTS.SEARCH, () => {
    document.getElementById('global-search')?.focus()
  })

  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-3 sm:gap-4 sm:px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu />
        <span className="sr-only">Toggle menu</span>
      </Button>

      {/* Search - Desktop */}
      <form onSubmit={handleSearch} className="relative hidden flex-1 sm:block sm:max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="global-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search... (Ctrl+K)"
          className="h-10 pl-9 pr-9 bg-muted/50"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {/* Search - Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setShowMobileSearch(!showMobileSearch)}
      >
        <Search />
        <span className="sr-only">Search</span>
      </Button>

      {/* Spacer for mobile */}
      <div className="flex-1 sm:hidden" />

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell />
          {notificationCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {notificationCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')} className="py-3">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')} className="py-3">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="py-3">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b bg-background px-3 sm:hidden">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 pl-9 pr-9 bg-muted/50"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </form>
          <Button variant="ghost" size="sm" onClick={() => setShowMobileSearch(false)}>
            Cancel
          </Button>
        </div>
      )}
    </header>
  )
}
