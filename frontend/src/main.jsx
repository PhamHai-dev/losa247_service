import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntApp, ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import 'antd/dist/reset.css'
import './styles/shared/global.css'
import './styles/client/index.css'
import './styles/admin/index.css'
import './styles/shared/responsive.css'
import App from './App.jsx'
import { antdTheme } from './styles/shared/antd-theme'

// Điểm khởi động ứng dụng React: bọc ConfigProvider theme + locale VN + AntApp (context cho message/notification/modal).
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme} locale={viVN}>
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
