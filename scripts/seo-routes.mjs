// Single source of truth for everything SEO derives from the route list:
// vite.config.js (head tags, sitemap, legacy stubs), scripts/prerender.mjs and
// tools/seo-audit.mjs all import from here. URL policy: every canonical URL
// carries a trailing slash — that is the form GitHub Pages serves for the
// prerendered <route>/index.html folders (the slash-less form 301-redirects).

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
export const SITE_URL = "https://www.katsumii.com"
export const SOCIAL_IMAGE = `${SITE_URL}/og-image.png`

export const SUPPORTED_LOCALES = ["en", "de", "zht"]
export const DEFAULT_LOCALE = "en"
export const HREFLANG_BY_LOCALE = { en: "en", de: "de", zht: "zh-TW" }

// Retired locale prefixes / design prototypes that were indexed or linked.
// Mirrors LEGACY_LOCALES in src/utils/routes.js.
export const LEGACY_LOCALE_PREFIXES = { tw: "zht", es: "en" }
export const LEGACY_PROTOTYPE_PATHS = ["/v2", "/v3", "/v4", "/v5", "/v6"]

const localeMessages = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [
    locale,
    JSON.parse(readFileSync(resolve(ROOT, `src/locales/${locale}.json`), "utf8")),
  ]),
)

export const localeText = (locale, key) => {
  const lookup = (messages) => key.split(".").reduce((current, segment) => current?.[segment], messages)
  const value = lookup(localeMessages[locale])
  if (typeof value === "string") return value
  const fallback = lookup(localeMessages[DEFAULT_LOCALE])
  if (typeof fallback === "string") return fallback
  throw new Error(`seo-routes: locale key "${key}" is missing in "${locale}" and in the "${DEFAULT_LOCALE}" fallback`)
}

// `source` is the Vue component that owns the page — its last git change (plus
// the locale file) drives <lastmod>. Keep in sync with src/router.js.
export const staticRouteMeta = [
  { path: "/app", source: "src/components/LandingV6.vue", titleKey: "common.pageTitles.app", descriptionKey: "common.pageDescriptions.app" },
  { path: "/features", source: "src/components/FeaturesPage.vue", titleKey: "common.pageTitles.features", descriptionKey: "common.pageDescriptions.features" },
  { path: "/prop-firm-challenges", source: "src/components/PropFirmChallengesPage.vue", titleKey: "common.pageTitles.propFirmChallenges", descriptionKey: "common.pageDescriptions.propFirmChallenges" },
  { path: "/funded-accounts", source: "src/components/FundedAccountsPage.vue", titleKey: "common.pageTitles.fundedAccounts", descriptionKey: "common.pageDescriptions.fundedAccounts" },
  { path: "/personal-trading", source: "src/components/PersonalTradingPage.vue", titleKey: "common.pageTitles.personalTrading", descriptionKey: "common.pageDescriptions.personalTrading" },
  { path: "/backtesting", source: "src/components/BacktestingPage.vue", titleKey: "common.pageTitles.backtesting", descriptionKey: "common.pageDescriptions.backtesting" },
  { path: "/analytics-reviews", source: "src/components/AnalyticsReviewsPage.vue", titleKey: "common.pageTitles.analyticsReviews", descriptionKey: "common.pageDescriptions.analyticsReviews" },
  { path: "/customization", source: "src/components/CustomizationPage.vue", titleKey: "common.pageTitles.customization", descriptionKey: "common.pageDescriptions.customization" },
  { path: "/workflow", source: "src/components/WorkflowPage.vue", titleKey: "common.pageTitles.workflow", descriptionKey: "common.pageDescriptions.workflow" },
  { path: "/local-offline", source: "src/components/LocalOfflinePage.vue", titleKey: "common.pageTitles.localOffline", descriptionKey: "common.pageDescriptions.localOffline" },
  { path: "/pricing", source: "src/components/PricingPage.vue", titleKey: "common.pageTitles.pricing", descriptionKey: "common.pageDescriptions.pricing" },
  { path: "/manual", source: "src/components/ManualPage.vue", titleKey: "common.pageTitles.manual", descriptionKey: "common.pageDescriptions.manual" },
  { path: "/faq", source: "src/components/FaqPage.vue", titleKey: "common.pageTitles.faq", descriptionKey: "common.pageDescriptions.faq" },
  { path: "/contact", source: "src/components/ContactPage.vue", titleKey: "common.pageTitles.contact", descriptionKey: "common.pageDescriptions.contact" },
  { path: "/impressum", source: "src/components/ImpressumPage.vue", titleKey: "common.pageTitles.impressum", descriptionKey: "common.pageDescriptions.impressum" },
  { path: "/privacy", source: "src/components/PrivacyPage.vue", titleKey: "common.pageTitles.privacy", descriptionKey: "common.pageDescriptions.privacy" },
  { path: "/terms", source: "src/components/TermsPage.vue", titleKey: "common.pageTitles.terms", descriptionKey: "common.pageDescriptions.terms" },
  { path: "/security", source: "src/components/SecurityPage.vue", titleKey: "common.pageTitles.security", descriptionKey: "common.pageDescriptions.security" },
  { path: "/welcome", source: "src/components/WelcomePage.vue", titleKey: "common.pageTitles.welcome", descriptionKey: "common.pageDescriptions.welcome", robots: "noindex, follow" },
  { path: "/bugreport", source: "src/components/BugReportPage.vue", titleKey: "common.pageTitles.bugreport", descriptionKey: "common.pageDescriptions.bugreport", robots: "noindex, follow" },
]

