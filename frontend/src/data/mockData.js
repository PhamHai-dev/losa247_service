// Dữ liệu mẫu cho toàn bộ demo LOSA247.
export const kpis = [
  { label: 'Lead mới hôm nay', value: '128', trend: '+18%', icon: '⚡' },
  { label: 'Doanh thu tháng', value: '486tr', trend: '+24%', icon: '💎' },
  { label: 'Tỉ lệ chuyển đổi', value: '32%', trend: '+6%', icon: '🎯' },
  { label: 'Hội thoại mở', value: '41', trend: '-3%', icon: '💬' },
]

export const services = [
  { id: 1, name: 'AI Sales Agent Basic', price: 1490000, badge: 'Khởi đầu', features: ['Chat tự động 24/7', 'Thu lead realtime', 'FAQ thông minh'], popular: false },
  { id: 2, name: 'AI Sales Agent Pro', price: 3490000, badge: 'Phổ biến nhất', features: ['Tất cả Basic', 'Tự tạo đơn hàng', 'Kết nối Facebook/Zalo', 'Báo cáo nâng cao'], popular: true },
  { id: 3, name: 'Enterprise Automation', price: 8900000, badge: 'Doanh nghiệp', features: ['Thiết kế workflow riêng', 'Tích hợp n8n', 'Huấn luyện AI theo dữ liệu shop'], popular: false },
]

export const products = [
  { id: 1, name: 'Workflow chốt đơn Facebook', platform: 'Facebook', price: 790000, image: '🔵', desc: 'Tự động phản hồi comment/inbox và đẩy lead về CRM.' },
  { id: 2, name: 'Zalo OA chăm sóc khách', platform: 'Zalo', price: 990000, image: '🟦', desc: 'Kịch bản CSKH, nhắc lịch, gửi coupon tự động.' },
  { id: 3, name: 'Shopee remarketing cart', platform: 'Shopee', price: 1290000, image: '🛒', desc: 'Nhắc giỏ hàng treo và đề xuất sản phẩm liên quan.' },
  { id: 4, name: 'TikTok live lead capture', platform: 'TikTok', price: 1590000, image: '🎬', desc: 'Thu lead từ livestream và phân loại nhu cầu tự động.' },
]

export const blogs = [
  { id: 1, title: '5 cách dùng AI Agent để tăng tỉ lệ chốt đơn', category: 'AI Sales', author: 'Losa Team', date: '10/07/2026', status: 'published' },
  { id: 2, title: 'Tự động hoá chăm sóc khách hàng bằng n8n', category: 'Automation', author: 'Minh Anh', date: '08/07/2026', status: 'pending' },
  { id: 3, title: 'Checklist triển khai chatbot cho shop online', category: 'Guide', author: 'Losa Team', date: '05/07/2026', status: 'draft' },
]

export const faqs = [
  { id: 1, category: 'Dịch vụ', q: 'LOSA247 có tích hợp Facebook/Zalo không?', a: 'Có. Gói Pro hỗ trợ kết nối Facebook, Zalo và các webhook n8n phổ biến.', visible: true },
  { id: 2, category: 'Thanh toán', q: 'Có xuất hoá đơn VAT không?', a: 'Có, bạn có thể nhập thông tin xuất hoá đơn tại bước thanh toán.', visible: true },
  { id: 3, category: 'Kỹ thuật', q: 'Dữ liệu chat có được lưu lại không?', a: 'Có, toàn bộ hội thoại được lưu theo phiên để CSKH và huấn luyện bot.', visible: true },
]

export const leads = [
  { id: 'LD-1024', name: 'Nguyễn Hoàng Shop', phone: '0901 222 888', service: 'AI Sales Agent Pro', source: 'Facebook', status: 'new', owner: 'Linh', createdAt: '10/07/2026' },
  { id: 'LD-1023', name: 'Mỹ phẩm Hana', phone: '0918 334 455', service: 'Zalo OA', source: 'Chat', status: 'contacted', owner: 'Tuấn', createdAt: '10/07/2026' },
  { id: 'LD-1022', name: 'Đồ gia dụng Tâm An', phone: '0987 111 222', service: 'Enterprise', source: 'Web', status: 'qualified', owner: 'Mai', createdAt: '09/07/2026' },
]

export const orders = [
  { id: 'OD-8801', customer: 'Nguyễn Hoàng Shop', item: 'AI Sales Agent Pro', total: 3490000, payment: 'Chuyển khoản', paymentStatus: 'paid', status: 'processing', createdAt: '10/07/2026' },
  { id: 'OD-8800', customer: 'Mỹ phẩm Hana', item: 'Zalo OA chăm sóc khách', total: 990000, payment: 'VNPay', paymentStatus: 'pending', status: 'draft', createdAt: '09/07/2026' },
  { id: 'OD-8799', customer: 'Tâm An', item: 'Enterprise Automation', total: 8900000, payment: 'MoMo', paymentStatus: 'paid', status: 'completed', createdAt: '08/07/2026' },
]

export const users = [
  { id: 1, name: 'Admin Losa', email: 'admin@losa247.vn', role: 'admin', status: 'active' },
  { id: 2, name: 'Sales Linh', email: 'linh@losa247.vn', role: 'sales', status: 'active' },
  { id: 3, name: 'Editor Nam', email: 'nam@losa247.vn', role: 'editor', status: 'locked' },
]

export const logs = [
  { time: '15:10 10/07', actor: 'Admin Losa', action: 'Duyệt bài viết', module: 'Blog', ip: '127.0.0.1' },
  { time: '14:40 10/07', actor: 'Sales Linh', action: 'Chuyển lead thành đơn', module: 'Lead', ip: '127.0.0.1' },
]

export const chatSessions = [
  { id: 1, name: 'Shop Hana', phone: '0918 334 455', mode: 'human', unread: 3, last: 'Em muốn xem demo gói Pro' },
  { id: 2, name: 'Khách vãng lai', phone: 'Ẩn danh', mode: 'bot', unread: 0, last: 'Bot đã tư vấn bảng giá' },
]
