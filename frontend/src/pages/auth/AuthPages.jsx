import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, App, Button, Form, Input, Result, Checkbox } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined, SafetyCertificateOutlined, LoginOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'
import { clientForgotPassword, clientResetPassword } from '../../features/auth/authService'
import '../../styles/admin/login.css'

function AuthLayout({ title, subtitle, children, variant = '' }) {
  const layoutClassName = `admin-login-layout${variant ? ` admin-login-layout--${variant}` : ''}`

  return (
    <div className={layoutClassName}>
      <div className="admin-login-bg-shape-1"></div>
      <div className="admin-login-bg-shape-2"></div>
      <div className="admin-login-dots-1"></div>
      <div className="admin-login-dots-2"></div>

      <div className="admin-login-content">
        <div className="admin-login-header">
          <h1 className="admin-login-title">{title}</h1>
          <p className="admin-login-subtitle">{subtitle}</p>
        </div>

        <div className="admin-login-card">
          {children}
        </div>

        <div className="admin-login-footer">
          <div className="admin-login-security">
            <SafetyCertificateOutlined /> Bảo mật bởi LOSA247 Security
          </div>
          <div className="admin-login-copyright">
            © 2024 LOSA247. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { loginClient, loading, error } = useAuthStore()

  const handleSubmit = async (values) => {
    try {
      await loginClient(values)
      message.success('Đăng nhập khách hàng thành công')
      navigate('/tai-khoan')
    } catch (loginError) {
      message.error(loginError?.error?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập khách hàng"
      subtitle="Dashboard realtime, theo dõi đơn hàng và dịch vụ AI"
    >
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

      <Form className="admin-login-form" layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="customer@gmail.com" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
          style={{ marginBottom: 12 }}
        >
          <Input.Password size="large" prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••••••••" />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 13 }}>
            Chưa có tài khoản? <Link to="/dang-ky" style={{ color: '#0d9488', fontWeight: 500 }}>Đăng ký</Link>
          </div>
          <Link to="/quen-mat-khau" style={{ color: '#0d9488', fontSize: 13, fontWeight: 500 }}>Quên mật khẩu?</Link>
        </div>

        <Button className="auth-login-submit" type="primary" htmlType="submit" size="large" loading={loading} block icon={<LoginOutlined />}>
          Đăng nhập
        </Button>
      </Form>
    </AuthLayout>
  )
}

export function AdminLoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { loginAdmin, loading, error } = useAuthStore()

  const handleSubmit = async (values) => {
    try {
      await loginAdmin(values)
      message.success('Đăng nhập admin thành công')
      navigate('/admin/dashboard')
    } catch (loginError) {
      message.error(loginError?.error?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <AuthLayout
      variant="admin"
      title="Đăng nhập hệ thống quản trị"
      subtitle="Quản lý và điều hành hệ thống LOSA247 một cách hiệu quả"
    >
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

      <Form className="admin-login-form" layout="vertical" onFinish={handleSubmit} initialValues={{ email: 'admin@gmail.com', remember: true }}>
        <Form.Item
          label="Email quản trị"
          name="email"
          rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="admin@gmail.com" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
          style={{ marginBottom: 12 }}
        >
          <Input.Password size="large" prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••••••••" />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox style={{ color: '#64748b', fontSize: 13 }}>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <Link to="/quen-mat-khau" style={{ color: '#0d9488', fontSize: 13, fontWeight: 500 }}>Quên mật khẩu?</Link>
        </div>

        <Button className="auth-login-submit" type="primary" htmlType="submit" size="large" loading={loading} block icon={<LoginOutlined />}>
          Đăng nhập Admin
        </Button>
      </Form>

      <div className="admin-login-divider">hoặc đăng nhập với</div>

      <div className="admin-login-social-btns">
        <button className="admin-login-social-btn" type="button">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" /> Google
        </button>
        <button className="admin-login-social-btn" type="button">
          <img src="https://www.svgrepo.com/show/452062/microsoft.svg" alt="Microsoft" /> Microsoft
        </button>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { registerClient, loading, error } = useAuthStore()

  const handleSubmit = async (values) => {
    try {
      await registerClient(values)
      message.success('Đăng ký thành công, vui lòng đăng nhập')
      navigate('/dang-nhap')
    } catch (registerError) {
      message.error(registerError?.error?.message || 'Đăng ký thất bại')
    }
  }

  return (
    <AuthLayout
      title="Tạo tài khoản khách hàng"
      subtitle="Theo dõi giỏ hàng, đơn hàng và các dịch vụ AI Sales Agent"
    >
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

      <Form className="admin-login-form" layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
          <Input size="large" prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="Nguyễn Văn A" />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email' }]}> 
          <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="customer@gmail.com" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input size="large" prefix={<PhoneOutlined style={{ color: '#94a3b8' }} />} placeholder="0901234567" />
        </Form.Item>

        <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]} style={{ marginBottom: 24 }}> 
          <Input.Password size="large" prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••••••••" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block>
          Tạo tài khoản
        </Button>
      </Form>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
        Đã có tài khoản? <Link to="/dang-nhap" style={{ color: '#0d9488', fontWeight: 500 }}>Đăng nhập</Link>
      </div>
    </AuthLayout>
  )
}

export function ForgotPasswordPage() {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async ({ email }) => {
    setLoading(true)
    setError('')
    try {
      await clientForgotPassword(email)
      setSent(true)
      message.success('Đã gửi hướng dẫn đặt lại mật khẩu')
    } catch (err) {
      setError(err?.error?.message || 'Không gửi được yêu cầu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Khôi phục quyền truy cập"
      subtitle="Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn."
    >
      {sent ? (
        <Result
          status="success"
          title="Đã gửi yêu cầu"
          subTitle="Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu."
          extra={<Link className="ant-btn ant-btn-primary" style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', height: 48, borderRadius: 8, fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }} to="/dang-nhap">Về đăng nhập</Link>}
        />
      ) : (
        <>
          {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

          <Form className="admin-login-form" layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
              style={{ marginBottom: 24 }}
            >
              <Input size="large" prefix={<MailOutlined style={{ color: '#94a3b8' }} />} placeholder="customer@gmail.com" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Gửi liên kết đặt lại
            </Button>
          </Form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
            Nhớ mật khẩu rồi? <Link to="/dang-nhap" style={{ color: '#0d9488', fontWeight: 500 }}>Đăng nhập</Link>
          </div>
        </>
      )}
    </AuthLayout>
  )
}

export function ResetPasswordPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async ({ newPassword }) => {
    setLoading(true)
    setError('')
    try {
      await clientResetPassword({ token, newPassword })
      message.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập')
      navigate('/dang-nhap')
    } catch (err) {
      setError(err?.error?.message || 'Không đặt lại được mật khẩu. Liên kết có thể đã hết hạn.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Đặt lại mật khẩu mới"
      subtitle="Tạo mật khẩu mới an toàn để tiếp tục sử dụng dịch vụ."
    >
      {!token && <Alert type="warning" title="Thiếu mã đặt lại (token). Vui lòng mở liên kết từ email." showIcon style={{ marginBottom: 16 }} />}
      {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

      <Form className="admin-login-form" layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
        >
          <Input.Password size="large" prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••••••••" />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu' },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('newPassword') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Mật khẩu xác nhận không khớp')),
            }),
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input.Password size="large" prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="••••••••••••••" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" loading={loading} block disabled={!token}>
          Đặt lại mật khẩu
        </Button>
      </Form>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13 }}>
        <Link to="/dang-nhap" style={{ color: '#0d9488', fontWeight: 500 }}>Về đăng nhập</Link>
      </div>
    </AuthLayout>
  )
}