export const indexableRoutes = staticRouteMeta.filter((route) => !route.robots?.includes("noindex"))

// Canonical path/URL of a route in one locale — always with a trailing slash.
export const localizedRoutePath = (route, locale) => `/${locale}${route.path}/`
export const routeUrl = (route, locale) => `${SITE_URL}${localizedRoutePath(route, locale)}`

// ── <lastmod> ───────────────────────────────────────────────────────────────
// A page's lastmod is the newer of (a) the last commit touching its component
// and (b) the last commit touching the locale file it is written in. It needs
// full git history (actions/checkout with fetch-depth: 0) — a shallow clone
// would date every file with the same commit, which is exactly the bug this
// replaces (a hard-coded 2026-07-05 shipped for months).
const gitDateCache = new Map()
export const gitLastChangeDate = (file) => {
  if (gitDateCache.has(file)) return gitDateCache.get(file)
  let date
  try {
    date = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim()
  } catch (err) {
    throw new Error(`seo-routes: cannot read the git date of ${file} — ${err.message}`)
  }
  if (!date) throw new Error(`seo-routes: git has no commit for ${file} — is the checkout shallow or the file untracked?`)
  gitDateCache.set(file, date)
  return date
}

export const routeLastmod = (route, locale) => {
  const dates = [gitLastChangeDate(route.source), gitLastChangeDate(`src/locales/${locale}.json`)]
  return dates.sort().at(-1)
}

export const sitemapXml = () => {
  const urls = indexableRoutes.flatMap((route) =>
    SUPPORTED_LOCALES.map((locale) => {
      const alternates = [
        ...SUPPORTED_LOCALES.map((alt) =>
          `    <xhtml:link rel="alternate" hreflang="${HREFLANG_BY_LOCALE[alt]}" href="${routeUrl(route, alt)}" />`
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${routeUrl(route, DEFAULT_LOCALE)}" />`,
      ].join("\n")

      return [
        "  <url>",
        `    <loc>${routeUrl(route, locale)}</loc>`,
        `    <lastmod>${routeLastmod(route, locale)}</lastmod>`,
        alternates,
        "  </url>",
      ].join("\n")
    })
  ).join("\n")

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls,
    "</urlset>",
    "",
  ].join("\n")
}
