# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The actual project lives in the nested `losa_web/` directory (not the outer working dir). All paths below are relative to `losa_web/`.

- `backend/` — Node.js/Express + MongoDB API shared by Admin and Client.
- `frontend/` — a single React 19 / Vite SPA serving both the public Client site and the `/admin` dashboard.

Each has its own `package.json` and is installed/run independently.

## Commands

Backend (`backend/`):
```bash
npm install
npm run dev          # nodemon index.js
npm start            # node index.js (production)
node scripts/seedAdmin.js    # seed one admin (needs MONGO_URI)
node scripts/create_data.js  # seed full sample dataset (RESETS users collection)
```

Frontend (`frontend/`):
```bash
npm install
npm run dev          # vite dev server (http://localhost:5173)
npm run build        # vite build -> dist/
npm run lint         # oxlint (NOT eslint) — lint src only: npx oxlint src
npm run preview
```

There is no test suite in either project. Verify frontend changes with `npx oxlint src` + `npm run build`; the ~1.4 MB chunk-size warning from the antd bundle is cosmetic, not an error.

### Running locally / DB
`connectDB` calls `process.exit(1)` on failure, so **the backend crashes if it can't reach MongoDB**. The `.env` may point at a MongoDB Atlas URI that rejects non-whitelisted IPs. For local dev, run Mongo in Docker and point `MONGO_URI` at it:
```bash
docker run -d --name losa-mongo -p 27017:27017 -v losa-mongo-data:/data/db mongo:7
# backend/.env -> MONGO_URI=mongodb://localhost:27017/losa247
```
After seeding with `create_data.js`, log in as **`admin@losa247.vn` / `123456`** (this script wipes and recreates the users collection, so any `seedAdmin.js` account is overwritten; sample password for all seeded users is `123456`).

The backend `.env` (see `backend/.env.example`) requires `MONGO_URI`, `JWT_ADMIN_SECRET`, `JWT_CLIENT_SECRET`; missing keys only warn. The frontend reads `VITE_API_BASE_URL` (default `http://localhost:5000/api/v1`) and `VITE_SOCKET_URL` (default derived from the API URL).

The codebase and comments are written in Vietnamese; match that when editing.

## Working docs (keep in sync)

- `API_ADDITIONS.md` (repo root) — endpoints the **frontend already calls but the backend does not implement yet** (auth refresh/logout, forgot/reset-password, `PUT /admin/roles/permissions`, `GET /admin/logs`+export, `POST /orders/:id/payment-callback`, client `GET /orders` history). Add here when you wire a frontend call to a missing endpoint. Also records path/socket-event divergences from `Agent.md` where the frontend follows the real backend.
- `frontend/CHANGELOG.md` — running log of frontend changes; append an entry after each change set.
- `../Agent.md` (outer dir, next to this CLAUDE.md) — the original (aspirational) frontend spec. Reality diverges: it describes two projects + React Query + antd v5; the actual app is one project, antd v6, Zustand + a custom fetch hook. Follow the real code, not the spec.

## Backend architecture

Layered request flow: **route → controller → validator (Zod)**. Note that despite the READMEs mentioning a `services/` layer, **there is none** — business logic lives directly in controllers. Models are Mongoose schemas only.

- Everything mounts under `/api/v1` in `index.js`. Admin routes are under `/api/v1/admin/*`; client routes are top-level (`/api/v1/auth`, `/orders`, `/cart`, ...); webhooks under `/api/v1/webhooks`.
- Controllers, routes, and validators are each split into `admin/` and `client/` subfolders that mirror the same feature names.
- **Two separate JWT auth realms.** `authMiddleware('admin')` vs `authMiddleware('client')` verify against different secrets (`JWT_ADMIN_SECRET` / `JWT_CLIENT_SECRET`). Admin routes do `router.use(authMiddleware('admin'))` at the top. `rbacMiddleware([...perms])` checks `user.permissions`, but `role: 'admin'` bypasses all permission checks. RBAC is frequently commented out on routes — check before assuming it is enforced.
- **Response envelope is a hand-rolled convention, not enforced.** Success: `{ success: true, data }`. Errors: `{ success: false, error: { code, message } }`. List endpoints use `buildPaginationResponse` from `helpers/format.js` → `{ success, data, pagination }`. Zod failures are caught per-handler by checking `err.name === 'ZodError'` and returning a 400; everything else calls `next(err)` to reach `middlewares/errorHandler.middleware.js`.
- **n8n integration** (`helpers/n8n.js`) is the automation backbone: order activation, abandoned-cart reminders, and bot chat replies all POST events to an n8n webhook. The URL comes from an active `ApiConfig` doc (provider `n8n`) first, falling back to `env.N8N_WEBHOOK_URL`. Uses native `fetch` (requires Node 18+).
- **Socket.io** (`config/socket.js`, `sockets/`) has two namespaces: `/chat` (customer/admin messaging with a `session.mode` of `bot` vs `human`; `bot` mode forwards to n8n) and `/notifications` (admin alerts, e.g. `new_human_request`). CORS is currently `origin: '*'`.
- **Cron jobs** (`jobs/`) start in `index.js`: abandoned-cart reminder (daily 9am) and token cleanup (Sun 2am).
- File uploads go through `multer` + Cloudinary (`config/multer.js`, `config/cloudinary.js`, `helpers/upload.js`).

