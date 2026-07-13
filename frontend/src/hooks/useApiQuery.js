import { useCallback, useEffect, useRef, useState } from 'react'

// Hook fetch dữ liệu chung (thay cho React Query để giữ stack hiện tại).
// fetcher: async () => data. deps: mảng dependency để refetch khi đổi.
export function useApiQuery(fetcher, deps = [], { enabled = true, initialData = null } = {}) {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
      return result
    } catch (err) {
      setError(err?.error?.message || err?.message || 'Đã xảy ra lỗi khi tải dữ liệu')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  return { data, loading, error, refetch: run, setData }
}
