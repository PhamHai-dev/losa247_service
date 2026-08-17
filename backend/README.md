# LOSA247.VN - Backend API

Backend Node.js của LOSA247, cung cấp REST API cho Admin/Client, webhook n8n và chat realtime qua Socket.IO.

## Công nghệ

- **Node.js + Express**: HTTP API và middleware.
- **MySQL 8 + Prisma ORM**: Cơ sở dữ liệu và truy vấn.
- **Socket.IO**: Chat và thông báo realtime.
- **Zod**: Kiểm tra payload.
- **Redis**: Cache tùy chọn.
- **Cloudinary**: Lưu trữ attachment.
- **Node-cron**: Tác vụ nền định kỳ.

## Cấu trúc chính

```text
backend/
├── config/          # Prisma, environment, Redis, Socket.IO
├── controllers/     # Xử lý request/response Admin và Client
├── prisma/          # Schema và MySQL migrations
├── repositories/    # Truy vấn dữ liệu bằng Prisma
├── routes/          # REST API routing
├── sockets/         # Chat và notifications realtime
├── middlewares/     # Auth, RBAC, audit log, error handling
├── validators/      # Zod schemas
├── scripts/         # MySQL seed utilities
└── index.js         # Application entry point
```

## Yêu cầu

- Node.js 18 trở lên.
- MySQL 8 trở lên.
- Redis là tùy chọn; backend vẫn hoạt động nếu chưa cấu hình Redis.

## Cài đặt

```bash
npm install
```

Tạo `.env` dựa trên `.env.example`, tối thiểu gồm:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://user:password@127.0.0.1:3306/losa247"
JWT_ADMIN_SECRET=minimum_32_byte_unique_admin_secret
JWT_CLIENT_SECRET=minimum_32_byte_unique_client_secret
CORS_ORIGINS=http://localhost:5173
```

## Prisma và MySQL

```bash
# Kiểm tra schema
npm run prisma:validate

# Generate Prisma Client
npm run prisma:generate

# Áp dụng migration production
npm run prisma:migrate:deploy

# Tạo/cập nhật tài khoản admin
npm run seed:admin
```

Có thể đặt `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` trước khi chạy seed. Nếu không đặt, script dùng giá trị mặc định dành cho môi trường phát triển.

## Khởi động

```bash
# Development
npm run dev

# Production
npm start
```

Health check:

```text
GET /api/health
```

## API chính

Base URL: `/api/v1`

### Admin

- `/admin/auth`: đăng nhập, refresh, logout và thông tin người dùng.
- `/admin/dashboard`: KPI và báo cáo leads/content.
- `/admin/leads`: quản lý lead.
- `/admin/blogs`: bài viết, category và tag.
- `/admin/faqs`: câu hỏi thường gặp.
- `/admin/pricing`: gói dịch vụ và bảng so sánh.
- `/admin/chat`: lịch sử và tiếp quản phiên chat.
- `/admin/users`, `/admin/roles`: người dùng và phân quyền.
- `/admin/settings`, `/admin/api-configs`: cấu hình hệ thống.
- `/admin/notifications`, `/admin/logs`: thông báo và audit logs.

### Client/Public

- `/auth`: đăng ký, đăng nhập, refresh, logout và reset mật khẩu.
- `/blogs`, `/faqs`, `/client/pricing`: nội dung public.
- `/settings`: site info và appearance.
- `/leads`: gửi thông tin liên hệ.
- `/chat`: khởi tạo phiên, lịch sử và upload attachment.

### Realtime và Webhook

- Socket namespace `/chat`: tin nhắn customer/admin/bot.
- Socket namespace `/notifications`: thông báo quản trị.
- `/webhooks`: webhook tích hợp n8n.

## Database

Backend runtime chỉ kết nối MySQL thông qua `DATABASE_URL` và Prisma. Routes không truy cập database trực tiếp; luồng dữ liệu là `route → controller → repository → Prisma → MySQL`.
