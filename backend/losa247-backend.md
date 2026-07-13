# LOSA247.VN — Đặc tả BACKEND (Node.js + Express + MongoDB)

> Tài liệu đặc tả đầy đủ cho một project **Backend độc lập**, tự chạy được một mình (API + Socket.io), không phụ thuộc vào bất kỳ mã nguồn frontend nào. Dùng làm input cho AI coding agent để sinh code phần API/server.
> Backend cung cấp REST API + Socket.io để bất kỳ client nào (web, mobile, admin panel...) gọi vào, thông qua các endpoint mô tả ở mục 3.

---

## 0.1. Repo root

Đây là root của chính project backend (không lồng trong thư mục `frontend/` hay dự án nào khác):

```
losa247-backend/
├── index.js
├── config/
├── routes/
├── controllers/
├── models/
├── middlewares/
├── validators/
├── helpers/
├── sockets/
├── jobs/
├── .env.example
├── package.json
└── README.md
```

## 0.2. Nguyên tắc chung

1. **Mỗi thư mục chỉ làm đúng 1 nhiệm vụ, không kiêm nhiệm** — xem bảng quy tắc ở mục 0.4.
2. Đặt tên file nhất quán: `camelCase`, hậu tố theo vai trò (`.controller.js`, `.model.js`, `.routes.js`, `.middleware.js`, `.validator.js`).
3. **route -> controller -> model** là luồng xử lý DUY NHẤT. Route CHỈ khai báo path + gọi controller; toàn bộ logic nghiệp vụ (kể cả gọi n8n...) viết thẳng trong controller — KHÔNG tách thêm lớp `service/` riêng.
4. **Auth tách riêng theo admin/client**, không dùng chung 1 bộ auth cho cả 2 — vì luồng đăng nhập, quyền hạn, và token của Admin (nội bộ, có role/permissions) khác với Client (khách hàng mua dịch vụ).

## 0.3. Chi tiết cây thư mục Backend

