/**
 * seed.js
 *
 * Script tạo dữ liệu mẫu (seed data) cho tất cả model của dự án LOSA247.
 * Cách chạy:
 *   1. Đặt file này vào thư mục gốc backend (ngang hàng với package.json)
 *   2. Cài bcrypt nếu chưa có: npm install bcryptjs
 *   3. Đảm bảo file .env đã có MONGO_URI đúng
 *   4. Chạy: node seed.js
 *
 * Script sẽ XOÁ SẠCH dữ liệu cũ trong các collection liên quan rồi chèn lại dữ liệu mẫu.
 * KHÔNG chạy script này trên database production đã có dữ liệu thật.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Đã kết nối MongoDB');

  const db = mongoose.connection.db;

  // Xoá sạch dữ liệu cũ trong các collection liên quan trước khi seed lại
  const collections = [
    'users',
    'leads',
    'orders',
    'cartitems',
    'blogs',
    'blogcategories',
    'faqs',
    'services',
    'storeproducts',
    'chatsessions',
    'chatmessages',
    'settings',
    'apiconfigs',
  ];
  for (const name of collections) {
    await db.collection(name).deleteMany({});
  }
  console.log('Đã xoá dữ liệu cũ');

  // ---------- 1. Users ----------
  const passwordHash = await bcrypt.hash('123456', 10);

  const users = await db.collection('users').insertMany([
    {
      name: 'Nguyễn Văn Admin',
      email: 'admin@losa247.vn',
      phone: '0901111111',
      passwordHash,
      role: 'admin',
      permissions: ['*'],
      status: 'active',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Trần Thị Sales',
      email: 'sales@losa247.vn',
      phone: '0902222222',
      passwordHash,
      role: 'sales',
      permissions: ['leads.view', 'leads.edit', 'orders.view'],
      status: 'active',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Lê Văn Editor',
      email: 'editor@losa247.vn',
      phone: '0903333333',
      passwordHash,
      role: 'editor',
      permissions: ['blogs.view', 'blogs.edit', 'faqs.edit'],
      status: 'active',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Phạm Thị Khách',
      email: 'khachhang1@gmail.com',
      phone: '0912345678',
      passwordHash,
      role: 'customer',
      permissions: [],
      status: 'active',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Hoàng Văn Khách',
      email: 'khachhang2@gmail.com',
      phone: '0987654321',
      passwordHash,
      role: 'customer',
      permissions: [],
      status: 'active',
      avatarUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const userIds = Object.values(users.insertedIds);
  console.log(`Đã tạo ${userIds.length} users (mật khẩu mặc định cho tất cả: 123456)`);

  // ---------- 2. BlogCategories ----------
  const blogCategories = await db.collection('blogcategories').insertMany([
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Bán hàng đa kênh', slug: 'ban-hang-da-kenh' },
    { name: 'Tin tức', slug: 'tin-tuc' },
  ]);
  const catIds = Object.values(blogCategories.insertedIds);
  console.log(`Đã tạo ${catIds.length} blog categories`);

  // ---------- 3. Services ----------
  const services = await db.collection('services').insertMany([
    {
      name: 'Dịch vụ chạy Ads Facebook',
      slug: 'dich-vu-chay-ads-facebook',
      description: '<p>Dịch vụ chạy quảng cáo Facebook chuyên nghiệp, tối ưu chi phí, tăng doanh số.</p>',
      price: 3000000,
      status: 'visible',
      featured: true,
      images: ['https://res.cloudinary.com/demo/image/upload/sample1.jpg'],
    },
    {
      name: 'Dịch vụ Chatbot tự động',
      slug: 'dich-vu-chatbot-tu-dong',
      description: '<p>Xây dựng chatbot trả lời khách hàng 24/7 trên Facebook, Zalo.</p>',
      price: 5000000,
      status: 'visible',
      featured: true,
      images: ['https://res.cloudinary.com/demo/image/upload/sample2.jpg'],
    },
    {
      name: 'Dịch vụ SEO Website',
      slug: 'dich-vu-seo-website',
      description: '<p>Tối ưu SEO tổng thể website, tăng thứ hạng từ khoá mục tiêu.</p>',
      price: 4000000,
      status: 'visible',
      featured: false,
      images: [],
    },
    {
      name: 'Dịch vụ thiết kế Landing Page',
      slug: 'dich-vu-thiet-ke-landing-page',
      description: '<p>Thiết kế landing page chuyển đổi cao, tối ưu tốc độ tải trang.</p>',
      price: 2500000,
      status: 'hidden',
      featured: false,
      images: [],
    },
  ]);
  const serviceIds = Object.values(services.insertedIds);
  console.log(`Đã tạo ${serviceIds.length} services`);

  // ---------- 4. StoreProducts ----------
  const storeProducts = await db.collection('storeproducts').insertMany([
    {
      name: 'Workflow tự động trả lời Fanpage Facebook',
      price: 1500000,
      platform: 'facebook',
      description: '<p>Workflow n8n tự động trả lời tin nhắn Fanpage 24/7.</p>',
      workflowImageUrl: 'https://res.cloudinary.com/demo/image/upload/workflow1.jpg',
      n8nWorkflowJson: { nodes: [], connections: {} },
      status: 'visible',
    },
    {
      name: 'Workflow đồng bộ đơn hàng Shopee - Kho',
      price: 2000000,
      platform: 'shopee',
      description: '<p>Tự động đồng bộ đơn hàng Shopee về hệ thống quản lý kho.</p>',
      workflowImageUrl: 'https://res.cloudinary.com/demo/image/upload/workflow2.jpg',
      n8nWorkflowJson: { nodes: [], connections: {} },
      status: 'visible',
    },
    {
      name: 'Workflow gửi tin nhắn Zalo OA hàng loạt',
      price: 1200000,
      platform: 'zalo',
      description: '<p>Gửi tin nhắn chăm sóc khách hàng hàng loạt qua Zalo OA.</p>',
      workflowImageUrl: 'https://res.cloudinary.com/demo/image/upload/workflow3.jpg',
      n8nWorkflowJson: { nodes: [], connections: {} },
      status: 'visible',
    },
  ]);
  const storeProductIds = Object.values(storeProducts.insertedIds);
  console.log(`Đã tạo ${storeProductIds.length} store products`);

  // ---------- 5. Faqs ----------
  const faqs = await db.collection('faqs').insertMany([
    {
      question: 'Dịch vụ chạy Ads Facebook có cam kết hiệu quả không?',
      answer: '<p>Có, chúng tôi cam kết tối ưu chi phí và báo cáo minh bạch hàng tuần.</p>',
      category: catIds[0],
      relatedService: serviceIds[0],
      order: 1,
    },
    {
      question: 'Thời gian triển khai Chatbot mất bao lâu?',
      answer: '<p>Trung bình 3-5 ngày làm việc tuỳ độ phức tạp kịch bản.</p>',
      category: catIds[0],
      relatedService: serviceIds[1],
      order: 2,
    },
    {
      question: 'Có hỗ trợ thanh toán trả góp không?',
      answer: '<p>Hiện tại hỗ trợ thanh toán 2 đợt: 50% khi bắt đầu, 50% khi hoàn thành.</p>',
      category: catIds[1],
      relatedService: null,
      order: 3,
    },
    {
      question: 'Workflow n8n có cần server riêng không?',
      answer: '<p>Không bắt buộc, chúng tôi hỗ trợ cả n8n Cloud lẫn self-host.</p>',
      category: catIds[1],
      relatedService: null,
      order: 4,
    },
  ]);
  console.log(`Đã tạo ${Object.keys(faqs.insertedIds).length} faqs`);

  // ---------- 6. Blogs ----------
  const blogs = await db.collection('blogs').insertMany([
    {
      title: '5 xu hướng Marketing 2026 doanh nghiệp cần biết',
      slug: '5-xu-huong-marketing-2026',
      excerpt: 'Tổng hợp các xu hướng marketing nổi bật trong năm 2026.',
      content: '<p>Nội dung chi tiết bài viết về xu hướng marketing...</p>',
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/blog1.jpg',
      category: catIds[0],
      status: 'published',
      source: 'manual',
      publishedAt: new Date(),
      author: userIds[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Cách bán hàng đa kênh hiệu quả cho shop nhỏ',
      slug: 'cach-ban-hang-da-kenh-hieu-qua',
      excerpt: 'Hướng dẫn triển khai bán hàng đa kênh cho shop mới bắt đầu.',
      content: '<p>Nội dung chi tiết bài viết về bán hàng đa kênh...</p>',
      coverImageUrl: 'https://res.cloudinary.com/demo/image/upload/blog2.jpg',
      category: catIds[1],
      status: 'published',
      source: 'manual',
      publishedAt: new Date(),
      author: userIds[2],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: 'Bài viết crawl từ Fanpage Facebook - chờ duyệt',
      slug: 'bai-viet-crawl-cho-duyet',
      excerpt: 'Bài viết được crawl tự động qua n8n, đang chờ admin duyệt.',
      content: '<p>Nội dung crawl từ Facebook...</p>',
      coverImageUrl: '',
      category: catIds[2],
      status: 'pending_review',
      source: 'facebook_crawl',
      publishedAt: null,
      author: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log(`Đã tạo ${Object.keys(blogs.insertedIds).length} blogs`);

  // ---------- 7. Leads ----------
  const leads = await db.collection('leads').insertMany([
    {
      name: 'Nguyễn Thị Lan',
      phone: '0911111111',
      email: 'lan.nguyen@gmail.com',
      source: 'form',
      serviceInterested: serviceIds[0],
      status: 'new',
      notes: [],
      assignedTo: userIds[1],
      convertedOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Trần Văn Bình',
      phone: '0922222222',
      email: 'binh.tran@gmail.com',
      source: 'chat',
      serviceInterested: serviceIds[1],
      status: 'contacted',
      notes: [
        { content: 'Đã gọi điện tư vấn, khách đang cân nhắc', createdBy: userIds[1], createdAt: new Date() },
      ],
      assignedTo: userIds[1],
      convertedOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Lê Thị Hoa',
      phone: '0933333333',
      email: 'hoa.le@gmail.com',
      source: 'facebook',
      serviceInterested: serviceIds[2],
      status: 'qualified',
      notes: [],
      assignedTo: userIds[1],
      convertedOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'Phạm Văn Đức',
      phone: '0944444444',
      email: 'duc.pham@gmail.com',
      source: 'zalo',
      serviceInterested: null,
      status: 'lost',
      notes: [
        { content: 'Khách không phản hồi sau 2 tuần', createdBy: userIds[1], createdAt: new Date() },
      ],
      assignedTo: userIds[1],
      convertedOrderId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log(`Đã tạo ${Object.keys(leads.insertedIds).length} leads`);

  // ---------- 8. Orders ----------
  const orders = await db.collection('orders').insertMany([
    {
      code: 'DH000001',
      customer: { name: 'Phạm Thị Khách', phone: '0912345678', email: 'khachhang1@gmail.com' },
      items: [
        { serviceId: serviceIds[0], storeProductId: null, name: 'Dịch vụ chạy Ads Facebook', price: 3000000, qty: 1 },
      ],
      total: 3000000,
      status: 'paid',
      paymentMethod: 'bank_transfer',
      paymentProofUrl: 'https://res.cloudinary.com/demo/image/upload/proof1.jpg',
      activatedAt: null,
      cancelReason: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'DH000002',
      customer: { name: 'Hoàng Văn Khách', phone: '0987654321', email: 'khachhang2@gmail.com' },
      items: [
        { serviceId: null, storeProductId: storeProductIds[0], name: 'Workflow tự động trả lời Fanpage Facebook', price: 1500000, qty: 1 },
      ],
      total: 1500000,
      status: 'active',
      paymentMethod: 'momo',
      paymentProofUrl: '',
      activatedAt: new Date(),
      cancelReason: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      code: 'DH000003',
      customer: { name: 'Phạm Thị Khách', phone: '0912345678', email: 'khachhang1@gmail.com' },
      items: [
        { serviceId: serviceIds[1], storeProductId: null, name: 'Dịch vụ Chatbot tự động', price: 5000000, qty: 1 },
      ],
      total: 5000000,
      status: 'pending',
      paymentMethod: '',
      paymentProofUrl: '',
      activatedAt: null,
      cancelReason: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  console.log(`Đã tạo ${Object.keys(orders.insertedIds).length} orders`);

  // ---------- 9. CartItems (kể cả giỏ hàng treo) ----------
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  await db.collection('cartitems').insertMany([
    {
      userId: userIds[3],
      serviceId: serviceIds[2],
      storeProductId: null,
      qty: 1,
      addedAt: new Date(),
      remindedAt: null,
    },
    {
      userId: userIds[4],
      serviceId: null,
      storeProductId: storeProductIds[1],
      qty: 2,
      addedAt: threeDaysAgo,
      remindedAt: null, // giỏ hàng treo quá 3 ngày, chưa nhắc nhở
    },
  ]);
  console.log('Đã tạo cart items mẫu (gồm 1 giỏ hàng treo)');

  // ---------- 10. ChatSessions & ChatMessages ----------
  const chatSessions = await db.collection('chatsessions').insertMany([
    {
      customerName: 'Khách vãng lai 1',
      customerPhone: '0955555555',
      mode: 'bot',
      status: 'open',
      assignedAdmin: null,
      lastMessageAt: new Date(),
    },
    {
      customerName: 'Khách vãng lai 2',
      customerPhone: '0966666666',
      mode: 'human',
      status: 'open',
      assignedAdmin: userIds[1],
      lastMessageAt: new Date(),
    },
  ]);
  const sessionIds = Object.values(chatSessions.insertedIds);

  await db.collection('chatmessages').insertMany([
    { sessionId: sessionIds[0], sender: 'customer', content: 'Cho mình hỏi giá dịch vụ chạy ads?', feedback: null, createdAt: new Date() },
    { sessionId: sessionIds[0], sender: 'bot', content: 'Dịch vụ chạy Ads Facebook có giá 3.000.000đ/tháng ạ.', feedback: 'up', createdAt: new Date() },
    { sessionId: sessionIds[1], sender: 'customer', content: 'Mình muốn gặp nhân viên tư vấn trực tiếp', feedback: null, createdAt: new Date() },
    { sessionId: sessionIds[1], sender: 'admin', content: 'Chào anh/chị, em là Sales bên LOSA247, em hỗ trợ mình nhé!', feedback: null, createdAt: new Date() },
  ]);
  console.log(`Đã tạo ${sessionIds.length} chat sessions kèm tin nhắn mẫu`);

  // ---------- 11. Settings (singleton) ----------
  await db.collection('settings').insertOne({
    appearance: { themeMode: 'light', accentColor: '#0F766E' },
    siteInfo: {
      name: 'LOSA247',
      slogan: 'Giải pháp tự động hoá bán hàng đa kênh',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/logo.png',
      faviconUrl: 'https://res.cloudinary.com/demo/image/upload/favicon.png',
      hotline: '1900 1234',
      email: 'contact@losa247.vn',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      socialLinks: { facebook: 'https://facebook.com/losa247', zalo: 'https://zalo.me/losa247' },
    },
  });
  console.log('Đã tạo Settings mặc định');

  // ---------- 12. ApiConfigs ----------
  await db.collection('apiconfigs').insertMany([
    { provider: 'facebook', apiKey: 'your_facebook_api_key', extra: {}, isActive: false },
    { provider: 'zalo', apiKey: 'your_zalo_api_key', extra: {}, isActive: false },
    { provider: 'anthropic', apiKey: 'your_anthropic_api_key', extra: {}, isActive: true },
    { provider: 'openai', apiKey: 'your_openai_api_key', extra: {}, isActive: false },
    { provider: 'n8n', apiKey: '', extra: { webhookUrl: 'your_n8n_webhook_url' }, isActive: true },
  ]);
  console.log('Đã tạo 5 API config providers');

  console.log('\n✅ SEED DỮ LIỆU HOÀN TẤT.');
  console.log('Tài khoản đăng nhập mẫu (mật khẩu chung: 123456):');
  console.log('  Admin   : admin@losa247.vn');
  console.log('  Sales   : sales@losa247.vn');
  console.log('  Editor  : editor@losa247.vn');
  console.log('  Khách 1 : khachhang1@gmail.com');
  console.log('  Khách 2 : khachhang2@gmail.com');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