## Frontend architecture

Stack: React 19 + Vite 8 + **antd v6** + Zustand + axios + socket.io-client. State/data uses a **custom fetch-hook layer, not React Query** (despite `Agent.md`).

**Strict layering — respect it when adding features:**
- `services/axiosClient.js` is the only axios instance. Its response interceptor **unwraps to `response.data`** (so callers already get the `{ success, data, pagination }` body, not the axios response) and attaches the bearer token from `localStorage['losa_access_token']`.
- `features/<module>/<module>Service.js` is the **only** place allowed to call `axiosClient`. Convention: list methods normalize to `{ items, pagination }`, detail/mutation methods return the inner `data`. Public (client) endpoints live in the same file as `publicXxxService` exports.
- `hooks/useApiQuery(fetcher, deps, {enabled})` (fetch-on-mount + `refetch`) and `hooks/useApiMutation(mutator)` are the React-Query replacement. `hooks/useListParams(pageSize)` bundles debounced search + pagination state for tables (used by every admin table). `hooks/useDebounce` backs it.
- `pages/**` compose UI and call services through those hooks. All admin screens are two large files: `pages/admin/AdminPages.jsx` and `pages/client/ClientPages.jsx` (each exports many page components); auth screens in `pages/auth/AuthPages.jsx`.
- `stores/authStore.js` (Zustand) holds tokens/user/`authType` (`admin` | `client`), persists to `localStorage`, and exposes `loginAdmin/loginClient/registerClient/loadMe/logout/hasPermission`.

`data/mockData.js` and `services/apiClient.js` are legacy scaffolding — **no longer used**; all pages are wired to the real API.

**Realtime:** `services/socketClient.js` (one socket per namespace, `autoConnect:false`) + `features/chat/useChatSocket.js`. Use the real backend events — emit `join_session` / `customer_message` / `admin_message` / `request_human`, listen `new_message` / `bot_reply` / `session_mode_changed` (Agent.md's event names are wrong).

**App shell:** `main.jsx` wraps everything in `<ConfigProvider theme={antdTheme} locale={viVN}>` + `<App>` (antd context for `message`/`modal` — always use `App.useApp()`, not static `message`). `styles/theme.js` holds antd tokens; `constants/statusConfig.js` maps order/lead/blog/chat/user statuses → label + antd Tag color.

**antd v6 gotchas (already applied — follow the same):** `Alert` uses `title` (not `message`); `Card` uses `variant="borderless"` (not `bordered`); `Drawer` uses `size` (not `width`); modals use `initialValues` + `key` on the `Form` (with `destroyOnHidden`) rather than `form.setFieldsValue` before open, to avoid "useForm not connected" warnings. `List` is deprecated but still used.

**Styling:** admin tables are styled Metronic-like via plain CSS scoped to `.admin-content` in `styles/admin.css` (use class `cell-strong` on a column's primary text to highlight it). Toast colors — success = green, error = red — are global CSS on antd `message` in `styles/index.css` (keyed off `.ant-message-success`/`.ant-message-error`), so any `message.success/error` is colored automatically.

Routing (`App.jsx`) is one React Router tree: client pages under `ClientLayout` with Vietnamese slugs (`/dich-vu`, `/gian-hang`, `/hoi-dap`, `/gio-hang`, `/thanh-toan`), auth at `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau`, and the admin dashboard under `/admin/*` with `AdminLayout`.

## Domain notes

Core entities (13 Mongoose models in `backend/models/`): User, Lead, Order, CartItem, Service (digital services), StoreProduct (physical goods), Blog + BlogCategory, Faq, ChatSession + ChatMessage, Settings, ApiConfig. User roles: `admin | sales | editor | customer`. Orders move through `pending → paid → active → completed` (or `cancelled`); activation triggers the n8n webhook.
