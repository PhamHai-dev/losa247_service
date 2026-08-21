const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
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
if (env.TRUST_PROXY) app.set('trust proxy', 1);
const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return callback(null, true);
    return callback(new Error('Origin không được CORS cho phép'));
  },
};
app.use(cors(corsOptions));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cookieParser());
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buffer) => {
      if (req.originalUrl.startsWith('/api/v1/webhooks/')) req.rawBody = buffer.toString('utf8');
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: '256kb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 4. Kết nối MySQL qua Prisma và khởi tạo Redis cache
connectDB();
const { getReadyClient } = require('./config/redis');
void getReadyClient();

// 5. Initialize Sockets
const io = initSocket(server);
require('./sockets/chat.socket')(io);
require('./sockets/notifications.socket')(io);

// 6. Mount routes
const adminAuthRoutes = require('./routes/admin/auth.routes');
const clientAuthRoutes = require('./routes/client/auth.routes');
const adminDashboardRoutes = require('./routes/admin/dashboard.routes');
const adminLeadsRoutes = require('./routes/admin/leads.routes');
const adminBlogsRoutes = require('./routes/admin/blogs.routes');
const adminFaqsRoutes = require('./routes/admin/faqs.routes');
const adminPricingRoutes = require('./routes/admin/pricing.routes');
const adminChatRoutes = require('./routes/admin/chat.routes');
const adminSettingsRoutes = require('./routes/admin/settings.routes');
const adminApiConfigsRoutes = require('./routes/admin/apiConfigs.routes');
const adminUsersRoutes = require('./routes/admin/users.routes');
const adminRoleRoutes = require('./routes/admin/role.routes');
const adminLogRoutes = require('./routes/admin/log.routes');
const adminNotificationsRoutes = require('./routes/admin/notifications.routes');
const clientBlogsRoutes = require('./routes/client/blogs.routes');
const clientFaqsRoutes = require('./routes/client/faqs.routes');
const clientChatRoutes = require('./routes/client/chat.routes');
const clientSettingsRoutes = require('./routes/client/settings.routes');
const clientLeadsRoutes = require('./routes/client/leads.routes');
const clientPricingRoutes = require('./routes/client/pricing.routes');

const webhooksRoutes = require('./routes/webhooks.routes');

app.use('/api/v1/admin/auth', adminAuthRoutes);

// Apply audit log to these admin routes
app.use('/api/v1/admin/dashboard', auditLogMiddleware, adminDashboardRoutes);
app.use('/api/v1/admin/leads', auditLogMiddleware, adminLeadsRoutes);
app.use('/api/v1/admin/blogs', auditLogMiddleware, adminBlogsRoutes);
app.use('/api/v1/admin/faqs', auditLogMiddleware, adminFaqsRoutes);
app.use('/api/v1/admin/pricing', auditLogMiddleware, adminPricingRoutes);
app.use('/api/v1/admin/chat', auditLogMiddleware, adminChatRoutes);
app.use('/api/v1/admin/settings', auditLogMiddleware, adminSettingsRoutes);
app.use('/api/v1/admin/api-configs', auditLogMiddleware, adminApiConfigsRoutes);
app.use('/api/v1/admin/users', auditLogMiddleware, adminUsersRoutes);
app.use('/api/v1/admin/roles', auditLogMiddleware, adminRoleRoutes);
app.use('/api/v1/admin/notifications', auditLogMiddleware, adminNotificationsRoutes);

// Logs route doesn't need audit log itself
app.use('/api/v1/admin/logs', adminLogRoutes);
app.use('/api/v1/auth', clientAuthRoutes);
app.use('/api/v1/blogs', clientBlogsRoutes);
app.use('/api/v1/faqs', clientFaqsRoutes);
app.use('/api/v1/chat', clientChatRoutes);
app.use('/api/v1/settings', clientSettingsRoutes);
app.use('/api/v1/leads', clientLeadsRoutes);
app.use('/api/v1/client/pricing', clientPricingRoutes);

app.use('/api/v1/webhooks', webhooksRoutes);

// 7. Khởi chạy Cron Jobs
const initTokenCleanupJob = require('./jobs/tokenCleanup.job');

initTokenCleanupJob();

if (env.RUN_CHAT_WORKERS_IN_API && (env.REDIS_SOCKET_PATH || env.REDIS_HOST)) {
  require('./jobs/outboxDispatcher.worker').start();
  require('./jobs/chatAutomation.worker').start();
  require('./jobs/deadLetter.worker').start();
}

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
