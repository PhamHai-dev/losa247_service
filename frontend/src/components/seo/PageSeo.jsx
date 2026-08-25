import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useI18n } from '../../hooks/useI18n'
import { localizePath } from '../../i18n/locales'

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}
const upsertLink = (selector, attributes) => {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('link')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
}
const absoluteUrl = (path) => new URL(path, window.location.origin).toString()

export function PageSeo({ title, description, image, noIndex = false, alternates }) {
  const { locale, t } = useI18n()
  const location = useLocation()

  useEffect(() => {
    const resolvedTitle = title || t('seo.siteName')
    const resolvedDescription = description || t('seo.defaultDescription')
    const canonical = absoluteUrl(`${location.pathname}${location.search}`)
    const viPath = alternates?.vi?.path || localizePath(location.pathname, 'vi')
    const enPath = alternates?.en?.path || localizePath(location.pathname, 'en')
    document.title = resolvedTitle.includes('Losa247') ? resolvedTitle : `${resolvedTitle} | Losa247`
    upsertMeta('meta[name="description"]', { name: 'description', content: resolvedDescription })
    upsertMeta('meta[name="robots"]', { name: 'robots', content: noIndex ? 'noindex,follow' : 'index,follow' })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: document.title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: resolvedDescription })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
    if (image) upsertMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteUrl(image) })
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonical })
    upsertLink('link[rel="alternate"][hreflang="vi"]', { rel: 'alternate', hreflang: 'vi', href: absoluteUrl(viPath) })
    upsertLink('link[rel="alternate"][hreflang="en"]', { rel: 'alternate', hreflang: 'en', href: absoluteUrl(enPath) })
    upsertLink('link[rel="alternate"][hreflang="x-default"]', { rel: 'alternate', hreflang: 'x-default', href: absoluteUrl(viPath) })
  }, [alternates, description, image, locale, location.pathname, location.search, noIndex, t, title])

  return null
}