```
losa247-backend/
├── index.js                          # khởi tạo Express app, gắn middleware toàn cục, mount routes, khởi động HTTP server + Socket.io (entry point duy nhất)
├── config/                           # CHỈ cấu hình/kết nối, KHÔNG chứa logic nghiệp vụ
│   ├── db.js                          # kết nối MongoDB
│   ├── env.js                         # đọc & validate biến môi trường
│   ├── multer.js                      # cấu hình upload file
│   ├── cloudinary.js                  # cấu hình kết nối Cloudinary (cloud_name, api_key, api_secret)
│   └── socket.js                      # khởi tạo Socket.io server, namespace
│
├── routes/
│   ├── admin/
│   │   ├── auth.routes.js            # đăng nhập/refresh/logout riêng cho Admin
│   │   ├── dashboard.routes.js
│   │   ├── leads.routes.js
│   │   ├── orders.routes.js
│   │   ├── blogs.routes.js
│   │   ├── faqs.routes.js
│   │   ├── services.routes.js
│   │   ├── storeProducts.routes.js
│   │   ├── chat.routes.js
│   │   ├── settings.routes.js
│   │   ├── apiConfigs.routes.js
│   │   └── users.routes.js
│   └── client/
│       ├── auth.routes.js            # đăng ký/đăng nhập/refresh/logout riêng cho khách hàng
│       ├── services.routes.js
│       ├── storeProducts.routes.js
│       ├── blogs.routes.js
│       ├── faqs.routes.js
│       ├── cart.routes.js
│       ├── orders.routes.js
│       └── chat.routes.js
│
├── controllers/                     # NHẬN request, xử lý TOÀN BỘ logic nghiệp vụ (query DB qua model, gọi n8n), trả response
│   ├── admin/
│   │   ├── auth.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── leads.controller.js
│   │   ├── orders.controller.js       # convert lead->order, activate (gọi n8n), cancel...
│   │   ├── blogs.controller.js
│   │   ├── faqs.controller.js
│   │   ├── services.controller.js
│   │   ├── storeProducts.controller.js
│   │   ├── chat.controller.js          # nhận tin nhắn, forward sang n8n xử lý bot trả lời
│   │   ├── settings.controller.js
│   │   ├── apiConfigs.controller.js
│   │   └── users.controller.js
│   └── client/
│       ├── auth.controller.js
│       ├── services.controller.js
│       ├── storeProducts.controller.js
│       ├── blogs.controller.js
│       ├── faqs.controller.js
│       ├── cart.controller.js
│       ├── orders.controller.js
│       └── chat.controller.js
│
├── models/                           # CHỈ định nghĩa Mongoose Schema + method tĩnh đơn giản. KHÔNG chứa business logic phức tạp.
│   ├── User.model.js
│   ├── Lead.model.js
│   ├── Order.model.js
│   ├── CartItem.model.js
│   ├── Blog.model.js
│   ├── BlogCategory.model.js
│   ├── Faq.model.js
│   ├── Service.model.js
│   ├── StoreProduct.model.js
│   ├── ChatSession.model.js
│   ├── ChatMessage.model.js
│   ├── Settings.model.js
│   └── ApiConfig.model.js
│
├── middlewares/                      # CHỈ middleware Express (auth check, phân quyền, log, giới hạn request). KHÔNG chứa logic nghiệp vụ của module.
│   ├── auth.middleware.js             # verify JWT (dùng chung cơ chế nhưng check riêng issuer admin/client), gắn req.user
│   ├── rbac.middleware.js             # kiểm tra role/permission — chỉ áp cho routes/admin/*
│   ├── rateLimiter.middleware.js
│   ├── errorHandler.middleware.js      # xử lý lỗi tập trung, trả response lỗi chuẩn
│   └── upload.middleware.js             # gắn multer vào route cần upload file
│
├── validators/                        # CHỈ định nghĩa schema validate input (zod/joi). Controller gọi vào đây để check request body.
│   ├── admin/
│   │   ├── leads.validator.js
│   │   ├── orders.validator.js
│   │   ├── blogs.validator.js
│   │   ├── faqs.validator.js
│   │   ├── services.validator.js
│   │   ├── storeProducts.validator.js   # validate n8nWorkflowJson là JSON hợp lệ
│   │   ├── settings.validator.js
│   │   └── users.validator.js
│   └── client/
│       ├── auth.validator.js
│       ├── cart.validator.js
│       └── orders.validator.js
│
├── helpers/                       # gồm 2 nhóm: (a) gọi bên thứ 3 (n8n, storage) — controller gọi vào đây thay vì tự viết axios rải rác; (b) hàm thuần dùng chung (trước đây là utils/, gộp vào đây)
│   ├── n8n.js                           # gọi webhook n8n (activate dịch vụ, remind giỏ hàng treo, forward tin nhắn chat để n8n xử lý AI bên trong workflow)
│   ├── upload.js                        # upload file lên Cloudinary (dùng multer-storage-cloudinary hoặc cloudinary.uploader.upload), trả về secure_url
│   └── format.js                        # hàm thuần dùng chung: formatResponse, generateSlug, paginate helper...
│
├── sockets/                             # CHỈ xử lý sự kiện Socket.io, gọi trực tiếp model/helpers
│   ├── chat.socket.js                    # join_session, customer_message, request_human, admin_message
│   └── notifications.socket.js            # new_lead, new_order, abandoned_cart_alert
│
├── jobs/                                 # CHỈ cron/background job, gọi model/helpers để thực thi
│   ├── abandonedCart.job.js
│   └── tokenCleanup.job.js
│
├── .env.example
└── package.json
```

## 0.4. Bảng quy tắc "1 thư mục — 1 nhiệm vụ" (Backend)

