import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App as AntApp, ConfigProvider } from 'antd'
import 'antd/dist/reset.css'
import './styles/shared/global.css'
import './styles/client/index.css'
import './styles/client/account-page.css'
import './styles/admin/index.css'
import './styles/shared/responsive.css'
import App from './App.jsx'
import { antdTheme } from './styles/shared/antd-theme'
import { I18nProvider } from './i18n/I18nProvider'

// Điểm khởi động ứng dụng: URL trong BrowserRouter là nguồn chuẩn locale client.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <BrowserRouter>
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
)
