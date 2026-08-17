// Định dạng tiền tệ VND.
export const formatCurrency = (value) => {
  const n = Number(value || 0)
  return n.toLocaleString('vi-VN') + 'đ'
}

// Định dạng ngày giờ theo locale VN. Nhận Date | string | number.
export const formatDate = (input, withTime = false) => {
  if (!input) return '—'
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('vi-VN')
  if (!withTime) return date
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${date}`
}