| Thư mục | Được làm | KHÔNG được làm |
|---|---|---|
| `routes/admin/`, `routes/client/` | Khai báo `router.get/post/put/delete(path, middleware, controller.method)` | Viết logic xử lý, query DB, validate thủ công |
| `controllers/admin/`, `controllers/client/` | Nhận `req`, gọi `validators/` check input, xử lý TOÀN BỘ logic (query model, gọi `helpers/`, ghi log), trả `res.json()` | Định nghĩa schema DB, khai báo route |
| `models/` | Định nghĩa schema, index, method tĩnh đơn giản | Chứa logic tính toán nghiệp vụ phức tạp |
| `middlewares/` | Auth, phân quyền, log, giới hạn request, xử lý lỗi chung | Xử lý logic riêng của 1 module nghiệp vụ |
| `validators/` | Định nghĩa schema kiểm tra dữ liệu đầu vào | Gọi DB, xử lý nghiệp vụ |
| `config/` | Khởi tạo kết nối/cấu hình (DB, Cloudinary, multer, socket, env) | Chứa route, controller, logic nghiệp vụ |
| `helpers/` | Gọi API bên thứ 3 (n8n, storage) trả kết quả thô; và các hàm thuần dùng chung (format response, generate slug, paginate...) | Xử lý logic nghiệp vụ của riêng 1 module (đó là việc của controller) |
| `sockets/` | Lắng nghe/emit sự kiện realtime, gọi model/helpers | Viết logic nghiệp vụ phức tạp không liên quan realtime |
| `jobs/` | Định nghĩa lịch chạy cron, gọi model/helpers thực thi | Chứa logic nghiệp vụ chi tiết |

**Quy tắc auth riêng biệt:** `routes/admin/auth.routes.js` + `controllers/admin/auth.controller.js` xử lý đăng nhập Admin (kiểm tra `role` là admin/sales/editor, trả JWT có `permissions`). `routes/client/auth.routes.js` + `controllers/client/auth.controller.js` xử lý đăng ký/đăng nhập khách hàng (role mặc định `customer`). Hai bộ JWT dùng `secret` khác nhau hoặc `audience` claim khác nhau để token Admin không dùng được cho API Client và ngược lại.

## 0.5. Coding Convention — viết code như người thật, không viết nén 1 dòng

> AI có xu hướng viết code kiểu nén gọn 1 dòng (`if(x)return y;`), lồng ternary/optional-chaining nhiều tầng khó đọc. BẮT BUỘC tuân theo các quy tắc sau cho MỌI file — đây không phải gợi ý, mà là ràng buộc.

1. **Không viết logic dồn vào 1 dòng.** Mỗi câu lệnh xuống dòng riêng, kể cả khi ngắn.
   ```js
   // SAI
   if (!order) return res.status(404).json({ success: false, error: 'Not found' });

   // ĐÚNG
   if (!order) {
     return res.status(404).json({
       success: false,
       error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' },
     });
   }
   ```
2. **Không lồng ternary hoặc optional chaining quá 1 tầng.** Nếu cần rẽ nhánh phức tạp, dùng `if/else` hoặc gán biến trung gian có tên rõ nghĩa, thay vì viết 1 dòng dài khó đọc.
3. **Không viết arrow function 1 dòng có nhiều xử lý bên trong.** Callback từ 3 dòng logic trở lên phải có block `{ }` rõ ràng, không viết kiểu `.map(x => x.a && x.b ? f(x) : g(x))`.
4. **Đặt tên biến/hàm đầy đủ nghĩa**, không viết tắt khó hiểu (`o`, `usr`, `tmp2`) — dùng `order`, `user`, `filteredLeads`.
5. **Tách logic thành các bước có comment ngắn mô tả**, đặc biệt trong controller có nhiều bước (validate → query → xử lý phụ → trả response). Ví dụ:
   ```js
   exports.activateOrder = async (req, res, next) => {
     try {
       // 1. Lấy đơn hàng theo id
       const order = await Order.findById(req.params.id);
       if (!order) {
         return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy đơn hàng' } });
       }

       // 2. Kiểm tra trạng thái hợp lệ trước khi kích hoạt
       if (order.status !== 'paid') {
         return res.status(400).json({ success: false, error: { code: 'INVALID_STATUS', message: 'Đơn hàng chưa thanh toán' } });
       }

       // 3. Cập nhật trạng thái đơn hàng
       order.status = 'active';
       order.activatedAt = new Date();
       await order.save();

       // 4. Gọi n8n để kích hoạt dịch vụ thật
       await n8nHelper.triggerActivation(order);

       // 5. Trả kết quả
       res.json({ success: true, data: order });
     } catch (err) {
       next(err);
     }
   };
   ```
