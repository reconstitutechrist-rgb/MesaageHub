import { MessageSquare, Users, LayoutDashboard, Settings, User } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export const mainNavigation = [
  {
    title: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: 'Conversations',
    href: ROUTES.CONVERSATIONS,
    icon: MessageSquare,
  },
  {
    title: 'Contacts',
    href: ROUTES.CONTACTS,
    icon: Users,
  },
]

export const userNavigation = [
  {
    title: 'Profile',
    href: ROUTES.PROFILE,
    icon: User,
  },
  {
    title: 'Settings',
    href: ROUTES.SETTINGS,
    icon: Settings,
  },
]
