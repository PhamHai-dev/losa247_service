import { useState } from 'react'
import { useDebounce } from './useDebounce'

// Hook chuẩn hoá tham số danh sách cho table: search (debounce) + phân trang.
export function useListParams(pageSize = 10) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebounce(search, 300)

  // Đổi từ khoá thì luôn về trang 1.
  const onSearch = (value) => {
    setSearch(value)
    setPage(1)
  }

  return { search, onSearch, debounced, page, setPage, pageSize }
}