6. **Không gộp nhiều import trên 1 dòng bằng dấu phẩy dài** nếu quá 4-5 item — xuống dòng từng nhóm liên quan.
7. **Dùng Prettier + ESLint config cố định** cho cả project để mọi file được format đồng nhất (không để mỗi file 1 kiểu do model sinh ra khác lúc):
   ```json
   // .prettierrc
   { "semi": true, "singleQuote": true, "trailingComma": "all", "printWidth": 100, "tabWidth": 2 }
   ```
8. **Không quan trọng file dài hay ngắn** — không cần tách nhỏ chỉ vì đếm số dòng. Điều quan trọng là MỌI đoạn logic bên trong đều phải xuống dòng rõ ràng, dễ đọc như quy tắc 1-7 ở trên, dù file đó có bao nhiêu dòng đi nữa.

---

# CHI TIẾT KỸ THUẬT

> Backend phục vụ đồng thời Admin (CMS nội bộ) và Client (website công khai). Toàn bộ API dưới `/api/v1`.

## 1. Tech stack & kiến trúc

- **Runtime**: Node.js (Express)
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JWT (accessToken 15p, refreshToken 7 ngày lưu httpOnly cookie), refresh token rotation, RBAC theo `role` (admin/sales/editor cho Admin — customer cho Client). Auth Admin và Client là 2 bộ route/controller riêng (xem mục 0.4).
- **Realtime**: Socket.io server (namespace `/chat`, `/notifications`)
- **File storage**: Cloudinary cho toàn bộ ảnh (ảnh sản phẩm, logo, favicon, ảnh bài viết, ảnh workflow n8n) — upload qua `multer` (memory storage) rồi đẩy buffer lên Cloudinary trong `helpers/upload.js`, lưu lại `secure_url` trả về vào MongoDB
- **Automation**: tích hợp n8n qua webhook 2 chiều (BE gọi n8n để trigger workflow; n8n gọi ngược vào BE qua webhook để trả kết quả/đẩy bài crawl Facebook)
- **Bot chat tự động**: KHÔNG gọi trực tiếp Anthropic/OpenAI từ backend. Backend forward tin nhắn khách qua webhook n8n (`helpers/n8n.js`), n8n tự xử lý gọi AI provider bên trong workflow rồi gọi callback webhook trả kết quả về backend.
- **Validation**: zod hoặc joi ở tầng `validators/`
- **Job nền**: node-cron hoặc BullMQ (Redis) cho: quét giỏ hàng treo quá N ngày, tự động publish bài viết đã duyệt theo lịch, dọn refresh token hết hạn

## 2. Data Models (Mongoose Schema — rút gọn)

### User (tài khoản Admin nội bộ + khách hàng)
```
{
  name: String,
  email: { type: String, unique: true },
  phone: String,
  passwordHash: String,
  role: { type: String, enum: ['admin','sales','editor','customer'], default: 'customer' },
  permissions: [String],          // dùng cho phân quyền chi tiết nội bộ (chỉ áp dụng role admin/sales/editor)
  status: { type: String, enum: ['active','locked'], default: 'active' },
  avatarUrl: String,
  createdAt, updatedAt
}
```

### Lead
```
{
  name: String, phone: String, email: String,
  source: { type: String, enum: ['form','chat','facebook','zalo','other'] },
  serviceInterested: { type: ObjectId, ref: 'Service' },
  status: { type: String, enum: ['new','contacted','qualified','converted','lost'] },
  notes: [{ content: String, createdBy: ObjectId, createdAt: Date }],
  assignedTo: { type: ObjectId, ref: 'User' },
  convertedOrderId: { type: ObjectId, ref: 'Order' },
  createdAt, updatedAt
}
```

