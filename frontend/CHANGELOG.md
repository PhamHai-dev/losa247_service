# CHANGELOG — Frontend LOSA247

Ghi lại các thay đổi frontend sau mỗi lần chỉnh sửa.

## 2026-07-13 — Toast màu cho thông báo thêm/sửa/xoá

- Tô màu toàn bộ toast `antd message`: **thành công → nền xanh** (`--green #16a34a`), **lỗi → nền đỏ** (`--red #dc2626`), chữ + icon trắng, bo góc + shadow ([styles/index.css](src/styles/index.css)).
- Áp dụng qua CSS toàn cục theo class type của antd (`.ant-message-success` / `.ant-message-error` trên wrapper, kèm fallback `:has()`), nên **mọi** `message.success` / `message.error` (thêm/sửa/xoá ở tất cả trang admin + client) tự đổi màu, không phải sửa từng call site.
- `message.info`/`warning` giữ mặc định (yêu cầu chỉ nêu success/error).

## 2026-07-13 — Dọn input thừa ở admin topbar

- Xoá ô tìm kiếm `<input placeholder="Tìm lead, đơn hàng...">` trong `admin-topbar` ([layouts/AdminLayout.jsx](src/layouts/AdminLayout.jsx)) vì mỗi bảng đã có ô tìm kiếm riêng → ô này không còn tác dụng.
- Giữ dropdown user căn phải (thêm `<span />` để giữ `justify-content: space-between`).
- Rà soát: các `<input>` còn lại đều đang dùng (ô chat trong ClientLayout & ChatWidget); không còn input thừa.

## 2026-07-13 — Phân trang & tìm kiếm cho toàn bộ bảng admin

Thêm **tìm kiếm (search, debounce 300ms)** và **phân trang server-side** cho các bảng admin còn thiếu. Bảng nào đã có sẵn tìm kiếm thì giữ nguyên.

- **Mới:** hook dùng chung `src/hooks/useListParams.js` (quản lý `search` + `page`, tự về trang 1 khi đổi từ khoá).
- **AdminLeads** — đã có search + phân trang từ trước → giữ nguyên.
- **AdminOrders** — có sẵn tab lọc trạng thái + phân trang → **thêm ô tìm kiếm** (mã đơn / tên / SĐT khách).
- **AdminBlogs** — trước đây `pagination={false}` + không search → **thêm search (tiêu đề) + phân trang** (giữ tab trạng thái).
- **AdminFaqs** — **thêm search (câu hỏi) + phân trang**. Lưu ý: sắp xếp (nút ↑/↓) hiện thao tác trong phạm vi trang đang xem.
- **Dịch vụ (ServicesTable)** — **thêm search (tên) + phân trang**.
- **Sản phẩm workflow (StoreProductsTable)** — **thêm search (tên) + phân trang**.
- **AdminUsers** — **thêm search (tên / email) + phân trang**.
- **AdminLogs** — đã có phân trang → **thêm ô tìm kiếm** (backend `/admin/logs` vẫn chưa có — xem `../API_ADDITIONS.md`).
- **AdminChat** (danh sách phiên, dạng List) — **thêm search (tên / SĐT khách) + phân trang**.

Backend đã hỗ trợ `page/limit/search` cho: leads, orders, blogs, faqs, services, store-products, users, chat sessions.

Kích thước trang mặc định: 10 dòng (Logs giữ 20).
