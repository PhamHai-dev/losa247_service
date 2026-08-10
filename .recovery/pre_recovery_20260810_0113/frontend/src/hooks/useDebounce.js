import { useEffect, useState } from 'react'

// Hook debounce giúp tránh xử lý tìm kiếm/API liên tục khi người dùng đang gõ.
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
