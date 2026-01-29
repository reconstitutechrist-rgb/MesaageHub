import { QueryClient } from '@tanstack/react-query'

/**
 * QueryClient configuration for TanStack Query
 * Provides automatic caching, request deduplication, and background refetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 30 seconds
      staleTime: 30 * 1000,
      // Cache data for 5 minutes after it becomes inactive
      gcTime: 5 * 60 * 1000,
      // Retry failed requests 2 times with exponential backoff
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch when window regains focus (better for mobile)
      refetchOnWindowFocus: false,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
    },
  },
})

/**
 * Query key factory for consistent cache key management
 * Using factory pattern ensures type-safe and refactorable keys
 */
export const queryKeys = {
  // Media Library
  media: {
    all: ['media'],
    list: (userId, filters) => [...queryKeys.media.all, 'list', userId, filters],
    detail: (mediaId) => [...queryKeys.media.all, 'detail', mediaId],
    stats: (userId) => [...queryKeys.media.all, 'stats', userId],
  },

  // Design Projects
  projects: {
    all: ['projects'],
    list: (userId, pagination) => [...queryKeys.projects.all, 'list', userId, pagination],
    detail: (projectId, userId) => [...queryKeys.projects.all, 'detail', projectId, userId],
  },

  // Automation
  automation: {
    all: ['automation'],
    rules: () => [...queryKeys.automation.all, 'rules'],
    scheduledMessages: (filters) => [...queryKeys.automation.all, 'scheduled', filters],
    stats: (ruleId) => [...queryKeys.automation.all, 'stats', ruleId],
  },

  // Subscription
  subscription: {
    all: ['subscription'],
    user: (userId) => [...queryKeys.subscription.all, userId],
    usage: (userId) => [...queryKeys.subscription.all, 'usage', userId],
  },

  // Contacts
  contacts: {
    all: ['contacts'],
    list: (userId, filters) => [...queryKeys.contacts.all, 'list', userId, filters],
    detail: (contactId) => [...queryKeys.contacts.all, 'detail', contactId],
  },

  // Conversations
  conversations: {
    all: ['conversations'],
    list: (userId) => [...queryKeys.conversations.all, 'list', userId],
    detail: (conversationId) => [...queryKeys.conversations.all, 'detail', conversationId],
    messages: (conversationId) => [...queryKeys.conversations.all, 'messages', conversationId],
  },
}

export default queryClient
