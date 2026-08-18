import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useLayoutEffect } from 'react'
import { ClientLayout } from './layouts/ClientLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { HomePage, BlogPage, BlogDetailPage, ServicesPage, AccountPage, TagDetailPage, NotFoundPage } from './pages/client'
import BotcakeClone from './pages/client/ChatbotSolutionsPage'
// import BroadcastMarketingPage from './pages/client/BroadcastMarketingPage'
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, AdminLoginPage } from './pages/auth/AuthPages'
import { AdminDashboard, AdminLeads, AdminBlogs, AdminBlogEditor, AdminFaqs, AdminServices, AdminChat, AdminLogs, AdminUsers, AdminSettings, AdminNotifications } from './pages/admin'

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.body.scrollTop = 0;

    const frameId = window.requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });

    return () => window.cancelAnimationFrame(frameId);
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

          <Route path="tai-khoan" element={<AccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
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
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blogs/editor" element={<AdminBlogEditor />} />
          <Route path="faqs" element={<AdminFaqs />} />
          <Route path="services" element={<AdminServices />} />
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
