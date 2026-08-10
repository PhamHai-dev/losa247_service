import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { ClientLayout } from './layouts/ClientLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage, BlogPage, BlogDetailPage, ServicesPage, ServiceDetailPage, StorePage, StoreDetailPage, AccountPage, CartPage, CheckoutPage, TagDetailPage } from './pages/client'
import BotcakeClone from './pages/client/ChatbotSolutionsPage'
// import BroadcastMarketingPage from './pages/client/BroadcastMarketingPage'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AdminLoginPage } from './pages/auth/AuthPages'
import { AdminDashboard, AdminLeads, AdminOrders, AdminCarts, AdminBlogs, AdminBlogEditor, AdminFaqs, AdminServices, AdminStore, AdminChat, AdminLogs, AdminUsers, AdminSettings, AdminNotifications } from './pages/admin'
import { PermissionGuard } from './components/admin/PermissionGuard'

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// App khai báo toàn bộ routing client/admin theo đặc tả Agent.md.
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
    <Route element={<ClientLayout />}>
      <Route index element={<HomePage />} />
      <Route path="giai-phap/chatbot" element={<BotcakeClone />} />
      {/* <Route path="giai-phap/gui-tin-tiep-thi" element={<BroadcastMarketingPage />} /> */}
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:id" element={<BlogDetailPage />} />
      <Route path="tag/:slug" element={<TagDetailPage />} />
      <Route path="bang-gia" element={<ServicesPage />} />
      <Route path="bang-gia/:id" element={<ServiceDetailPage />} />
      <Route path="gian-hang" element={<StorePage />} />
      <Route path="gian-hang/:id" element={<StoreDetailPage />} />

      <Route path="tai-khoan" element={<AccountPage />} />
      <Route path="gio-hang" element={<CartPage />} />
      <Route path="thanh-toan" element={<CheckoutPage />} />
    </Route>
    <Route path="dang-nhap" element={<LoginPage />} />
    <Route path="dang-ky" element={<RegisterPage />} />
    <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />
    <Route path="dat-lai-mat-khau" element={<ResetPasswordPage />} />
    <Route path="admin/dang-nhap" element={<AdminLoginPage />} />
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<PermissionGuard permission="dashboard.view"><AdminDashboard /></PermissionGuard>} />
      <Route path="leads" element={<PermissionGuard permission="leads.view"><AdminLeads /></PermissionGuard>} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="blogs" element={<PermissionGuard permission="blogs.view"><AdminBlogs /></PermissionGuard>} />
      <Route path="blogs/editor" element={<PermissionGuard any={['blogs.create', 'blogs.update']}><AdminBlogEditor /></PermissionGuard>} />
      <Route path="faqs" element={<PermissionGuard permission="faqs.view"><AdminFaqs /></PermissionGuard>} />
      <Route path="services" element={<PermissionGuard permission="pricing.view"><AdminServices /></PermissionGuard>} />
      <Route path="store" element={<AdminStore />} />
      <Route path="chat" element={<PermissionGuard permission="chat.view"><AdminChat /></PermissionGuard>} />
      <Route path="logs" element={<PermissionGuard permission="logs.view"><AdminLogs /></PermissionGuard>} />
      <Route path="users" element={<PermissionGuard any={['users.view', 'roles.view']}><AdminUsers /></PermissionGuard>} />
      <Route path="settings" element={<PermissionGuard any={['settings.view', 'apiConfigs.view']}><AdminSettings /></PermissionGuard>} />
      <Route path="notifications" element={<PermissionGuard permission="notifications.view"><AdminNotifications /></PermissionGuard>} />
    </Route>
  </Routes>
  </>
  )
}
