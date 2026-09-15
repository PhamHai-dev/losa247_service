import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, CheckCircle2, LockKeyhole, Mail, Phone, Save, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useI18n } from '../../hooks/useI18n'
import { PageSeo } from '../../components/seo/PageSeo'

const PHONE_PATTERN = /^[0-9+().\s-]{8,32}$/

export function AccountPage() {
  const { user, updateProfile, profileLoading, profileError } = useAuthStore()
  const { locale, t, localizedPath } = useI18n()
  const location = useLocation()
  const en = locale === 'en'
  const [form, setForm] = useState({ name: '', phone: '' })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setForm({ name: user?.name || '', phone: user?.phone || '' })
    setErrors({})
    setNotice('')
  }, [user?.id, user?.name, user?.phone])

  const isDirty = useMemo(() => {
    if (!user) return false
    return form.name.trim() !== (user.name || '').trim() || form.phone.trim() !== (user.phone || '').trim()
  }, [form, user])

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setNotice('')
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = t('account.nameRequired')
    else if (form.name.trim().length < 2) next.name = t('account.nameMin')
    if (form.phone.trim() && !PHONE_PATTERN.test(form.phone.trim())) next.phone = t('account.phoneInvalid')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    if (!isDirty) {
      setNotice(t('account.noChanges'))
      return
    }
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() })
      setNotice(t('account.saved'))
    } catch {
      setNotice('')
    }
  }

  return (
    <main className="account-page">
      <PageSeo title={t('account.title')} description={en ? 'Manage your Losa247 customer profile and contact information.' : 'Quản lý hồ sơ và thông tin liên hệ tài khoản Losa247.'} />
      <div className="account-page__glow account-page__glow--one" aria-hidden="true" />
      <div className="account-page__glow account-page__glow--two" aria-hidden="true" />
      <div className="container account-shell">
        {user ? (
          <>
            <header className="account-hero">
              <div className="account-hero__copy">
                <span className="account-eyebrow"><Sparkles size={15} /> {t('account.eyebrow')}</span>
                <h1>{t('account.title')}</h1>
                <p>{t('account.subtitle')}</p>
              </div>
              <div className="account-status" role="status">
                <span className="account-status__icon"><CheckCircle2 size={21} /></span>
                <span><strong>{t('account.status')}</strong><small>{t('account.member')}</small></span>
              </div>
            </header>

            <section className="account-grid" aria-label={t('account.profileTitle')}>
              <aside className="account-summary">
                <div className="account-summary__mark" aria-hidden="true"><UserRound size={26} /></div>
                <div><span>{t('account.member')}</span><h2>{user.name}</h2><p>{user.email}</p></div>
                <div className="account-summary__secure"><ShieldCheck size={18} /><span>{t('account.secure')}</span></div>
                <ul className="account-summary__details">
                  <li><Mail size={17} /><span>{user.email}</span></li>
                  <li><Phone size={17} /><span>{user.phone || t('account.phoneOptional')}</span></li>
                </ul>
              </aside>

              <section className="account-card">
                <div className="account-card__heading">
                  <span className="account-card__icon"><UserRound size={22} /></span>
                  <div><h2>{t('account.profileTitle')}</h2><p>{t('account.profileDescription')}</p></div>
                </div>
                <form id="account-profile-form" className="account-form" onSubmit={submit} noValidate>
                  <div className="account-field">
                    <label htmlFor="account-full-name">{t('account.fullName')}</label>
                    <div className={`account-input ${errors.name ? 'account-input--error' : ''}`}><UserRound size={19} /><input id="account-full-name" value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder={t('account.fullNamePlaceholder')} maxLength={255} autoComplete="name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'account-name-error' : undefined} /></div>
                    {errors.name && <span id="account-name-error" className="account-field__error">{errors.name}</span>}
                  </div>
                  <div className="account-field">
                    <label htmlFor="account-email">{t('account.email')}</label>
                    <div className="account-input account-input--locked"><Mail size={19} /><input id="account-email" value={user.email} disabled readOnly /><LockKeyhole size={17} /></div>
                    <span className="account-field__hint"><LockKeyhole size={13} /> {t('account.emailHint')}</span>
                  </div>
                  <div className="account-field">
                    <label htmlFor="account-phone">{t('account.phone')} <em>{t('account.phoneOptional')}</em></label>
                    <div className={`account-input ${errors.phone ? 'account-input--error' : ''}`}><Phone size={19} /><input id="account-phone" value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder={t('account.phonePlaceholder')} maxLength={32} autoComplete="tel" inputMode="tel" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'account-phone-error' : undefined} /></div>
                    {errors.phone && <span id="account-phone-error" className="account-field__error">{errors.phone}</span>}
                  </div>
                  <div className="account-form__footer">
                    <div className="account-feedback" aria-live="polite">
                      {profileError && <span className="account-feedback--error">{profileError}</span>}
                      {!profileError && notice && <span><Check size={16} /> {notice}</span>}
                    </div>
                    <button id="account-save-button" className="account-save" type="submit" disabled={profileLoading || !isDirty}>
                      <Save size={18} /> {profileLoading ? t('account.saving') : t('account.save')}
                    </button>
                  </div>
                </form>
              </section>
            </section>
          </>
        ) : (
          <section className="account-empty">
            <span className="account-empty__icon"><LockKeyhole size={30} /></span>
            <h1>{t('account.loginRequired')}</h1>
            <p>{t('account.loginDescription')}</p>
            <Link id="account-login-link" className="account-save" to={localizedPath('/dang-nhap')} state={{ returnTo: `${location.pathname}${location.search}${location.hash}` }}>{t('navigation.login')}</Link>
          </section>
        )}
      </div>
    </main>
  )
}
