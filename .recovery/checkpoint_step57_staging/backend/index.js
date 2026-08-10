const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middlewares/errorHandler.middleware');
const auditLogMiddleware = require('./middlewares/auditLog.middleware');

// 1. Khởi tạo app Express
const app = express();

// 2. Tạo HTTP server để dùng cho cả Express và Socket.io
const server = http.createServer(app);

// 3. Gắn các middlewares cơ bản
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// 4. Kết nối Database
connectDB(); // Tạm comment lại nếu chưa có MONGO_URI thật

// 5. Initialize Sockets
const io = initSocket(server);
require('./sockets/chat.socket')(io);
require('./sockets/notifications.socket')(io);

// 6. Mount routes
const adminAuthRoutes = require('./routes/admin/auth.routes');
const clientAuthRoutes = require('./routes/client/auth.routes');
const adminDashboardRoutes = require('./routes/admin/dashboard.routes');
const adminLeadsRoutes = require('./routes/admin/leads.routes');
const adminOrdersRoutes = require('./routes/admin/orders.routes');
const adminCartsRoutes = require('./routes/admin/carts.routes');
const adminBlogsRoutes = require('./routes/admin/blogs.routes');
const adminFaqsRoutes = require('./routes/admin/faqs.routes');
const adminServicesRoutes = require('./routes/admin/services.routes');
const adminPricingRoutes = require('./routes/admin/pricing.routes');
const adminStoreProductsRoutes = require('./routes/admin/storeProducts.routes');
const adminChatRoutes = require('./routes/admin/chat.routes');
const adminSettingsRoutes = require('./routes/admin/settings.routes');
const adminApiConfigsRoutes = require('./routes/admin/apiConfigs.routes');
const adminUsersRoutes = require('./routes/admin/users.routes');
const adminRoleRoutes = require('./routes/admin/role.routes');
const adminLogRoutes = require('./routes/admin/log.routes');
const adminNotificationsRoutes = require('./routes/admin/notifications.routes');
const clientOrdersRoutes = require('./routes/client/orders.routes');
const clientCartsRoutes = require('./routes/client/cart.routes');
const clientBlogsRoutes = require('./routes/client/blogs.routes');
const clientFaqsRoutes = require('./routes/client/faqs.routes');
const clientServicesRoutes = require('./routes/client/services.routes');
const clientStoreProductsRoutes = require('./routes/client/storeProducts.routes');
const clientChatRoutes = require('./routes/client/chat.routes');
const clientSettingsRoutes = require('./routes/client/settings.routes');
const clientLeadsRoutes = require('./routes/client/leads.routes');
const clientPricingRoutes = require('./routes/client/pricing.routes');

const webhooksRoutes = require('./routes/webhooks.routes');

app.use('/api/v1/admin/auth', adminAuthRoutes);

// Apply audit log to these admin routes
app.use('/api/v1/admin/dashboard', auditLogMiddleware, adminDashboardRoutes);
app.use('/api/v1/admin/leads', auditLogMiddleware, adminLeadsRoutes);
app.use('/api/v1/admin/orders', auditLogMiddleware, adminOrdersRoutes);
app.use('/api/v1/admin/carts', auditLogMiddleware, adminCartsRoutes);
app.use('/api/v1/admin/blogs', auditLogMiddleware, adminBlogsRoutes);
app.use('/api/v1/admin/faqs', auditLogMiddleware, adminFaqsRoutes);
app.use('/api/v1/admin/services', auditLogMiddleware, adminServicesRoutes);
app.use('/api/v1/admin/pricing', auditLogMiddleware, adminPricingRoutes);
app.use('/api/v1/admin/store-products', auditLogMiddleware, adminStoreProductsRoutes);
app.use('/api/v1/admin/chat', auditLogMiddleware, adminChatRoutes);
app.use('/api/v1/admin/settings', auditLogMiddleware, adminSettingsRoutes);
app.use('/api/v1/admin/api-configs', auditLogMiddleware, adminApiConfigsRoutes);
app.use('/api/v1/admin/users', auditLogMiddleware, adminUsersRoutes);
app.use('/api/v1/admin/roles', auditLogMiddleware, adminRoleRoutes);
app.use('/api/v1/admin/notifications', auditLogMiddleware, adminNotificationsRoutes);

// Logs route doesn't need audit log itself
app.use('/api/v1/admin/logs', adminLogRoutes);
app.use('/api/v1/auth', clientAuthRoutes);
app.use('/api/v1/orders', clientOrdersRoutes);
app.use('/api/v1/cart', clientCartsRoutes);
app.use('/api/v1/blogs', clientBlogsRoutes);
app.use('/api/v1/faqs', clientFaqsRoutes);
app.use('/api/v1/services', clientServicesRoutes);
app.use('/api/v1/store-products', clientStoreProductsRoutes);
app.use('/api/v1/chat', clientChatRoutes);
app.use('/api/v1/settings', clientSettingsRoutes);
app.use('/api/v1/leads', clientLeadsRoutes);
app.use('/api/v1/client/pricing', clientPricingRoutes);

app.use('/api/v1/webhooks', webhooksRoutes);

// 7. Khởi chạy Cron Jobs
const initAbandonedCartJob = require('./jobs/abandonedCart.job');
const initTokenCleanupJob = require('./jobs/tokenCleanup.job');

initAbandonedCartJob();
initTokenCleanupJob();

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 7. Gắn middleware xử lý lỗi tập trung ở cuối cùng
app.use(errorHandler);

// 8. Bắt đầu lắng nghe request
const PORT = env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
