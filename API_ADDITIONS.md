# API cần bổ sung cho Backend (do Frontend đang gọi)

> Tài liệu này liệt kê các endpoint mà **frontend đã code sẵn service để gọi** nhưng **backend hiện chưa có**.
> Base path: `/api/v1`. Response chuẩn: `{ success, data }`; list: `{ success, data: [...], pagination }`; lỗi: `{ success:false, error:{ code, message } }`.
> Frontend đã xử lý mềm (try/catch + thông báo) nên UI không vỡ khi các API này chưa tồn tại.

Cập nhật: 2026-07-13.

---

## 1. Auth — refresh & logout (Admin + Client)

Hiện backend chỉ có `login` và `me`. Frontend cần thêm:

| Method | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/admin/auth/refresh` | `{ refreshToken }` | Cấp lại `accessToken` mới từ refresh token. Trả `{ success, data: { accessToken, refreshToken? } }`. |
| POST | `/admin/auth/logout` | — | Vô hiệu hoá refresh token phía server (nếu lưu). |
| POST | `/auth/refresh` | `{ refreshToken }` | Như trên, cho client. |
| POST | `/auth/logout` | — | Như trên, cho client. |

Ghi chú: login hiện đã trả `accessToken` + `refreshToken` + `user` (frontend đang lưu cả hai vào localStorage). Nếu backend chưa phát hành `refreshToken`, cần bổ sung ở bước login để refresh hoạt động.

**FE gọi ở:** `features/auth/authService.js` (`adminRefresh/adminLogout/clientRefresh/clientLogout`), `stores/authStore.js` (`logout` gọi best-effort).

---

## 2. Auth — quên/đặt lại mật khẩu (Client)

| Method | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/auth/forgot-password` | `{ email }` | Gửi email/OTP đặt lại mật khẩu. |
| POST | `/auth/reset-password` | `{ token, newPassword }` | Đặt lại mật khẩu bằng token. |

**FE gọi ở:** `features/auth/authService.js` (`clientForgotPassword`, `clientResetPassword`). *(Trang UI quên mật khẩu chưa dựng — chỉ có service.)*

---

## 3. Phân quyền theo vai trò (Admin)

| Method | Endpoint | Body | Mô tả |
|---|---|---|---|
| PUT | `/admin/roles/permissions` | `{ matrix }` | Lưu ma trận quyền (module × action). `matrix` dạng `{ "orders_view": true, "orders_create": false, ... }`. |

Gợi ý: có thể trả về danh sách quyền hiện tại qua `GET /admin/roles/permissions` để FE prefill (hiện FE chưa gọi GET, chỉ PUT).

**FE gọi ở:** `features/users/usersService.js` (`rolesService.updatePermissions`), dùng trong `RolePermissionsModal` (trang Users).

---

## 4. Nhật ký hệ thống (Admin)

Backend **chưa có** route/controller/model cho logs.

| Method | Endpoint | Query | Mô tả |
|---|---|---|---|
| GET | `/admin/logs` | `page, limit, actor, module, dateFrom, dateTo` | Danh sách audit log, phân trang. Mỗi log: `{ _id, createdAt, actor:{ _id, name }, action, module, ip, payload }`. |
| GET | `/admin/logs/export` | như trên | Xuất CSV (`responseType: blob`). |

Gợi ý: cần model `Log` + middleware ghi log ở các hành động quan trọng (duyệt bài, chuyển lead, đổi trạng thái đơn...).

**FE gọi ở:** `features/logs/logsService.js`, trang `AdminLogs`.

---

## 5. Payment callback (Client)

| Method | Endpoint | Body | Mô tả |
|---|---|---|---|
| POST | `/orders/:id/payment-callback` | tuỳ cổng thanh toán (VNPay/MoMo...) | Nhận callback xác nhận thanh toán từ cổng, cập nhật trạng thái đơn `pending → paid`. |

**FE gọi ở:** `features/checkout/checkoutService.js` (`paymentCallback`). *(Hiện checkout tạo đơn ở trạng thái `pending`; luồng thanh toán QR/redirect cần endpoint này.)*

---

## 6. Lịch sử đơn hàng của khách (Client)

Backend client hiện chỉ có `POST /orders` và `GET /orders/:id`. Trang Tài khoản cần danh sách đơn của chính khách đang đăng nhập:

| Method | Endpoint | Query | Mô tả |
|---|---|---|---|
| GET | `/orders` | `page, limit` | Danh sách đơn của user hiện tại (lọc theo `req.user`). Trả `{ success, data:[...], pagination }`. |

**FE dùng ở:** trang `AccountPage` (hiện đang hiển thị ghi chú chờ API này).

---

## Khác biệt path so với Agent.md (Frontend đã theo BACKEND thực tế)

Các điểm này **không cần sửa backend** — chỉ ghi chú để đồng bộ tài liệu:

| Agent.md | Backend thực tế | FE dùng |
|---|---|---|
| `/admin/blog-categories` | `/admin/blogs/categories` | theo backend |
| Client store detail `/store-products/:slug` | `/store-products/:id` | theo backend (`getById`) |
| Socket events `bot_reply` / `mode_changed` / `new_session_alert` | emit `join_session`,`customer_message`,`admin_message`,`request_human`; listen `new_message`,`bot_reply`,`session_mode_changed` | theo backend (`useChatSocket`) |

## Ghi chú về dữ liệu Dashboard

FE render theo shape thực tế của backend:
- `GET /admin/dashboard/kpis` → `{ newLeads, totalOrders, totalRevenue }`
- `GET /admin/dashboard/revenue-chart` → `[{ _id: 'YYYY-MM-DD', revenue }]`
- `GET /admin/dashboard/lead-sources` → `[{ _id: source, count }]`
