# AGENTS.md

Hướng dẫn áp dụng cho toàn bộ repository LOSA247. Repo có hai workspace Node.js độc lập: `backend/` và `frontend/`; luôn chạy lệnh trong đúng workspace.

## Package manager và môi trường

- Cả hai workspace dùng **npm**, mỗi nơi có `package-lock.json`; không có Yarn/pnpm lockfile.
- Backend yêu cầu Node.js 18+, MySQL 8+; Redis phục vụ queue/realtime.
- Tạo cấu hình backend từ `backend/.env.example`; không commit `.env` hoặc secrets.
- Frontend dùng `VITE_API_BASE_URL`, mặc định `http://localhost:5000/api/v1`.

## Lệnh cài đặt, dev, build, test và lint

### Backend (`backend/`)

```bash
npm ci                    # Cài chính xác theo lockfile
npm install               # Cài/cập nhật dependency khi phát triển
npm run dev               # nodemon index.js
npm start                 # node index.js

npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run seed:admin

# Worker riêng; thường dùng khi RUN_CHAT_WORKERS_IN_API=false
npm run worker:outbox
npm run worker:chat
npm run worker:dlq
```

Các script Prisma ánh xạ tới `prisma validate`, `prisma generate`, `prisma migrate dev`, `prisma migrate deploy`. Seed trỏ tới `scripts/seedAdmin.js`; worker trỏ tới ba file thực tế trong `jobs/`.

> **Cẩn thận:** migrate/seed thay đổi schema hoặc dữ liệu; chỉ chạy sau khi xác nhận đúng `DATABASE_URL`. Worker là tiến trình dài hạn phụ thuộc Redis/tích hợp, không chạy chỉ để kiểm tra cú pháp.

Backend hiện **không có** script `build`, `lint`, `test`; không giả định `npm test` hay `npm run lint` hợp lệ.

### Frontend (`frontend/`)

```bash
npm ci                    # Cài chính xác theo lockfile
npm install               # Cài/cập nhật dependency khi phát triển
npm run dev               # Vite dev server
npm run lint              # Oxlint
npm run build             # Vite production build
npm run preview           # Xem production build
```

Frontend hiện **không có** script `test`. Playwright/Puppeteer có trong dev dependencies nhưng chưa có test script/test suite chuẩn.

## Cấu trúc thư mục

```text
losa_web/
├── backend/                 # Express API, database, jobs, integrations
├── frontend/                # React 19 + Vite SPA client/admin
└── .gitignore               # Secrets, dependencies, build output, uploads
```

### Backend

- `index.js`: entry Express; middleware, CORS, uploads, DB/Redis, routes, jobs, health check.
- `config/`: environment validation; Prisma MariaDB adapter/pool; Redis, BullMQ, Multer.
- `constants/`: permissions và hằng số dùng chung.
- `routes/`: endpoint `admin/`, `client/`, `internal/`, webhook; không đặt business logic phức tạp tại đây.
- `controllers/`: request/response handlers, chia admin/client.
- `validators/`: Zod schemas cho payload/query.
- `repositories/core/`: data access Prisma. Luồng chuẩn: `route → middleware/validator → controller → repository/service → Prisma`.
- `services/`: cache, Gemini, chat automation, realtime/SSE và nghiệp vụ dùng chung.
- `middlewares/`: auth, RBAC, rate limit, audit, webhook signature, error handler.
- `jobs/`: cron cleanup và BullMQ chat/outbox/dead-letter workers.
- `prisma/schema.prisma`: nguồn data model; `prisma/migrations/`: lịch sử migration MySQL.
- `scripts/`: seed và utility migration một lần; kiểm tra side effect trước khi chạy.
- `public/`: asset public/fallback và upload public; media runtime phần lớn bị Git ignore.
- `private/`: chat attachment riêng tư; không public trực tiếp/commit dữ liệu người dùng.
- `docs/`: tài liệu kỹ thuật.
- `models/`: model/compatibility code cũ; data access mới theo repository + Prisma hiện hành.

### Frontend

- `src/main.jsx`: bootstrap React/providers.
- `src/App.jsx`: routing client/admin, song ngữ VI/EN.
- `src/pages/`: page-level components theo client/admin/auth.
- `src/layouts/`: shell client/admin và `<Outlet>`.
- `src/components/`: reusable components theo admin/client/common/seo/ui.
- `src/features/`: API/nghiệp vụ theo domain (auth, blog, chat, lead, settings...).
- `src/services/`: HTTP clients, auth session, shared integrations.
- `src/stores/`: Zustand stores.
- `src/hooks/`: custom hooks.
- `src/i18n/`: locale provider/detection và message VI/EN.
- `src/styles/`: CSS client/admin/shared; giữ selector tương thích markup.
- `src/assets/`, `public/`: bundled/static assets.
- `src/data/`: mock/fallback data, không phải production data.
- `src/constants/`, `src/utils/`: hằng số và pure helpers.
- `dist/`: build output; không sửa tay/commit.

## Coding conventions hiện hành

### JavaScript và naming

- Backend dùng CommonJS (`require`, `module.exports`); frontend dùng ES modules (`import`, `export`).
- `camelCase`: biến/hàm; `PascalCase`: React components/Prisma models; `UPPER_SNAKE_CASE`: env/config constants.
- Component/page thường là `PascalCase.jsx`; backend dùng `.controller.js`, `.routes.js`, `.middleware.js`, `.worker.js`, `.job.js`.
- Prisma fields camelCase; MySQL table/column map sang snake_case bằng `@@map`/`@map`.
- Dùng `async/await`; lỗi backend chuyển `next(error)` tới error handler tập trung.

