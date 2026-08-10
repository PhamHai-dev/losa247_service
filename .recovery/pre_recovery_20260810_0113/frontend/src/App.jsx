import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { ClientLayout } from './layouts/ClientLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage, BlogPage, BlogDetailPage, ServicesPage, ServiceDetailPage, StorePage, StoreDetailPage, AccountPage, CartPage, CheckoutPage, TagDetailPage } from './pages/client'
import BotcakeClone from './pages/client/ChatbotSolutionsPage'
// import BroadcastMarketingPage from './pages/client/BroadcastMarketingPage'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AdminLoginPage } from './pages/auth/AuthPages'
import { AdminDashboard, AdminLeads, AdminOrders, AdminCarts, AdminBlogs, AdminBlogEditor, AdminFaqs, AdminServices, AdminStore, AdminChat, AdminLogs, AdminUsers, AdminSettings, AdminNotifications } from './pages/admin'

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
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="leads" element={<AdminLeads />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="blogs" element={<AdminBlogs />} />
      <Route path="blogs/editor" element={<AdminBlogEditor />} />
      <Route path="faqs" element={<AdminFaqs />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="store" element={<AdminStore />} />
      <Route path="chat" element={<AdminChat />} />
      <Route path="logs" element={<AdminLogs />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="settings" element={<AdminSettings />} />
      <Route path="notifications" element={<AdminNotifications />} />
    </Route>
  </Routes>
  </>
  )
}
