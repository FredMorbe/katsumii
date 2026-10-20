import { createRouter, createWebHistory } from "vue-router"
import { LEGACY_JOURNAL_PAGES, SUPPORTED_LOCALES, journalPathFor, localeFromPath, localizedPathForRoute, preferredLocale, rewriteLegacyLocalePath } from "./utils/routes.js"
import { PRODUCTS, productByKey } from "./utils/products.js"

const FaqPage = () => import("./components/FaqPage.vue")
const ImpressumPage = () => import("./components/ImpressumPage.vue")
const FeaturesPage = () => import("./components/FeaturesPage.vue")
const CustomizationPage = () => import("./components/CustomizationPage.vue")
const WorkflowPage = () => import("./components/WorkflowPage.vue")
const PropFirmChallengesPage = () => import("./components/PropFirmChallengesPage.vue")
const FundedAccountsPage = () => import("./components/FundedAccountsPage.vue")
const PersonalTradingPage = () => import("./components/PersonalTradingPage.vue")
const BacktestingPage = () => import("./components/BacktestingPage.vue")
const AnalyticsReviewsPage = () => import("./components/AnalyticsReviewsPage.vue")
const LocalOfflinePage = () => import("./components/LocalOfflinePage.vue")
const WelcomePage = () => import("./components/WelcomePage.vue")
const ManualPage = () => import("./components/ManualPage.vue")
const PricingPage = () => import("./components/PricingPage.vue")
const PrivacyPage = () => import("./components/PrivacyPage.vue")
const ContactPage = () => import("./components/ContactPage.vue")
const BugReportPage = () => import("./components/BugReportPage.vue")
const TermsPage = () => import("./components/TermsPage.vue")
const SecurityPage = () => import("./components/SecurityPage.vue")
const NotFoundPage = () => import("./components/NotFoundPage.vue")
const LandingV6 = () => import("./components/LandingV6.vue")
const StudioHome = () => import("./components/StudioHome.vue")
const ProductPage = () => import("./components/ProductPage.vue")

const localePattern = SUPPORTED_LOCALES.join("|")

/* V6 discipline accents — mirror the "Four disciplines" stage on the landing */
const V6_ACCENTS = {
  funded:    { dark: ["#22d3ee", "#67e8f9"], light: ["#0369a1", "#075985"] },
  challenge: { dark: ["#facc15", "#fde68a"], light: ["#ab7503", "#8a5e02"] },
  personal:  { dark: ["#4ade80", "#a7f3c0"], light: ["#047857", "#065f46"] },
  backtest:  { dark: ["#818cf8", "#c4b5fd"], light: ["#6d28d9", "#5b21b6"] },
}

const withLocale = (path, component, meta) => ({
  path: `/:locale(${localePattern})${path}`,
  component,
  meta: { ...meta, canonicalPath: path },
})

/* an unlocalized URL (katsumii.com/pricing) picks up the visitor's locale */
const unlocalizedRedirect = (path) => ({
  path,
  redirect: (to) => ({
    path: localizedPathForRoute(path, preferredLocale()),
    query: to.query,
    hash: to.hash,
    replace: true,
  }),
})

/* Journal pages used to live at the site root (/en/features). They now sit under
   /journal; the old locale-prefixed and bare URLs redirect, so bookmarks, the
   desktop app's help links and indexed URLs keep working. */
const legacyJournalRedirects = LEGACY_JOURNAL_PAGES.flatMap((page) => [
  {
    path: `/:locale(${localePattern})/${page}`,
    redirect: (to) => ({ path: `/${to.params.locale}${journalPathFor(page)}`, query: to.query, hash: to.hash, replace: true }),
  },
  {
    path: `/${page}`,
    redirect: (to) => ({ path: localizedPathForRoute(journalPathFor(page), preferredLocale()), query: to.query, hash: to.hash, replace: true }),
  },
])

