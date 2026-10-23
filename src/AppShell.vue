<template>
  <V6Shell>
    <RouterView />
  </V6Shell>
  <ThemeGlitchOverlay
    v-if="isThemeGlitching"
    :target-theme="nextTheme"
  />
  <ConsentBanner />
</template>

<script setup>
import { computed, defineAsyncComponent, provide, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
const V6Shell = defineAsyncComponent(() => import("./components/v6/V6Shell.vue"))
import ThemeGlitchOverlay from "./components/ThemeGlitchOverlay.vue"
import ConsentBanner from "./components/ConsentBanner.vue"
import { useTheme } from "./composables/useTheme.js"
import { useConsent } from "./composables/useConsent.js"
import { setI18nLocale } from "./i18n.js"
import { buildStructuredGraph } from "./utils/structuredData.js"
import { localizedAlternatesForPath, localizedPathForRoute, normalizeLocale, unlocalizedPathFromRoute } from "./utils/routes.js"

const route = useRoute()
const { locale, t, tm } = useI18n()
const { theme, isDark: themeIsDark, toggleTheme, isThemeGlitching, nextTheme } = useTheme()
const { consent } = useConsent()

const SITE_URL = "https://www.katsumii.com"
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/og-image.png`

const htmlLangForLocale = (lang) => lang === "zht" ? "zh-TW" : lang

/* Pages with route meta forceDark are dark-only for now (the sandbox landing): the visitor's saved
   theme stays untouched and applies again on every other page. Light support stays in the code. */
const isDark = computed(() => !!route.meta.forceDark || themeIsDark.value)
watch(isDark, (dark) => document.documentElement.classList.toggle("dark", dark), { immediate: true })

provide("theme", theme)
provide("isDark", isDark)
provide("toggleTheme", toggleTheme)

const absoluteUrl = (path = "/") => new URL(path, SITE_URL).href

const trackPageView = () => {
  if (consent.value !== "granted") return
  const umami = window.umami
  if (!umami || typeof umami.track !== "function") return
  umami.track()
}

const routeLocale = () => {
  const rawLocale = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return typeof rawLocale === "string" ? rawLocale : null
}

const upsertMeta = (selector, attrs) => {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement("meta")
    if (attrs.name) tag.setAttribute("name", attrs.name)
    if (attrs.property) tag.setAttribute("property", attrs.property)
    document.head.appendChild(tag)
  }

  Object.entries(attrs).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    tag.setAttribute(key, value)
  })
}

const upsertCanonical = (href) => {
  let tag = document.head.querySelector('link[rel="canonical"]')
  if (!tag) {
    tag = document.createElement("link")
    tag.setAttribute("rel", "canonical")
    document.head.appendChild(tag)
  }
  tag.setAttribute("href", href)
}

const upsertAlternateLinks = (path) => {
  document.head.querySelectorAll("link[data-katsumii-hreflang]").forEach((tag) => tag.remove())

  localizedAlternatesForPath(path).forEach((alternate) => {
    const tag = document.createElement("link")
    tag.setAttribute("rel", "alternate")
    tag.setAttribute("hreflang", alternate.hreflang)
    tag.setAttribute("href", absoluteUrl(alternate.path))
    tag.setAttribute("data-katsumii-hreflang", "true")
    document.head.appendChild(tag)
  })

  const defaultTag = document.createElement("link")
  defaultTag.setAttribute("rel", "alternate")
  defaultTag.setAttribute("hreflang", "x-default")
  defaultTag.setAttribute("href", absoluteUrl(localizedPathForRoute(path, "en")))
  defaultTag.setAttribute("data-katsumii-hreflang", "true")
  document.head.appendChild(defaultTag)
}

const upsertJsonLd = (id, payload) => {
  let tag = document.head.querySelector(`#${id}`)
  if (!tag) {
    tag = document.createElement("script")
    tag.id = id
    tag.type = "application/ld+json"
    document.head.appendChild(tag)
  }

  tag.textContent = JSON.stringify(payload)
}

const routeTitle = () => {
  const titleKey = route.meta.titleKey
  return typeof titleKey === "string" ? t(titleKey) : t("common.pageTitles.default")
}

const routeDescription = () => {
  const descriptionKey = route.meta.descriptionKey
  return typeof descriptionKey === "string" ? t(descriptionKey) : t("common.pageDescriptions.default")
}

const buildStructuredData = (title, description, canonicalUrl) => {
  const currentPath = route.meta.canonicalPath || unlocalizedPathFromRoute(route.path)
  return buildStructuredGraph({
    siteUrl: SITE_URL,
    socialImage: DEFAULT_SOCIAL_IMAGE,
    softwareUrl: absoluteUrl(localizedPathForRoute("/app", "en")),
    canonicalUrl,
    lang: htmlLangForLocale(normalizeLocale(routeLocale() || locale.value)),
    title,
    description,
    appDescription: t("common.pageDescriptions.app"),
    isHome: !currentPath || currentPath === "/app",
    tiers: tm("pricingPage.tiers"),
    faqItems: currentPath === "/faq" ? tm("faq.items") : null,
  })
}

watch(
  () => route.params.locale,
  async () => {
    const nextLocale = routeLocale()
    if (!nextLocale) return
    const normalized = normalizeLocale(nextLocale)
    if (locale.value !== normalized) {
      await setI18nLocale(normalized)
      localStorage.setItem("katsumii-locale", normalized)
    }
  },
  { immediate: true },
)

watch(
  [() => route.fullPath, locale],
  () => {
    const title = routeTitle()
    const description = routeDescription()
    const currentLocale = normalizeLocale(routeLocale() || locale.value)
    const canonicalPath = route.meta.canonicalPath || unlocalizedPathFromRoute(route.path) || "/app"
    const canonicalUrl = absoluteUrl(localizedPathForRoute(canonicalPath, currentLocale))
    const robots = route.meta.robots || "index, follow"
    const lang = htmlLangForLocale(currentLocale)

    document.title = title
    upsertCanonical(canonicalUrl)
    upsertAlternateLinks(canonicalPath)

    upsertMeta('meta[name="description"]', { name: "description", content: description })
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots })
    upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: "Katsumii" })
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" })
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title })
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description })
    upsertMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl })
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: DEFAULT_SOCIAL_IMAGE })
    upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: lang.replace("-", "_") })
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" })
    upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title })
    upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description })
    upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: DEFAULT_SOCIAL_IMAGE })

    upsertJsonLd("katsumii-structured-data", buildStructuredData(title, description, canonicalUrl))

    trackPageView()
  },
  { immediate: true },
)

watch(
  locale,
  (lang) => {
    document.documentElement.lang = htmlLangForLocale(lang)
  },
  { immediate: true },
)
</script>
