import { useState, useCallback } from 'react'

/**
 * @deprecated Use TanStack Query mutations from '@/hooks/queries' instead.
 * This hook is maintained for backward compatibility only.
 *
 * Example migration:
 * Before: const { execute, isLoading } = useAsync(service.doAction)
 * After:  const { mutate, isPending } = useMutation({ mutationFn: service.doAction })
 */
export function useAsync(asyncFunction) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await asyncFunction(...args)
        setData(result)
        return { success: true, data: result }
      } catch (err) {
        const errorMessage = err.message || 'An error occurred'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setIsLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    execute,
    isLoading,
    error,
    data,
    reset,
  }
}
