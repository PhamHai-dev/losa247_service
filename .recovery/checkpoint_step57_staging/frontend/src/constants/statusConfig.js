// Map trạng thái -> nhãn tiếng Việt + màu antd Tag. Dùng chung cho StatusBadge.

export const ORDER_STATUS = {
  pending: { label: 'Chờ thanh toán', color: 'gold' },
  paid: { label: 'Đã thanh toán', color: 'blue' },
  active: { label: 'Đang kích hoạt', color: 'cyan' },
  completed: { label: 'Hoàn tất', color: 'green' },
  cancelled: { label: 'Đã huỷ', color: 'red' },
}

export const LEAD_STATUS = {
  new: { label: 'Mới', color: 'blue' },
  contacted: { label: 'Đã liên hệ', color: 'gold' },
  qualified: { label: 'Tiềm năng', color: 'cyan' },
  converted: { label: 'Đã chuyển đơn', color: 'green' },
  lost: { label: 'Thất bại', color: 'red' },
}

export const BLOG_STATUS = {
  draft: { label: 'Nháp', color: 'default' },
  pending: { label: 'Chờ duyệt', color: 'gold' },
  published: { label: 'Đã đăng', color: 'green' },
  rejected: { label: 'Từ chối', color: 'red' },
}

export const CHAT_MODE = {
  bot: { label: 'Bot', color: 'blue' },
  human: { label: 'Nhân viên', color: 'green' },
}

export const USER_STATUS = {
  active: { label: 'Hoạt động', color: 'green' },
  locked: { label: 'Đã khoá', color: 'red' },
}

export const ORDER_STEPS = ['pending', 'paid', 'active', 'completed']
