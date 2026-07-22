const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middlewares/errorHandler.middleware');

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
const adminStoreProductsRoutes = require('./routes/admin/storeProducts.routes');
const adminChatRoutes = require('./routes/admin/chat.routes');
const adminSettingsRoutes = require('./routes/admin/settings.routes');
const adminApiConfigsRoutes = require('./routes/admin/apiConfigs.routes');
const adminUsersRoutes = require('./routes/admin/users.routes');
const adminRoleRoutes = require('./routes/admin/role.routes');
const adminLogRoutes = require('./routes/admin/log.routes');
const clientOrdersRoutes = require('./routes/client/orders.routes');
const clientCartsRoutes = require('./routes/client/cart.routes');
const clientBlogsRoutes = require('./routes/client/blogs.routes');
const clientFaqsRoutes = require('./routes/client/faqs.routes');
const clientServicesRoutes = require('./routes/client/services.routes');
const clientStoreProductsRoutes = require('./routes/client/storeProducts.routes');
const clientChatRoutes = require('./routes/client/chat.routes');
const clientSettingsRoutes = require('./routes/client/settings.routes');
const clientLeadsRoutes = require('./routes/client/leads.routes');

const webhooksRoutes = require('./routes/webhooks.routes');

app.use('/api/v1/admin/auth', adminAuthRoutes);
app.use('/api/v1/admin/dashboard', adminDashboardRoutes);
app.use('/api/v1/admin/leads', adminLeadsRoutes);
app.use('/api/v1/admin/orders', adminOrdersRoutes);
app.use('/api/v1/admin/carts', adminCartsRoutes);
app.use('/api/v1/admin/blogs', adminBlogsRoutes);
app.use('/api/v1/admin/faqs', adminFaqsRoutes);
app.use('/api/v1/admin/services', adminServicesRoutes);
app.use('/api/v1/admin/store-products', adminStoreProductsRoutes);
app.use('/api/v1/admin/chat', adminChatRoutes);
app.use('/api/v1/admin/settings', adminSettingsRoutes);
app.use('/api/v1/admin/api-configs', adminApiConfigsRoutes);
app.use('/api/v1/admin/users', adminUsersRoutes);
app.use('/api/v1/admin/roles', adminRoleRoutes);
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
