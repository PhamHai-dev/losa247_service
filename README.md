# LOSA247.VN

Monorepo workspace cho hệ thống LOSA247.VN theo đặc tả `Agent_v1.md.md`.

## Cấu trúc project

- `backend/` — API Node.js/Express + MongoDB dùng chung cho Admin và Client.
- `frontend/admin/` — React/Vite app độc lập cho trang Admin.
- `frontend/client/` — React/Vite app độc lập cho trang Client.

## Chạy local

Mỗi project có `package.json` riêng và cài dependency độc lập.

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend/admin
npm install
npm run dev
```

```bash
cd frontend/client
npm install
npm run dev
```

## Quy tắc kiến trúc chính

- Backend: `routes` chỉ gọi controller, controller gọi validator/service, business logic nằm trong `services`, model chỉ định nghĩa schema.
- Frontend: `pages` chỉ ghép layout/component và gọi hook từ `features`; chỉ `features/*/*Service.js` gọi `axiosClient`.
- Không hardcode API key, webhook URL thật hoặc payment secret trong source.