### Order
```
{
  code: { type: String, unique: true },
  customer: { name, phone, email },
  items: [{ serviceId: ObjectId, storeProductId: ObjectId, name: String, price: Number, qty: Number }],
  total: Number,
  status: { type: String, enum: ['pending','paid','active','completed','cancelled'] },
  paymentMethod: String,
  paymentProofUrl: String,
  activatedAt: Date, cancelReason: String,
  createdAt, updatedAt
}
```

### CartItem (giỏ hàng — kể cả giỏ hàng treo)
```
{ userId/sessionId, serviceId, storeProductId, qty, addedAt, remindedAt }
```

### Blog / BlogCategory
```
Blog: {
  title, slug, excerpt, content (HTML từ react-quill),
  coverImageUrl, category: ObjectId ref BlogCategory,
  status: { type: String, enum: ['pending_review','draft','published'] },
  source: { type: String, enum: ['manual','facebook_crawl'] },
  publishedAt, author: ObjectId ref User
}
BlogCategory: { name, slug }
```

### Faq
```
{ question, answer, category: ObjectId, relatedService: ObjectId ref Service, order: Number }
```

### Service / StoreProduct
```
Service: { name, slug, description(HTML), price, status: enum['visible','hidden'], featured: Boolean, images: [String] }
StoreProduct: {
  name, price, platform: enum['facebook','zalo','shopee','tiktok'],
  description(HTML), workflowImageUrl, n8nWorkflowJson: Object,
  status: enum['visible','hidden']
}
```

### ChatSession / ChatMessage
```
ChatSession: {
  customerName, customerPhone,
  mode: { type: String, enum: ['bot','human'], default: 'bot' },
  status: { type: String, enum: ['open','closed'] },
  assignedAdmin: ObjectId ref User,
  lastMessageAt
}
ChatMessage: {
  sessionId: ObjectId, sender: enum['customer','bot','admin'],
  content: String, feedback: enum['up','down', null], createdAt
}
```

### Settings (singleton document)
```
{
  appearance: { themeMode: enum['light','dark'], accentColor: String },
  siteInfo: { name, slogan, logoUrl, faviconUrl, hotline, email, address, socialLinks: { facebook, zalo } },
}
```

### ApiConfig
```
{ provider: enum['facebook','zalo','anthropic','openai','n8n'], apiKey, extra: Object, isActive: Boolean }
```

## 3. REST API Endpoints

### Auth — Admin (`routes/admin/auth.routes.js`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /admin/auth/login | Đăng nhập Admin, kiểm tra role admin/sales/editor, trả JWT kèm permissions |
| POST | /admin/auth/refresh | Cấp accessToken mới từ refreshToken Admin |
| POST | /admin/auth/logout | Thu hồi refreshToken Admin |
| GET | /admin/auth/me | Lấy thông tin Admin hiện tại |

### Auth — Client (`routes/client/auth.routes.js`)
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | /auth/register | Đăng ký tài khoản khách hàng |
| POST | /auth/login | Đăng nhập khách hàng |
| POST | /auth/refresh | Cấp accessToken mới từ refreshToken khách hàng |
| POST | /auth/logout | Thu hồi refreshToken khách hàng |
| GET | /auth/me | Lấy thông tin khách hàng hiện tại |
| POST | /auth/forgot-password | Gửi email link đặt lại mật khẩu |
| POST | /auth/reset-password | Đặt lại mật khẩu bằng token |

### Admin — Dashboard
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/dashboard/kpis | Số liệu tổng quan (lead mới, đơn hàng, doanh thu) |
| GET | /admin/dashboard/revenue-chart | Dữ liệu biểu đồ doanh thu theo ngày/tháng |
| GET | /admin/dashboard/lead-sources | Thống kê nguồn lead (form/chat/facebook/zalo) |