/* bare /journal, /andromeda, … pick up the visitor's locale */
const unlocalizedProductRedirects = PRODUCTS.map((p) => ({
  path: p.path,
  redirect: (to) => ({ path: localizedPathForRoute(p.path, preferredLocale()), query: to.query, hash: to.hash, replace: true }),
}))

const unlocalizedJournalSubRedirect = {
  path: "/journal/:rest(.+)",
  redirect: (to) => ({ path: localizedPathForRoute(to.path, preferredLocale()), query: to.query, hash: to.hash, replace: true }),
}

const productAccent = (key) => productByKey(key).accent

const journalMeta = (meta) => ({ ...meta, journal: true })

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: () => localizedPathForRoute("/", preferredLocale()) },
    /* the retired /v2–/v6 design prototypes now all point at the studio landing */
    ...["/v2", "/v3", "/v4", "/v5", "/v6"].map((path) => ({
      path,
      redirect: () => localizedPathForRoute("/", preferredLocale()),
    })),
    ...legacyJournalRedirects,
    withLocale("", StudioHome, { titleKey: "common.pageTitles.home", descriptionKey: "common.pageDescriptions.home", canonicalPath: "/" }),
    /* Katsumii Journal — landing plus every sub page under /journal */
    withLocale("/journal",       LandingV6,     journalMeta({ titleKey: "common.pageTitles.app",       descriptionKey: "common.pageDescriptions.app" })),
    withLocale("/journal/features",  FeaturesPage,  journalMeta({ titleKey: "common.pageTitles.features",  descriptionKey: "common.pageDescriptions.features" })),
    withLocale("/journal/prop-firm-challenges", PropFirmChallengesPage, journalMeta({ titleKey: "common.pageTitles.propFirmChallenges", descriptionKey: "common.pageDescriptions.propFirmChallenges", v6Accent: V6_ACCENTS.challenge })),
    withLocale("/journal/funded-accounts", FundedAccountsPage, journalMeta({ titleKey: "common.pageTitles.fundedAccounts", descriptionKey: "common.pageDescriptions.fundedAccounts", v6Accent: V6_ACCENTS.funded })),
    withLocale("/journal/personal-trading", PersonalTradingPage, journalMeta({ titleKey: "common.pageTitles.personalTrading", descriptionKey: "common.pageDescriptions.personalTrading", v6Accent: V6_ACCENTS.personal })),
    withLocale("/journal/backtesting", BacktestingPage, journalMeta({ titleKey: "common.pageTitles.backtesting", descriptionKey: "common.pageDescriptions.backtesting", v6Accent: V6_ACCENTS.backtest })),
    withLocale("/journal/customization", CustomizationPage, journalMeta({ titleKey: "common.pageTitles.customization", descriptionKey: "common.pageDescriptions.customization" })),
    withLocale("/journal/workflow", WorkflowPage, journalMeta({ titleKey: "common.pageTitles.workflow", descriptionKey: "common.pageDescriptions.workflow" })),
    withLocale("/journal/analytics-reviews", AnalyticsReviewsPage, journalMeta({ titleKey: "common.pageTitles.analyticsReviews", descriptionKey: "common.pageDescriptions.analyticsReviews" })),
    withLocale("/journal/local-offline", LocalOfflinePage, journalMeta({ titleKey: "common.pageTitles.localOffline", descriptionKey: "common.pageDescriptions.localOffline", v6DimBg: true })),
    withLocale("/journal/pricing",   PricingPage,   journalMeta({ titleKey: "common.pageTitles.pricing",   descriptionKey: "common.pageDescriptions.pricing", v6DimBg: true })),
    withLocale("/journal/manual",    ManualPage,    journalMeta({ titleKey: "common.pageTitles.manual",    descriptionKey: "common.pageDescriptions.manual", v6NoBg: true })),
    withLocale("/journal/faq",       FaqPage,       journalMeta({ titleKey: "common.pageTitles.faq",       descriptionKey: "common.pageDescriptions.faq", v6DimBg: true })),
    withLocale("/journal/bugreport", BugReportPage, journalMeta({ titleKey: "common.pageTitles.bugreport", descriptionKey: "common.pageDescriptions.bugreport", robots: "noindex, follow", v6DimBg: true })),
    withLocale("/journal/welcome",   WelcomePage,   journalMeta({ titleKey: "common.pageTitles.welcome",   descriptionKey: "common.pageDescriptions.welcome", robots: "noindex, follow", v6DimBg: true })),
    /* the other studio products — one landing page each */
    ...PRODUCTS.filter((p) => p.key !== "journal").map((p) =>
      withLocale(p.path, ProductPage, {
        titleKey: `common.pageTitles.${p.key}`,
        descriptionKey: `common.pageDescriptions.${p.key}`,
        product: p.key,
        v6Accent: productAccent(p.key),
      }),
    ),
    /* studio level — shared by every product */
    withLocale("/contact",   ContactPage,   { titleKey: "common.pageTitles.contact",   descriptionKey: "common.pageDescriptions.contact", v6DimBg: true }),
    withLocale("/impressum", ImpressumPage, { titleKey: "common.pageTitles.impressum", descriptionKey: "common.pageDescriptions.impressum", v6NoBg: true }),
    withLocale("/privacy",   PrivacyPage,   { titleKey: "common.pageTitles.privacy",   descriptionKey: "common.pageDescriptions.privacy", v6NoBg: true }),
    withLocale("/terms",     TermsPage,     { titleKey: "common.pageTitles.terms",     descriptionKey: "common.pageDescriptions.terms", v6NoBg: true }),
    withLocale("/security",  SecurityPage,  { titleKey: "common.pageTitles.security",  descriptionKey: "common.pageDescriptions.security", v6NoBg: true }),
    { path: `/:locale(${localePattern})/:pathMatch(.*)*`, component: NotFoundPage, meta: { titleKey: "common.pageTitles.notFound", descriptionKey: "common.pageDescriptions.notFound", robots: "noindex, follow", v6DimBg: true } },
    ...unlocalizedProductRedirects,
    unlocalizedJournalSubRedirect,
    unlocalizedRedirect("/contact"),
    unlocalizedRedirect("/impressum"),
    unlocalizedRedirect("/privacy"),
    unlocalizedRedirect("/terms"),
    unlocalizedRedirect("/security"),
    { path: "/:pathMatch(.*)*", component: NotFoundPage, meta: { titleKey: "common.pageTitles.notFound", descriptionKey: "common.pageDescriptions.notFound", robots: "noindex, follow", v6DimBg: true } },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: "smooth" }
    return { top: 0 }
  },
})

/* GitHub Pages serves 404.html for unknown paths; it hands the original URL over
   as /app.html?path=… so the SPA can restore the route — see public/404.html */
router.beforeEach((to) => {
  if (to.path === "/app.html") {
    const fallbackPath = Array.isArray(to.query.path) ? to.query.path[0] : to.query.path

    if (fallbackPath && fallbackPath.startsWith("/")) {
      const target = new URL(fallbackPath, window.location.origin)
      const targetPath = rewriteLegacyLocalePath(target.pathname) || target.pathname
      const targetLocale = localeFromPath(targetPath) || preferredLocale()
      return {
        path: localizedPathForRoute(targetPath, targetLocale),
        query: Object.fromEntries(target.searchParams.entries()),
        hash: target.hash,
        replace: true,
      }
    }

    return { path: localizedPathForRoute("/", preferredLocale()), replace: true }
  }

  /* the /tw/… locale prefix was renamed to /zht/… */
  const legacyPath = rewriteLegacyLocalePath(to.path)
  if (legacyPath) {
    return { path: legacyPath, query: to.query, hash: to.hash, replace: true }
  }
})

export default router
