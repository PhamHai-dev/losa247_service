export const SUPPORTED_LOCALES = Object.freeze(['vi', 'en'])
export const DEFAULT_LOCALE = 'vi'
export const LOCALE_STORAGE_KEY = 'losa_locale'

export const LOCALE_META = Object.freeze({
  vi: { code: 'vi', htmlLang: 'vi', label: 'VI', intl: 'vi-VN' },
  en: { code: 'en', htmlLang: 'en', label: 'EN', intl: 'en-US' },
})

const STATIC_ROUTE_PAIRS = Object.freeze([
  { vi: '/', en: '/en' },
  { vi: '/giai-phap/chatbot', en: '/en/solutions/chatbot' },
  { vi: '/bang-gia', en: '/en/pricing' },
  { vi: '/blog', en: '/en/blog' },
  { vi: '/dang-nhap', en: '/en/login' },
  { vi: '/dang-ky', en: '/en/register' },
  { vi: '/quen-mat-khau', en: '/en/forgot-password' },
  { vi: '/dat-lai-mat-khau', en: '/en/reset-password' },
  { vi: '/tai-khoan', en: '/en/account' },
])

const DYNAMIC_ROUTE_PAIRS = Object.freeze([
  { vi: /^\/blog\/([^/]+)\/?$/, en: /^\/en\/blog\/([^/]+)\/?$/, viBase: '/blog/', enBase: '/en/blog/' },
  { vi: /^\/tag\/([^/]+)\/?$/, en: /^\/en\/tag\/([^/]+)\/?$/, viBase: '/tag/', enBase: '/en/tag/' },
])

const normalizePathname = (pathname = '/') => {
  const clean = String(pathname || '/').split(/[?#]/)[0].replace(/\/{2,}/g, '/')
  if (clean === '/') return '/'
  return clean.replace(/\/$/, '') || '/'
}

export function localeFromPath(pathname) {
  const path = normalizePathname(pathname)
  return path === '/en' || path.startsWith('/en/') ? 'en' : DEFAULT_LOCALE
}

export function localizePath(pathname, locale, alternatePath) {
  const target = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE
  if (alternatePath) return alternatePath
  const path = normalizePathname(pathname)
  const staticPair = STATIC_ROUTE_PAIRS.find((pair) => pair.vi === path || pair.en === path)
  if (staticPair) return staticPair[target]
  for (const pair of DYNAMIC_ROUTE_PAIRS) {
    const match = path.match(pair.vi) || path.match(pair.en)
    if (match) return `${target === 'en' ? pair.enBase : pair.viBase}${match[1]}`
  }
  if (target === 'en') return path === '/' ? '/en' : path.startsWith('/en') ? path : `/en${path}`
  return path === '/en' ? '/' : path.startsWith('/en/') ? path.slice(3) || '/' : path
}

export function localizedHref(path, locale) {
  if (!path || /^(?:[a-z]+:|#|\/\/)/i.test(path)) return path
  const [pathnameAndQuery, hash = ''] = String(path).split('#')
  const [pathname, query = ''] = pathnameAndQuery.split('?')
  const localized = localizePath(pathname, locale)
  return `${localized}${query ? `?${query}` : ''}${hash ? `#${hash}` : ''}`
}

export function withLocationSuffix(pathname, location) {
  return `${pathname}${location?.search || ''}${location?.hash || ''}`
}