### Admin — Lead
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/leads | Danh sách lead (filter, search, phân trang) |
| GET | /admin/leads/:id | Chi tiết 1 lead |
| PATCH | /admin/leads/:id | Cập nhật trạng thái/thông tin lead |
| POST | /admin/leads/:id/notes | Thêm ghi chú chăm sóc |
| POST | /admin/leads/:id/convert-to-order | Chuyển lead thành đơn hàng |
| GET | /admin/leads/export | Xuất Excel/CSV danh sách lead |

### Admin — Đơn hàng
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/orders | Danh sách đơn hàng (filter theo trạng thái, tìm kiếm, phân trang) |
| GET | /admin/orders/:id | Chi tiết đơn hàng |
| PATCH | /admin/orders/:id/status | Cập nhật trạng thái đơn |
| POST | /admin/orders/:id/confirm-payment | Xác nhận đã thanh toán |
| POST | /admin/orders/:id/activate | Kích hoạt dịch vụ (gọi `helpers/n8n.js`) |
| POST | /admin/orders/:id/cancel | Huỷ đơn (yêu cầu lý do) |
| GET | /admin/carts/abandoned | Danh sách giỏ hàng treo quá N ngày |
| POST | /admin/carts/:id/remind | Gửi nhắc nhở email/Zalo qua n8n |

### Admin — Bài viết & Danh mục
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/blogs | Danh sách bài viết (tab Chờ duyệt / Thủ công, filter, search, phân trang) |
| POST | /admin/blogs | Tạo bài viết thủ công |
| PUT | /admin/blogs/:id | Sửa bài viết |
| PATCH | /admin/blogs/:id/approve | Duyệt bài viết crawl từ Facebook |
| PATCH | /admin/blogs/:id/reject | Từ chối bài viết crawl |
| DELETE | /admin/blogs/:id | Xoá bài viết |
| POST | /admin/blogs/webhook/facebook-crawl | Webhook n8n đẩy bài viết crawl mới vào (status mặc định `pending_review`) |
| GET/POST/PUT/DELETE | /admin/blog-categories | CRUD danh mục bài viết |

### Admin — Hỏi đáp (FAQ)
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/faqs | Danh sách FAQ (filter danh mục/dịch vụ, search, phân trang) |
| POST/PUT | /admin/faqs | Tạo/sửa FAQ |
| DELETE | /admin/faqs/:id | Xoá FAQ |
| PATCH | /admin/faqs/reorder | Cập nhật thứ tự sau kéo-thả |
| GET | /admin/faqs/search-suggestions | Gợi ý câu hỏi liên quan |

### Admin — Dịch vụ & Gian hàng
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/POST/PUT | /admin/services | CRUD Dịch vụ (filter, search, phân trang) |
| DELETE | /admin/services/:id | Xoá dịch vụ |
| GET/POST/PUT | /admin/store-products | CRUD Sản phẩm Gian hàng, gồm field `n8nWorkflowJson` (validate JSON hợp lệ) |
| DELETE | /admin/store-products/:id | Xoá sản phẩm |

### Admin — Trung tâm Chat
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/chat/sessions | Danh sách phiên chat (search, filter trạng thái) |
| GET | /admin/chat/sessions/:id/messages | Lịch sử tin nhắn 1 phiên |
| POST | /admin/chat/sessions/:id/takeover | Admin tiếp nhận chat trực tiếp (chuyển mode human) |
| POST | /admin/chat/sessions/:id/release | Trả lại cho Bot xử lý |
| PATCH | /admin/chat/messages/:id/feedback | Đánh giá up/down câu trả lời bot |

### Admin — Cấu hình hệ thống
| Method | Endpoint | Mô tả |
|---|---|---|
| GET/PUT | /admin/settings/appearance | Theme mode + accent color |
| GET/PUT | /admin/settings/site-info | Tên site, slogan, logo, favicon, liên hệ |
| POST | /admin/settings/upload-asset | Upload logo/favicon |
| GET | /admin/api-configs | Danh sách cấu hình Provider (Facebook/Zalo/Anthropic/OpenAI/n8n) |
| PUT | /admin/api-configs/:provider | Cập nhật API key/thông tin provider |
| POST | /admin/api-configs/:provider/test | Test kết nối provider |

