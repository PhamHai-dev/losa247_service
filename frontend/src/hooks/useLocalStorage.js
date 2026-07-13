import { useState } from 'react'

// Hook lưu state vào localStorage, dùng cho theme, giỏ hàng, sidebar.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      return saved ? JSON.parse(saved) : initialValue
    } catch {
      return initialValue
    }
  })

  const updateValue = (nextValue) => {
    setValue(nextValue)
    localStorage.setItem(key, JSON.stringify(nextValue))
  }

  return [value, updateValue]
}
