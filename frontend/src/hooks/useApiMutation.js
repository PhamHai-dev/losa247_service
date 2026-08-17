import { useCallback, useState } from 'react'

// Hook mutation chung: bọc 1 service function, quản lý loading/error.
export function useApiMutation(mutator, { onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)
      try {
        const result = await mutator(...args)
        onSuccess?.(result)
        return result
      } catch (err) {
        const message = err?.error?.message || err?.message || 'Thao tác thất bại'
        setError(message)
        onError?.(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutator, onSuccess, onError],
  )

  return { mutate, loading, error }
}
