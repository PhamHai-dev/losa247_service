import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, App, Button, Card, Form, Input, Result, Segmented, Typography } from 'antd'
import { LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'
import { clientForgotPassword, clientResetPassword } from '../../features/auth/authService'

const { Title, Paragraph } = Typography

export function LoginPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [mode, setMode] = useState('admin')
  const { loginAdmin, loginClient, loading, error } = useAuthStore()

  const handleSubmit = async (values) => {
    try {
      if (mode === 'admin') {
        await loginAdmin(values)
        message.success('Đăng nhập admin thành công')
        navigate('/admin/dashboard')
        return
      }

      await loginClient(values)
      message.success('Đăng nhập khách hàng thành công')
      navigate('/tai-khoan')
    } catch (loginError) {
      message.error(loginError?.error?.message || 'Đăng nhập thất bại')
    }
  }

  return (
    <div className="auth-screen premium-auth">
      <div className="auth-art premium-auth-art">
        <div>
          <p className="eyebrow">LOSA247 Control Center</p>
          <h1>Đăng nhập để quản lý bán hàng bằng AI</h1>
          <p>Dashboard realtime, CRM lead, đơn hàng, chat bot và workflow n8n trong một hệ thống duy nhất.</p>
        </div>
      </div>

      <div className="auth-form premium-auth-form">
        <Card className="auth-card" variant="borderless">
          <Title level={2}>Chào mừng trở lại</Title>
          <Paragraph type="secondary">Chọn loại tài khoản và đăng nhập bằng API backend thật.</Paragraph>

          <Segmented
            block
            value={mode}
            onChange={setMode}
            options={[
              { label: 'Admin', value: 'admin' },
              { label: 'Khách hàng', value: 'client' },
            ]}
            style={{ marginBottom: 20 }}
          />

          {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

          <Form layout="vertical" onFinish={handleSubmit} initialValues={{ email: 'admin@gmail.com' }}>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
            >
              <Input size="large" prefix={<MailOutlined />} placeholder="admin@gmail.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="password123" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Đăng nhập
            </Button>
          </Form>

          <p style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span>Chưa có tài khoản khách? <Link to="/dang-ky">Đăng ký ngay</Link></span>
            <Link to="/quen-mat-khau">Quên mật khẩu?</Link>
          </p>
        </Card>
      </div>
    </div>
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
    <div className="auth-screen premium-auth">
      <div className="auth-art premium-auth-art">
        <div>
          <p className="eyebrow">Start with LOSA247</p>
          <h1>Tạo tài khoản khách hàng</h1>
          <p>Theo dõi giỏ hàng, đơn hàng và các dịch vụ AI Sales Agent đang sử dụng.</p>
        </div>
      </div>

      <div className="auth-form premium-auth-form">
        <Card className="auth-card" variant="borderless">
          <Title level={2}>Đăng ký</Title>
          {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
              <Input size="large" prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email' }]}> 
              <Input size="large" prefix={<MailOutlined />} placeholder="customer@gmail.com" />
            </Form.Item>

            <Form.Item label="Số điện thoại" name="phone">
              <Input size="large" prefix={<PhoneOutlined />} placeholder="0901234567" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true }, { min: 6 }]}> 
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="Tối thiểu 6 ký tự" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" loading={loading} block>
              Tạo tài khoản
            </Button>
          </Form>
        </Card>
      </div>
    </div>
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
      // Backend có thể chưa hỗ trợ endpoint này (xem API_ADDITIONS.md).
      setError(err?.error?.message || 'Không gửi được yêu cầu. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen premium-auth">
      <div className="auth-art premium-auth-art">
        <div>
          <p className="eyebrow">LOSA247 Account</p>
          <h1>Khôi phục quyền truy cập</h1>
          <p>Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.</p>
        </div>
      </div>

      <div className="auth-form premium-auth-form">
        <Card className="auth-card" variant="borderless">
          <Title level={2}>Quên mật khẩu</Title>

          {sent ? (
            <Result
              status="success"
              title="Đã gửi yêu cầu"
              subTitle="Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu."
              extra={<Link className="ant-btn ant-btn-primary" to="/dang-nhap">Về đăng nhập</Link>}
            />
          ) : (
            <>
              <Paragraph type="secondary">Nhập email tài khoản khách hàng của bạn.</Paragraph>
              {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
                >
                  <Input size="large" prefix={<MailOutlined />} placeholder="customer@gmail.com" />
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                  Gửi liên kết đặt lại
                </Button>
              </Form>

              <p style={{ marginTop: 18 }}>
                Nhớ mật khẩu rồi? <Link to="/dang-nhap">Đăng nhập</Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
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
    <div className="auth-screen premium-auth">
      <div className="auth-art premium-auth-art">
        <div>
          <p className="eyebrow">LOSA247 Account</p>
          <h1>Đặt lại mật khẩu mới</h1>
          <p>Tạo mật khẩu mới an toàn để tiếp tục sử dụng dịch vụ.</p>
        </div>
      </div>

      <div className="auth-form premium-auth-form">
        <Card className="auth-card" variant="borderless">
          <Title level={2}>Đặt lại mật khẩu</Title>

          {!token && <Alert type="warning" title="Thiếu mã đặt lại (token). Vui lòng mở liên kết từ email." showIcon style={{ marginBottom: 16 }} />}
          {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Mật khẩu mới"
              name="newPassword"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
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
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Button type="primary" htmlType="submit" size="large" loading={loading} block disabled={!token}>
              Đặt lại mật khẩu
            </Button>
          </Form>

          <p style={{ marginTop: 18 }}>
            <Link to="/dang-nhap">Về đăng nhập</Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
