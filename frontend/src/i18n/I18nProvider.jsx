import { createContext, useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import enUS from 'antd/locale/en_US'
import vi from './messages/vi'
import en from './messages/en'
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, localeFromPath, localizedHref, localizePath, withLocationSuffix } from './locales'

const catalogs = { vi, en }
export const I18nContext = createContext(null)

const readKey = (source, key) => key.split('.').reduce((value, part) => value?.[part], source)
const interpolate = (value, params) => String(value).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`)

export function I18nProvider({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const locale = localeFromPath(location.pathname)

  useEffect(() => {
    document.documentElement.lang = locale
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }, [locale])

  const t = useCallback((key, params = {}) => {
    let value = readKey(catalogs[locale], key)
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] Missing "${key}" for locale "${locale}"`)
      value = readKey(catalogs[DEFAULT_LOCALE], key) ?? key
    }
    return typeof value === 'string' ? interpolate(value, params) : value
  }, [locale])

  const localizedPath = useCallback((path, targetLocale = locale) => localizedHref(path, targetLocale), [locale])
  const switchLocale = useCallback((targetLocale, alternatePath) => {
    const pathname = localizePath(location.pathname, targetLocale, alternatePath)
    navigate(withLocationSuffix(pathname, location), {
      state: { ...location.state, preserveScrollOnLocaleChange: true },
    })
  }, [location, navigate])

  const value = useMemo(() => ({ locale, t, localizedPath, switchLocale }), [locale, localizedPath, switchLocale, t])
  return <I18nContext.Provider value={value}><ConfigProvider locale={locale === 'en' ? enUS : viVN}>{children}</ConfigProvider></I18nContext.Provider>
}
