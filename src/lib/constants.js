// Application constants
export const APP_NAME = 'MessageHub'
export const APP_VERSION = '1.0.0'

// Route paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CONVERSATIONS: '/conversations',
  CHAT: '/conversations/:id',
  CONTACTS: '/contacts',
  SETTINGS: '/settings',
  PROFILE: '/profile',
  MEDIA_LIBRARY: '/media-library',
}

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'messagehub-theme',
  AUTH_TOKEN: 'messagehub-auth-token',
  USER: 'messagehub-user',
}

// Message status types
export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
}

// Conversation types
export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  GROUP: 'group',
  CHANNEL: 'channel',
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MESSAGES_PAGE_SIZE: 50,
}
