import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { automationService } from '@/services/AutomationService'
import { queryKeys } from '@/lib/queryClient'

// ============ QUERIES ============

/**
 * Fetch scheduled messages with optional filters
 * @param {object} filters - Optional filters
 * @param {object} options - Additional query options (e.g., { enabled: false })
 */
export function useScheduledMessages(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.automation.scheduledMessages(filters),
    queryFn: () => automationService.getScheduledMessages(filters),
    // Scheduled messages should refresh frequently
    staleTime: 10 * 1000,
    ...options,
  })
}

/**
 * Fetch automation rules
 */
export function useAutomationRules() {
  return useQuery({
    queryKey: queryKeys.automation.rules(),
    queryFn: () => automationService.getAutomationRules(),
  })
}

/**
 * Fetch automation stats for a specific rule
 * @param {string} ruleId - Automation rule ID
 */
export function useAutomationStats(ruleId) {
  return useQuery({
    queryKey: queryKeys.automation.stats(ruleId),
    queryFn: () => automationService.getAutomationStats(ruleId),
    enabled: !!ruleId,
    staleTime: 30 * 1000, // Stats can be slightly stale
  })
}

// ============ MUTATIONS ============

/**
 * Cancel scheduled message with optimistic update
 */
export function useCancelScheduledMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId) => automationService.cancelScheduledMessage(messageId),
    onMutate: async (messageId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.automation.scheduledMessages(),
      })

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(queryKeys.automation.scheduledMessages())

      // Optimistically remove message
      queryClient.setQueryData(queryKeys.automation.scheduledMessages(), (old) =>
        old?.filter((m) => m.id !== messageId)
      )

      return { previousMessages }
    },
    onError: (_err, _messageId, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(queryKeys.automation.scheduledMessages(), context.previousMessages)
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({
        queryKey: queryKeys.automation.scheduledMessages(),
      })
    },
  })
}

/**
 * Save automation rule (create or update)
 */
export function useSaveAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (rule) => automationService.saveAutomationRule(rule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules() })
    },
  })
}

/**
 * Delete automation rule
 */
export function useDeleteAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId) => automationService.deleteAutomationRule(ruleId),
    onMutate: async (ruleId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.automation.rules() })

      const previousRules = queryClient.getQueryData(queryKeys.automation.rules())

      // Optimistically remove rule
      queryClient.setQueryData(queryKeys.automation.rules(), (old) =>
        old?.filter((r) => r.id !== ruleId)
      )

      return { previousRules }
    },
    onError: (_err, _ruleId, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(queryKeys.automation.rules(), context.previousRules)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules() })
      queryClient.invalidateQueries({
        queryKey: queryKeys.automation.scheduledMessages(),
      })
    },
  })
}

/**
 * Toggle automation rule active state
 */
export function useToggleAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ruleId, isActive }) => automationService.toggleAutomationRule(ruleId, isActive),
    onMutate: async ({ ruleId, isActive }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.automation.rules() })

      const previousRules = queryClient.getQueryData(queryKeys.automation.rules())

      // Optimistically toggle the rule
      queryClient.setQueryData(queryKeys.automation.rules(), (old) =>
        old?.map((r) => (r.id === ruleId ? { ...r, is_active: isActive } : r))
      )

      return { previousRules }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousRules) {
        queryClient.setQueryData(queryKeys.automation.rules(), context.previousRules)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.automation.rules() })
    },
  })
}

/**
 * Queue birthday messages for a rule
 */
export function useQueueBirthdayMessages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId) => automationService.queueBirthdayMessages(ruleId),
    onSuccess: (_data, ruleId) => {
      // Invalidate scheduled messages and stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.automation.scheduledMessages(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.automation.stats(ruleId),
      })
    },
  })
}
