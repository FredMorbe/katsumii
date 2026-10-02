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
  // trailing slash = the canonical URL form (GitHub Pages serves <route>/index.html)
  return `${prefix}${localizedPath}/`.replace(/\/{2,}/g, "/")
}

export const pagePath = (page, locale) => {
  if (!page || page === "home" || page === "app") return routePath("app", locale)
  return routePath(page, locale)
}

export const unlocalizedPathFromRoute = (path = "") => {
  const cleanPath = path.replace(/^\/+|\/+$/g, "")
  const segments = cleanPath.split("/")
  if (SUPPORTED_LOCALES.includes(segments[0])) segments.shift()
  const rest = segments.join("/")
  return `/${rest || "app"}`
}

export const localizedPathForRoute = (path = "/app", locale = preferredLocale()) =>
  routePath(unlocalizedPathFromRoute(path), locale)

export const localizedAlternatesForPath = (path = "/app") =>
  SUPPORTED_LOCALES.map((locale) => ({
    locale,
    hreflang: HREFLANG_BY_LOCALE[locale],
    path: localizedPathForRoute(path, locale),
  }))

