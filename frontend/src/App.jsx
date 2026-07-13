import { Navigate, Route, Routes } from 'react-router-dom'
import { ClientLayout } from './layouts/ClientLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage, BlogPage, BlogDetailPage, ServicesPage, ServiceDetailPage, StorePage, StoreDetailPage, FaqPage, AccountPage, CartPage, CheckoutPage } from './pages/client/ClientPages'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/AuthPages'
import { AdminDashboard, AdminLeads, AdminOrders, AdminBlogs, AdminBlogEditor, AdminFaqs, AdminServices, AdminChat, AdminLogs, AdminUsers, AdminSettings } from './pages/admin/AdminPages'

// App khai báo toàn bộ routing client/admin theo đặc tả Agent.md.
export default function App() {
  return <Routes>
    <Route element={<ClientLayout />}>
      <Route index element={<HomePage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:id" element={<BlogDetailPage />} />
      <Route path="dich-vu" element={<ServicesPage />} />
      <Route path="dich-vu/:id" element={<ServiceDetailPage />} />
      <Route path="gian-hang" element={<StorePage />} />
      <Route path="gian-hang/:id" element={<StoreDetailPage />} />
      <Route path="hoi-dap" element={<FaqPage />} />
      <Route path="tai-khoan" element={<AccountPage />} />
      <Route path="gio-hang" element={<CartPage />} />
      <Route path="thanh-toan" element={<CheckoutPage />} />
    </Route>
    <Route path="dang-nhap" element={<LoginPage />} />
    <Route path="dang-ky" element={<RegisterPage />} />
    <Route path="quen-mat-khau" element={<ForgotPasswordPage />} />
    <Route path="dat-lai-mat-khau" element={<ResetPasswordPage />} />
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="leads" element={<AdminLeads />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="blogs" element={<AdminBlogs />} />
      <Route path="blogs/editor" element={<AdminBlogEditor />} />
      <Route path="faqs" element={<AdminFaqs />} />
      <Route path="services" element={<AdminServices />} />
      <Route path="chat" element={<AdminChat />} />
      <Route path="logs" element={<AdminLogs />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="settings" element={<AdminSettings />} />
    </Route>
  </Routes>
}
