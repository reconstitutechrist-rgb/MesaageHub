import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch(fetchFn, options = {}) {
  const { immediate = true, onSuccess, onError } = options

  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(immediate)
  const abortControllerRef = useRef(null)

  const execute = useCallback(
    async (...args) => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchFn(...args, {
          signal: abortControllerRef.current.signal,
        })
        setData(result)
        onSuccess?.(result)
        return { data: result, error: null }
      } catch (err) {
        if (err.name === 'AbortError') {
          return { data: null, error: null, aborted: true }
        }
        const errorMessage = err.message || 'An error occurred'
        setError(errorMessage)
        onError?.(errorMessage)
        return { data: null, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [fetchFn, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate]) // Only run on mount/immediate change, execute is stable

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
    cancel,
    refetch: execute,
  }
}
