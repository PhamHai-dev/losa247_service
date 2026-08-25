const SUPPORTED_LOCALES = Object.freeze(['vi', 'en']);
const DEFAULT_LOCALE = 'vi';

const normalizeLocale = (value) => {
  const locale = String(value || DEFAULT_LOCALE).trim().toLowerCase();
  return SUPPORTED_LOCALES.includes(locale) ? locale : null;
};

const publicTranslationWhere = (locale, now = new Date()) => ({
  locale,
  OR: [
    { status: 'published' },
    { status: 'scheduled', publishedAt: { lte: now } },
  ],
});

module.exports = { SUPPORTED_LOCALES, DEFAULT_LOCALE, normalizeLocale, publicTranslationWhere };
