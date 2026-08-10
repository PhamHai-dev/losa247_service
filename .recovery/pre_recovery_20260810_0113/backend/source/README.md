# LOSA247.VN - Backend API

Dự án Backend của hệ thống LOSA247, cung cấp API đầy đủ phục vụ cho trang quản trị Admin và ứng dụng Client, tích hợp Webhook tự động hoá qua n8n và real-time chat qua Socket.io.

## Công nghệ sử dụng
- **Node.js + Express**: Framework core xử lý logic.
- **MongoDB + Mongoose**: Cơ sở dữ liệu NoSQL tối ưu linh hoạt.
- **Socket.io**: Xử lý WebSockets cho Chat và Notifications.
- **Zod**: Xác thực dữ liệu đầu vào (Validation).
- **Cloudinary**: Lưu trữ hình ảnh và video tĩnh.
- **Node-cron**: Xử lý các tác vụ nền định kỳ.

## Cấu trúc thư mục

```
/
├── config/             # Kết nối DB, socket, cloudinary, multer, môi trường
├── controllers/        # Logic nghiệp vụ (Chia 2 thư mục: admin, client)
├── helpers/            # Tiện ích dùng chung (upload, format, gửi webhook qua n8n)
├── jobs/               # Background Cron Jobs (Giỏ hàng treo, dọn rác...)
├── middlewares/        # Express Middlewares (Auth, Error Handler, RBAC)
├── models/             # Schema Mongoose (13 bảng)
├── routes/             # Định tuyến API (admin, client, webhooks)
├── sockets/            # Các namespace Socket.io (chat, notifications)
├── validators/         # Schema validate payload (Dùng Zod)
├── index.js            # Entry point chính của ứng dụng
└── package.json
```

## Hướng dẫn cài đặt

### Yêu cầu
- Node.js version >= 18 (Vì sử dụng fetch API nội tại trong helpers).
- MongoDB.

### Cài đặt môi trường
1. Clone dự án.
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` ở thư mục gốc (Dựa theo `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/losa247
   JWT_SECRET_ADMIN=supersecretadmin
   JWT_SECRET_CLIENT=supersecretclient
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   N8N_WEBHOOK_URL=http://n8n.example.com/webhook/your-id
   ```

### Chạy ứng dụng
```bash
# Chạy ở chế độ dev (Dùng nodemon)
npm run dev

# Chạy ở chế độ production
npm start
```

## Danh sách API chính

Dự án có cấu trúc hơn 100 API lớn nhỏ chia làm các cụm sau (Base: `/api/v1`):

### 1. API Admin (Cần Authentication + Phân quyền) - Base: `/admin`
- **/auth**: `POST /login`, `POST /logout`, `GET /me`.
- **/dashboard**: `GET /kpis`, `GET /revenue-chart`, `GET /lead-sources`.
- **/leads**: Chăm sóc, ghi chú, và chuyển đổi Lead thành đơn hàng thực tế.
- **/orders**: Quản lý đơn, xác nhận thanh toán, báo webhook kích hoạt n8n, huỷ đơn.
- **/carts**: Quản lý giỏ hàng treo, gửi nhắc nhở (abandoned carts).
- **/blogs** & **/blogs/categories**: Viết bài, duyệt bài Facebook crawl.
- **/faqs**: Quản lý câu hỏi thường gặp, cập nhật thứ tự ưu tiên.
- **/services** & **/store-products**: Quản lý sản phẩm vật lý/dịch vụ số.
- **/chat**: Xem lịch sử, takeover (tiếp quản chat từ bot), release (trả về bot).
- **/users**: Quản trị nhân viên, phân quyền.
- **/settings** & **/api-configs**: Cài đặt màu sắc site, quản lý key API của các dịch vụ bên thứ 3.

### 2. API Client (Cho người dùng / khách truy cập)
- **/auth**: `POST /login-or-register` (Auth bằng SDT/OTP), `GET /me`.
- **/orders**: Tạo đơn hàng, thanh toán.
- **/cart**: Thêm vào giỏ, cập nhật số lượng, lấy danh sách giỏ.
- **/blogs**, **/faqs**, **/services**, **/store-products**: Các route public để đọc dữ liệu.
- **/chat**: Khởi tạo session, nhắn tin.

### 3. Webhooks & Sockets (Liên kết n8n & Realtime)
- **Webhooks (`/webhooks`)**:
  - `/n8n/chat-reply`: Bot n8n trả lời và bắn kết quả về server để emit qua socket cho khách.
  - *(Thuộc Admin)* `/admin/blogs/webhook/facebook-crawl`: N8n crawl nhóm Facebook và tạo bài nháp.
- **Sockets**:
  - Namespace `/chat`: Giao tiếp 2 chiều khách - hệ thống (có hỗ trợ chat bot & chuyển đổi sang người thật).
  - Namespace `/notifications`: Emit thông báo khi có người muốn chat với admin, hoặc có biến động dữ liệu.

## Các Background Job (Cron)
- **Abandoned Carts (`0 9 * * *`)**: Chạy 9h sáng mỗi ngày, quét những người có giỏ hàng trên 24h để gọi n8n nhắc nhở.
- **Token Cleanup (`0 2 * * 0`)**: Dọn dẹp dữ liệu lưu tạm, database session/token cũ vào lúc 2h sáng CN.