### Style và patterns

- Backend `.prettierrc`: semicolon, single quote, trailing comma, print width 100, tab width 2.
- Frontend lint bằng Oxlint; formatting hiện chưa hoàn toàn đồng nhất. Theo style file lân cận, tránh reformat ngoài phạm vi.
- Giữ comments/docstrings không liên quan; không trộn refactor lớn vào bugfix nhỏ.
- CSS thường chia khu vực; tái sử dụng class/token và kiểm tra desktop/mobile.
- Route backend ghép middleware/validator/controller; controller không truy vấn DB trực tiếp nếu đã có repository phù hợp.
- Validate input bằng Zod. Giữ API response contract hiện có (`success`/`data`; lỗi có `code`, `message`).
- Admin route phải cân nhắc auth, RBAC, audit logging.
- ID domain là chuỗi `VarChar(24)` do helper/repository tạo; không tự đổi UUID/autoincrement.
- Chat automation phải giữ idempotency, session version, outbox/inbox, queue state và event ordering.
- Frontend dùng functional components/hooks. Logic domain ở `features/`, HTTP/session ở `services/`, Zustand state ở `stores/`.
- Authenticated request gửi `credentials: 'include'`; access token ở auth session, refresh token qua cookie. Không lưu refresh token mới vào localStorage.
- Route public có cặp VI/EN; nội dung mới phải cân nhắc cả hai locale.
- Không dựa vào mock fallback cho production; kiểm tra service thật và backend response shape.

## Module nhạy cảm

### Secrets và hạ tầng

- `backend/.env`, `frontend/.env`: không commit/log giá trị thật.
- `backend/.env.example`, `backend/config/env.js`: contract production; thêm env phải cập nhật example, parse/validation, deployment.
- `backend/config/prisma.js`, `config/db.js`: adapter/pool; thay timeout/pool có thể gây pool exhaustion/outage.
- `backend/config/redis.js`, `config/queues.js`: Redis/BullMQ lifecycle/prefix; thay đổi có thể mất/nhân đôi job.

### Auth, authorization, audit

- `backend/helpers/token.js`, `middlewares/auth.middleware.js`: JWT audience/type, access/refresh semantics.
- Auth routes/controllers/validators admin/client: login, refresh, logout, reset password, cookie flags.
- `middlewares/rbac.middleware.js`, `constants/permissions.js`: không bỏ/nới quyền để sửa nhanh.
- `middlewares/auditLog.middleware.js`: không ghi password, token, API key vào payload.
- `frontend/src/features/auth/`, `services/authSession.js`, `stores/authStore.js`: test admin/client, refresh sau reload, logout.

### Database và migration

- `prisma/schema.prisma`, `prisma/migrations/`: tạo/review migration khi đổi schema; không sửa migration đã deploy nếu không có recovery plan.
- Review `onDelete`, unique/index, enum, MySQL mapping.
- `scripts/seedAdmin.js`, `scripts/migrate-pricing-translations.cjs`: có side effect; backup và xác nhận target DB.
- Không dùng `prisma migrate dev` trên production; production dùng migration đã review qua `npm run prisma:migrate:deploy`.

### Webhook, queue, realtime, uploads

- Webhook routes, `webhookSignature.middleware.js`, `helpers/n8n.js`: signature, raw body, replay window, secrets. Thứ tự raw-body/`express.json` trong `index.js` là quan trọng.
- `services/chat/`, `services/realtime/`, `jobs/`: chú ý idempotency, retry, locking, ordering.
- `routes/internal/`: endpoint deploy/nội bộ; không public hoặc bỏ signature/auth.
- Multer/upload, `public/`, `private/`: validate MIME/size/path, chống traversal, không public attachment private.
- `systemRepository.js`/`ApiConfig`: có thể chứa API credential; không trả khóa ra public API/log.

### Payment

Hiện không có module payment chuyên biệt (Stripe/PayPal/MoMo/VNPay). Không coi `pricing` là payment; nó quản lý nội dung gói/bảng giá. Nếu thêm thanh toán, thiết kế riêng webhook verification, idempotency, transaction và secret handling.

## Kiểm tra trước khi commit

Repo chưa có automated test suite/script `test`; tối thiểu chạy lint/build/schema validation và smoke test có mục tiêu.

```bash
# frontend/
npm run lint
npm run build

# backend/
npm run prisma:validate

# backend/ — thêm khi Prisma schema/client thay đổi
npm run prisma:generate
```

- Sửa API: chạy backend dev, kiểm tra `GET /api/health`, case thành công và lỗi/unauthorized liên quan.
- Sửa auth/RBAC: test login, refresh sau reload, logout, admin/client routes, permission denied.
- Sửa UI: test VI/EN, desktop/mobile, browser console, API thật.
- Sửa chat/queue/webhook: dùng dev Redis/n8n; test retry, duplicate event, handoff, shutdown; không trỏ production.
- Sửa Prisma: review SQL, backup rồi mới migrate DB dev; không thử migration trên production.

Checklist cuối:

1. `git status` chỉ có file dự định; không có `.env`, credentials, uploads, `dist/`, generated file ngoài ý muốn.
2. Diff/log không chứa secret/token/password/API key.
3. Frontend lint/build và Prisma validate pass.
4. Smoke test đúng luồng; ghi rõ nếu thiếu MySQL/Redis/n8n.
5. Migration có review và rollback/backup nếu đổi schema.
6. Không chạy `npm test` như bước giả. Khi thêm framework, cập nhật package scripts và tài liệu này.
