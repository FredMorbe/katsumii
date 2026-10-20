const baseUrl = import.meta.env.BASE_URL

export const SUPPORTED_LOCALES = ["en", "de", "zht"]
export const DEFAULT_LOCALE = "en"

export const HREFLANG_BY_LOCALE = {
  en: "en",
  de: "de",
  zht: "zh-TW",
}

/* Retired locale prefixes that are still indexed or linked from elsewhere:
   /tw/… was renamed to /zht/…, and Spanish was withdrawn — both land on a
   live page instead of a 404. src/locales/es.json is kept for a later revival. */
const LEGACY_LOCALES = { tw: "zht", es: DEFAULT_LOCALE }

export const rewriteLegacyLocalePath = (pathname = "") => {
  const cleanPath = pathname.replace(/^\/+/, "")
  const [segment, ...rest] = cleanPath.split("/")
  const replacement = LEGACY_LOCALES[segment]
  if (!replacement) return null
  return `/${[replacement, ...rest].filter(Boolean).join("/")}`
}

const normalizeBrowserLocale = (lang = "") => {
  const lower = lang.toLowerCase()
  if (lower.startsWith("zh")) return "zht"
  return lower.slice(0, 2)
}

export const normalizeLocale = (locale) =>
  SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE

export const localeFromPath = (pathname = "") => {
  const cleanPath = pathname.replace(/^\/+/, "")
  const [segment] = cleanPath.split("/")
  return SUPPORTED_LOCALES.includes(segment) ? segment : null
}

export const preferredLocale = () => {
  if (typeof window === "undefined") return DEFAULT_LOCALE

  const pathLocale = localeFromPath(window.location.pathname)
  if (pathLocale) return pathLocale

  const savedLocale = window.localStorage.getItem("katsumii-locale")
  const migratedLocale = LEGACY_LOCALES[savedLocale] || savedLocale
  if (SUPPORTED_LOCALES.includes(migratedLocale)) return migratedLocale

  const browserLocale = normalizeBrowserLocale(window.navigator.language)
  return SUPPORTED_LOCALES.includes(browserLocale) ? browserLocale : DEFAULT_LOCALE
}

export const routePath = (path = "", locale = preferredLocale()) => {
  const cleanPath = path.replace(/^\/+/, "")
  const cleanBase = baseUrl.replace(/\/+$/, "")
  const prefix = cleanBase ? `${cleanBase}/` : "/"
  const localizedPath = [normalizeLocale(locale), cleanPath].filter(Boolean).join("/")
  return `${prefix}${localizedPath}`.replace(/\/{2,}/g, "/")
}

/* Katsumii is a studio: the locale root is the studio landing, every product
   lives under its own prefix — /journal, /andromeda, /tidii-cleaner, /cubamii. */
export const JOURNAL_BASE = "/journal"

/* Journal pages that used to sit at the site root (/features, /pricing, …).
   "app" was the Journal landing itself. Old links and bookmarks still resolve. */
export const LEGACY_JOURNAL_PAGES = [
  "app",
  "features",
  "prop-firm-challenges",
  "funded-accounts",
  "personal-trading",
  "backtesting",
  "analytics-reviews",
  "customization",
  "workflow",
  "local-offline",
  "pricing",
  "manual",
  "faq",
  "bugreport",
  "welcome",
]

export const journalPathFor = (legacyPage) =>
  legacyPage === "app" ? JOURNAL_BASE : `${JOURNAL_BASE}/${legacyPage}`

export const pagePath = (page, locale) => {
  if (!page || page === "home") return routePath("", locale)
  if (page === "app") return routePath("journal", locale)
  return routePath(page, locale)
}

export const unlocalizedPathFromRoute = (path = "") => {
  const cleanPath = path.replace(/^\/+/, "")
  const segments = cleanPath.split("/")
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift()
  const rest = segments.join("/")
  return `/${rest}`
}

export const localizedPathForRoute = (path = "/", locale = preferredLocale()) =>
  routePath(unlocalizedPathFromRoute(path), locale)

export const localizedAlternatesForPath = (path = "/") =>
  SUPPORTED_LOCALES.map((locale) => ({
    locale,
    hreflang: HREFLANG_BY_LOCALE[locale],
    path: localizedPathForRoute(path, locale),
  }))