### Admin — Người dùng
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /admin/users | Danh sách tài khoản nội bộ (filter, search, phân trang) |
| POST | /admin/users | Tạo tài khoản nội bộ |
| PATCH | /admin/users/:id | Sửa vai trò/trạng thái |
| PUT | /admin/roles/permissions | Cập nhật ma trận phân quyền theo role |

### Client — công khai
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | /services, /services/:slug | Danh sách/chi tiết dịch vụ |
| GET | /store-products, /store-products/:slug | Danh sách/chi tiết sản phẩm gian hàng |
| GET | /blogs, /blogs/:slug | Danh sách/chi tiết bài viết đã publish |
| GET | /faqs | Danh sách FAQ theo danh mục |
| GET | /cart | Xem giỏ hàng |
| POST | /cart/items | Thêm sản phẩm vào giỏ |
| PATCH | /cart/items/:id | Sửa số lượng |
| DELETE | /cart/items/:id | Xoá khỏi giỏ |
| POST | /orders | Tạo đơn hàng từ giỏ hàng (checkout) |
| GET | /orders/:id | Theo dõi trạng thái đơn hàng |
| POST | /orders/:id/payment-callback | Callback từ cổng thanh toán |
| POST | /chat/session | Khởi tạo phiên chat mới |
| GET | /chat/:sessionId/messages | Lịch sử tin nhắn của phiên |

## 4. Socket.io Events

**Namespace `/chat`** (Client ↔ Admin):
- `join_session` — client/admin join room theo `sessionId`
- `customer_message` — khách gửi tin nhắn → BE lưu tin nhắn vào MongoDB → gọi `helpers/n8n.js` forward tin nhắn (kèm sessionId) sang webhook n8n xử lý → n8n tự gọi AI provider bên trong workflow rồi gọi ngược webhook `POST /webhooks/n8n/chat-reply` trả `bot_reply` về → BE lưu `bot_reply` vào MongoDB và phát (emit) lại cho room qua Socket.io
- `request_human` — khách yêu cầu gặp người thật → BE đổi `mode` phiên sang `human`, phát `new_session_alert` cho toàn bộ Admin đang online
- `admin_message` — admin gửi tin nhắn trực tiếp trong phiên đang `human`
- `message_feedback` — cập nhật up/down cho 1 tin nhắn bot

**Namespace `/notifications`** (chỉ Admin):
- `new_lead`, `new_order`, `abandoned_cart_alert` — đẩy realtime cho chuông thông báo ở Topbar

## 5. Tích hợp n8n (2 chiều)

- **BE → n8n** (trigger workflow): kích hoạt dịch vụ (`/admin/orders/:id/activate`), gửi nhắc nhở giỏ hàng treo (`/admin/carts/:id/remind`), forward tin nhắn chat để xử lý bot (khi `customer_message` bắn lên qua Socket.io) — controller/socket gọi `helpers/n8n.js` kèm payload.
- **n8n → BE** (webhook nhận dữ liệu): crawl bài viết Facebook mới (`POST /admin/blogs/webhook/facebook-crawl`), test kết nối provider trả kết quả về (`POST /admin/api-configs/:provider/test`), và **trả câu trả lời bot chat** (`POST /webhooks/n8n/chat-reply` — n8n gọi lại sau khi xử lý xong AI bên trong workflow, backend nhận rồi lưu MongoDB + emit `bot_reply` qua Socket.io cho đúng room theo `sessionId`).
- Cấu hình URL webhook, API key của n8n và các Provider (Anthropic/OpenAI dùng bên trong n8n workflow, Facebook/Zalo dùng cho crawl/gửi tin) quản lý tập trung tại `/admin/api-configs`.

## 6. Chuẩn hoá Phân trang, Tìm kiếm & Response

> Áp dụng THỐNG NHẤT cho MỌI endpoint dạng danh sách (Lead, Order, Blog, Faq, Service, StoreProduct, User, ChatSession...). Không tự đặt tên field khác đi.

### 6.1. Phân trang — chuẩn `page` & `limit`

