import { useState, useCallback } from 'react'

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