Mọi endpoint GET dạng danh sách nhận query params:

| Param | Kiểu | Mặc định | Ghi chú |
|---|---|---|---|
| `page` | number | 1 | Trang hiện tại, bắt đầu từ 1 |
| `limit` | number | 20 | Số item/trang, tối đa 100 |

Convert sang MongoDB bằng `skip = (page - 1) * limit`, `.limit(limit)`.

**Response chuẩn:**
```json
{
  "success": true,
  "data": [ /* mảng item */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 137,
    "totalPages": 7
  }
}
```

Viết 1 helper dùng chung trong `helpers/format.js`:
```js
function paginate(query, { page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page));
  const l = Math.min(100, Math.max(1, parseInt(limit)));
  return { skip: (p - 1) * l, limit: l, page: p };
}

function buildPaginationResponse(data, total, page, limit) {
  return {
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
module.exports = { paginate, buildPaginationResponse };
```
Mọi controller danh sách (`getLeads`, `getOrders`, `getBlogs`, `getFaqs`, `getServices`, `getStoreProducts`, `getUsers`, `getChatSessions`...) đều gọi 2 hàm này thay vì tự viết logic phân trang riêng.

### 6.2. Tìm kiếm — query param `search`

Mọi endpoint danh sách có ô tìm kiếm ở Admin (theo đặc tả frontend) đều nhận thêm query param:

| Param | Kiểu | Ghi chú |
|---|---|---|
| `search` | string | Tìm không phân biệt hoa/thường, dùng MongoDB regex hoặc text index tuỳ độ dài dữ liệu |

**API tìm kiếm cụ thể theo từng resource** (bổ sung rõ field được tìm, tránh AI tự đoán sai field):

| Endpoint | Field được tìm bởi `search` |
|---|---|
| `GET /admin/leads?search=` | `name`, `phone`, `email` |
| `GET /admin/orders?search=` | `code`, `customer.name`, `customer.phone` |
| `GET /admin/blogs?search=` | `title` |
| `GET /admin/faqs?search=` | `question` |
| `GET /admin/services?search=` | `name` |
| `GET /admin/store-products?search=` | `name` |
| `GET /admin/users?search=` | `name`, `email` |
| `GET /admin/chat/sessions?search=` | `customerName`, `customerPhone` |
| `GET /blogs?search=` (Client) | `title` (chỉ tìm trong bài `published`) |
| `GET /faqs?search=` (Client) | `question` |
| `GET /services?search=` (Client) | `name` |
| `GET /store-products?search=` (Client) | `name` |

Ví dụ controller áp dụng cả 2 chuẩn (phân trang + tìm kiếm) cho Lead:
```js
exports.getLeads = async (req, res, next) => {
  try {
    const { page, limit, search, status, source } = req.query;
    const { skip, limit: l, page: p } = paginate(req.query, { page, limit });

    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Lead.countDocuments(filter),
    ]);

    res.json(buildPaginationResponse(data, total, p, l));
  } catch (err) { next(err); }
};
```

### 6.3. Response chuẩn cho các trường hợp khác

- **1 object (GET chi tiết, POST tạo mới, PUT/PATCH sửa)**: `{ "success": true, "data": { ... } }`
- **Lỗi** (do `errorHandler.middleware.js` xử lý tập trung): `{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "..." } }`
- **Action không trả data** (vd DELETE, activate, approve): `{ "success": true, "message": "..." }`

---

## 7. Middleware & bảo mật

- `authMiddleware` — verify JWT (2 bộ token khác nhau cho admin/client), gắn `req.user`
- `rbacMiddleware(permissions)` — chỉ áp cho `routes/admin/*`, chặn theo `role`/`permissions`
- `rateLimiter` — áp cho `routes/*/auth.routes.js` và `/chat/session` chống spam
- `uploadMiddleware` (multer + Cloudinary) — validate định dạng/dung lượng file khi upload logo, favicon, ảnh sản phẩm, ảnh workflow
- Validate `n8nWorkflowJson` bằng `JSON.parse` + schema check trước khi lưu MongoDB
