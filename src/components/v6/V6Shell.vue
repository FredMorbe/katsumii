<template>
  <div ref="rootEl" class="v6" :class="{ light: !isDark, 'is-studio': isStudio }" :style="accentStyle">
    <canvas ref="glEl" class="v6-gl" :class="{ dim: route.meta.v6DimBg, off: route.meta.v6NoBg }" aria-hidden="true"></canvas>
    <div class="v6-noise" aria-hidden="true"></div>
    <div class="v6-progress" aria-hidden="true"><span ref="progressEl"></span></div>

    <PreviewNoticeModal v-if="isLandingRoute" />
    <V6Lightbox />

    <!-- NAV -->
    <header ref="navEl" class="v6-nav" :class="{ scrolled }">
      <RouterLink class="v6-brand" :to="homePath">
        <img :src="asset('logo.png')" :alt="t('common.alts.logo')" width="32" height="32" />
        <span>Katsumii<b class="v6-dot" aria-hidden="true">.</b></span>
      </RouterLink>

      <nav v-if="isStudio" class="v6-nav-links" :aria-label="t('shell.nav.ariaMain')">
        <RouterLink :to="{ path: homePath, hash: '#apps' }">{{ t('studio.page.nav.apps') }}</RouterLink>
        <RouterLink :to="`/${lang}/contact`">{{ t('studio.page.nav.contact') }}</RouterLink>
      </nav>
      <nav v-else class="v6-nav-links" :aria-label="t('shell.nav.ariaMain')">
        <span class="v6-nav-home-slot" :class="{ 'is-visible': !isLandingRoute }">
          <RouterLink
            :to="`/${lang}/app`"
            :aria-hidden="isLandingRoute"
          :tabindex="isLandingRoute ? -1 : undefined"
          >
            {{ t('shell.nav.home') }}
          </RouterLink>
        </span>
        <div class="v6-nav-drop">
          <RouterLink :to="`/${lang}/features`" aria-haspopup="true">{{ t('shell.nav.features') }}</RouterLink>
          <div class="v6-nav-menu" role="menu" :aria-label="t('shell.nav.ariaFeaturePages')">
            <RouterLink role="menuitem" :to="`/${lang}/features`">
              <span class="v6-nav-menu-idx" aria-hidden="true">00</span>
              <span class="v6-nav-menu-text">
                {{ t('shell.pages.featuresOverview.label') }}
                <small>{{ t('shell.pages.featuresOverview.sub') }}</small>
              </span>
              <svg class="v6-nav-menu-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
                <path d="M2.5 6h7M6.6 3.1 9.5 6l-2.9 2.9" />
              </svg>
            </RouterLink>
            <p class="v6-nav-menu-head" aria-hidden="true">{{ t('shell.nav.groupDisciplines') }}</p>
            <RouterLink
              v-for="(item, index) in FEATURE_PAGES"
              :key="item.path"
              role="menuitem"
              :to="`/${lang}/${item.path}`"
            >
              <span
                class="v6-nav-menu-idx"
                :style="{ color: isDark ? item.dot.dark : item.dot.light }"
                aria-hidden="true"
              >
                0{{ index + 1 }}
              </span>
              <span class="v6-nav-menu-text">
                {{ t(`shell.pages.${item.key}.label`) }}
                <small>{{ t(`shell.pages.${item.key}.sub`) }}</small>
              </span>
              <svg class="v6-nav-menu-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
                <path d="M2.5 6h7M6.6 3.1 9.5 6l-2.9 2.9" />
              </svg>
            </RouterLink>
            <p class="v6-nav-menu-head" aria-hidden="true">{{ t('shell.nav.groupDeeper') }}</p>
            <RouterLink
              v-for="(item, index) in DEEPER_PAGES"
              :key="item.path"
              role="menuitem"
              :to="`/${lang}/${item.path}`"
            >
              <span class="v6-nav-menu-idx" aria-hidden="true">0{{ index + 5 }}</span>
              <span class="v6-nav-menu-text">
                {{ t(`shell.pages.${item.key}.label`) }}
                <small>{{ t(`shell.pages.${item.key}.sub`) }}</small>
              </span>
              <svg class="v6-nav-menu-arrow" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
                <path d="M2.5 6h7M6.6 3.1 9.5 6l-2.9 2.9" />
              </svg>
            </RouterLink>
          </div>
        </div>
        <RouterLink :to="`/${lang}/pricing`">{{ t('shell.nav.pricing') }}</RouterLink>
        <RouterLink :to="`/${lang}/faq`">{{ t('shell.nav.faq') }}</RouterLink>
      </nav>

      <div class="v6-nav-right">
        <V6LangSwitch />
        <button
          v-if="!route.meta.forceDark"
          ref="menuToggleEl"
          type="button"
          class="v6-theme"
          :aria-label="isDark ? t('common.aria.switchToLight') : t('common.aria.switchToDark')"
          @click="toggleTheme"
        >
          <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
            <circle cx="12" cy="12" r="4.4" />
            <path d="M12 2.8v2.2M12 19v2.2M2.8 12h2.2M19 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.4 14.2A8.4 8.4 0 0 1 9.8 3.6a8.4 8.4 0 1 0 10.6 10.6z" />
          </svg>
        </button>
        <span v-if="!isStudio" class="v6-btn v6-btn-sm v6-btn-static" aria-disabled="true">{{ t('shell.comingSoon') }}</span>
        <button
          type="button"
          class="v6-menu-toggle"
          :class="{ active: mobileOpen }"
          :aria-expanded="mobileOpen"
          aria-controls="v6-mobile-menu"
          :aria-label="mobileOpen ? t('common.aria.closeMenu') : t('common.aria.openMenu')"
          @click="mobileOpen = !mobileOpen"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <Transition name="v6-mobile-menu">
      <div v-if="mobileOpen" id="v6-mobile-menu" class="v6-mobile-menu" role="dialog" aria-modal="true" :aria-label="t('shell.mobile.ariaMenu')">
        <button class="v6-mobile-backdrop" type="button" :aria-label="t('common.aria.closeMenu')" @click="mobileOpen = false"></button>
        <nav ref="mobilePanelEl" class="v6-mobile-panel" :aria-label="t('shell.mobile.ariaNav')">
          <p class="v6-mobile-kicker">{{ t('shell.mobile.kicker') }}</p>
          <div v-if="isStudio" class="v6-mobile-nav">
            <RouterLink :to="{ path: homePath, hash: '#apps' }">{{ t('studio.page.nav.apps') }}</RouterLink>
            <RouterLink :to="`/${lang}/contact`">{{ t('studio.page.nav.contact') }}</RouterLink>
          </div>
          <div v-else class="v6-mobile-nav">
            <RouterLink :to="`/${lang}/features`">
              {{ t('shell.nav.features') }}<small>{{ t('shell.mobile.featuresSub') }}</small>
            </RouterLink>

            <div v-for="group in MOBILE_GROUPS" :key="group.key" class="v6-mobile-group">
              <button
                type="button"
                class="v6-mobile-group-head"
                :class="{ open: openGroup === group.key }"
                :aria-expanded="openGroup === group.key"
                :aria-controls="`v6-mobile-group-${group.key}`"
                @click="openGroup = openGroup === group.key ? null : group.key"
              >
                {{ t(group.labelKey) }}
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
                  <path d="M3.1 4.6 6 7.5l2.9-2.9" />
                </svg>
              </button>
              <div
                :id="`v6-mobile-group-${group.key}`"
                class="v6-mobile-sub"
                :class="{ open: openGroup === group.key }"
              >
                <div class="v6-mobile-sub-inner">
                  <RouterLink
                    v-for="item in group.items"
                    :key="item.path"
                    :to="`/${lang}/${item.path}`"
                    :tabindex="openGroup === group.key ? undefined : -1"
                  >
                    {{ t(`shell.pages.${item.key}.label`) }}<small>{{ t(`shell.pages.${item.key}.sub`) }}</small>
                  </RouterLink>
                </div>
              </div>
            </div>

            <RouterLink :to="`/${lang}/pricing`">{{ t('shell.nav.pricing') }}</RouterLink>
            <RouterLink :to="`/${lang}/faq`">{{ t('shell.nav.faq') }}</RouterLink>
          </div>
          <template v-if="!isStudio">
            <span class="v6-btn v6-btn-static" aria-disabled="true">{{ t('shell.comingSoon') }}</span>
            <p class="v6-mobile-note">{{ t('shell.mobile.note') }}</p>
          </template>
        </nav>
      </div>
    </Transition>

    <slot />

    <footer class="v6-footer">
      <div class="v6-footer-cols" :class="{ 'is-studio': isStudio }">
        <div class="v6-footer-brand">
          <RouterLink class="v6-brand v6-footer-brand-link" :to="homePath">
            <img :src="asset('logo.png')" :alt="t('common.alts.logo')" width="28" height="28" />
            <span>Katsumii<b class="v6-dot" aria-hidden="true">.</b></span>
          </RouterLink>
          <a
            class="v6-social"
            :href="INSTAGRAM_URL"
            target="_blank"
            rel="noopener"
            :aria-label="t('shell.footer.ariaInstagram')"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <defs>
                <!-- Instagram brand gradient, corner-to-corner as in the official mark -->
                <linearGradient id="v6-ig" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#FFC107" />
                  <stop offset="28%" stop-color="#F76B1C" />
                  <stop offset="55%" stop-color="#E1306C" />
                  <stop offset="80%" stop-color="#C13584" />
                  <stop offset="100%" stop-color="#5851DB" />
                </linearGradient>
              </defs>
              <rect x="2.6" y="2.6" width="18.8" height="18.8" rx="5.4" stroke="url(#v6-ig)" stroke-width="1.9" />
              <circle cx="12" cy="12" r="4.1" stroke="url(#v6-ig)" stroke-width="1.9" />
              <circle cx="17.5" cy="6.5" r="1.2" fill="url(#v6-ig)" />
            </svg>
            <span>@katsumii.journal</span>
          </a>
        </div>

        <template v-if="isStudio">
          <nav class="v6-footer-col" :aria-label="t('studio.page.footer.apps')">
            <p class="v6-footer-head">{{ t('studio.page.footer.apps') }}</p>
            <RouterLink v-for="p in PRODUCTS" :key="p.key" :to="p.page ? `/${lang}${p.page}` : { path: homePath, hash: `#apps-${p.key}` }">
              {{ t(`products.${p.key}.name`) }}
            </RouterLink>
          </nav>

          <nav class="v6-footer-col" :aria-label="t('studio.page.footer.studio')">
            <p class="v6-footer-head">{{ t('studio.page.footer.studio') }}</p>
            <RouterLink :to="`/${lang}/contact`">{{ t('shell.footer.contact') }}</RouterLink>
            <a :href="INSTAGRAM_URL" target="_blank" rel="noopener">{{ t('shell.footer.instagram') }}</a>
          </nav>
        </template>

        <template v-else>
        <nav class="v6-footer-col" :aria-label="t('shell.footer.product')">
          <p class="v6-footer-head">{{ t('shell.footer.product') }}</p>
          <RouterLink :to="`/${lang}/app`">{{ t('shell.nav.home') }}</RouterLink>
          <RouterLink :to="`/${lang}/pricing`">{{ t('shell.nav.pricing') }}</RouterLink>
          <RouterLink :to="`/${lang}/app#system-requirements`">{{ t('shell.footer.systemRequirements') }}</RouterLink>
          <RouterLink :to="`/${lang}/local-offline`">{{ t('shell.pages.localOffline.label') }}</RouterLink>
        </nav>

        <nav class="v6-footer-col" :aria-label="t('shell.footer.features')">
          <p class="v6-footer-head">{{ t('shell.footer.features') }}</p>
          <RouterLink :to="`/${lang}/features`">{{ t('shell.footer.overview') }}</RouterLink>
          <RouterLink :to="`/${lang}/analytics-reviews`">{{ t('shell.pages.analytics.label') }}</RouterLink>
          <RouterLink :to="`/${lang}/customization`">{{ t('shell.pages.customization.label') }}</RouterLink>
          <RouterLink :to="`/${lang}/workflow`">{{ t('shell.pages.workflow.label') }}</RouterLink>
        </nav>

        <nav class="v6-footer-col" :aria-label="t('shell.footer.disciplines')">
          <p class="v6-footer-head">{{ t('shell.footer.disciplines') }}</p>
          <RouterLink :to="`/${lang}/funded-accounts`">{{ t('shell.pages.funded.label') }}</RouterLink>
          <RouterLink :to="`/${lang}/prop-firm-challenges`">{{ t('shell.pages.challenge.label') }}</RouterLink>
          <RouterLink :to="`/${lang}/personal-trading`">{{ t('shell.pages.personal.label') }}</RouterLink>
          <RouterLink :to="`/${lang}/backtesting`">{{ t('shell.pages.backtest.label') }}</RouterLink>
        </nav>

        <nav class="v6-footer-col" :aria-label="t('shell.footer.support')">
          <p class="v6-footer-head">{{ t('shell.footer.support') }}</p>
          <RouterLink :to="`/${lang}/manual`">{{ t('shell.footer.manual') }}</RouterLink>
          <RouterLink :to="`/${lang}/faq`">{{ t('shell.nav.faq') }}</RouterLink>
          <RouterLink :to="`/${lang}/contact`">{{ t('shell.footer.contact') }}</RouterLink>
          <a :href="INSTAGRAM_URL" target="_blank" rel="noopener">{{ t('shell.footer.instagram') }}</a>
        </nav>
        </template>

        <nav class="v6-footer-col" :aria-label="t('shell.footer.legal')">
          <p class="v6-footer-head">{{ t('shell.footer.legal') }}</p>
          <RouterLink :to="`/${lang}/privacy`">{{ t('shell.footer.privacy') }}</RouterLink>
          <RouterLink :to="`/${lang}/terms`">{{ t('shell.footer.terms') }}</RouterLink>
          <RouterLink :to="`/${lang}/impressum`">{{ t('shell.footer.imprint') }}</RouterLink>
          <RouterLink :to="`/${lang}/security`">{{ t('shell.footer.security') }}</RouterLink>
          <button type="button" @click="openSettings">{{ t('consent.settings') }}</button>
        </nav>
      </div>

      <div class="v6-footer-bottom">
        <p>© {{ year }} Katsumii — {{ isStudio ? t('studio.page.footer.tagline') : t('shell.footer.tagline') }}</p>
        <p class="v6-footer-version">v{{ siteVersion }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { createV6Background } from "../../v6/gl.js"
import { initMagnetic, prefersReducedMotion } from "../../v6/motion.js"
import { normalizeLocale } from "../../utils/routes.js"
import { PRODUCTS } from "../../utils/products.js"
import { useConsent } from "../../composables/useConsent.js"
import PreviewNoticeModal from "./PreviewNoticeModal.vue"
import V6LangSwitch from "./V6LangSwitch.vue"
import V6Lightbox from "./V6Lightbox.vue"
import changelog from "../../../changelog.json"

/* newest changelog entry is the deployed version — see changelog.json */
const siteVersion = changelog[0].version

const { t } = useI18n()
const { openSettings } = useConsent()

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`
const year = new Date().getFullYear()

const INSTAGRAM_URL = "https://instagram.com/katsumii.journal"

/* Nav entries carry only their route and colour — the label and subtitle are
   looked up as shell.pages.<key> so every menu stays translated. */

/* Discipline pages in the Features dropdown — dots mirror V6_ACCENTS in router.js */
const FEATURE_PAGES = [
  { key: "funded", path: "funded-accounts", dot: { dark: "#22d3ee", light: "#0369a1" } },
  { key: "challenge", path: "prop-firm-challenges", dot: { dark: "#facc15", light: "#ab7503" } },
  { key: "personal", path: "personal-trading", dot: { dark: "#4ade80", light: "#047857" } },
  { key: "backtest", path: "backtesting", dot: { dark: "#818cf8", light: "#6d28d9" } },
]

const DEEPER_PAGES = [
  { key: "analytics", path: "analytics-reviews" },
  { key: "customization", path: "customization" },
  { key: "workflow", path: "workflow" },
  { key: "localOffline", path: "local-offline" },
]

/* Mobile menu: same grouping as the desktop dropdown, but collapsible */
const MOBILE_GROUPS = [
  { key: "disciplines", labelKey: "shell.nav.groupDisciplines", items: FEATURE_PAGES },
  { key: "deeper", labelKey: "shell.nav.groupDeeper", items: DEEPER_PAGES },
]

const route = useRoute()
const isDark = inject("isDark")
const toggleTheme = inject("toggleTheme")
const isLandingRoute = computed(() => route.meta.canonicalPath === "/app")
/* the developer-site pages (route meta studio) swap the journal's nav and footer for the studio's */
const isStudio = computed(() => !!route.meta.studio)

const rootEl = ref(null)
const glEl = ref(null)
const navEl = ref(null)
const progressEl = ref(null)
const menuToggleEl = ref(null)
const mobilePanelEl = ref(null)
const scrolled = ref(false)
const mobileOpen = ref(false)
const openGroup = ref(null)
let glApi = null
let cleanups = []

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})
const homePath = computed(() => `/${lang.value}${isStudio.value ? "/sandbox" : "/app"}`)

/* Route meta sets the page tint; pages can override live. */
const DEFAULT_ACCENT = {
  dark: ["#22d3ee", "#67e8f9"],
  light: ["#0369a1", "#075985"],
}
const accentOverride = ref(null)

const hexToRgba = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`
}

const accent = computed(() => {
  const pair = accentOverride.value || route.meta.v6Accent || DEFAULT_ACCENT
  return isDark.value ? pair.dark : pair.light
})

const accentStyle = computed(() => ({
  "--v6-gold": accent.value[0],
  "--v6-gold-hi": accent.value[1],
  "--v6-line-strong": hexToRgba(accent.value[0], isDark.value ? 0.3 : 0.4),
}))

provide("v6Accent", {
  set: (pair) => { accentOverride.value = pair },
  clear: () => { accentOverride.value = null },
})

/* ── background quiet zone ──────────────────────────────────────
   Readability over the particle river is solved in the river, not on top of
   it: pages hand us the elements holding their copy, we measure the real text
   box and the shader thins the stream out there. Dimming the page instead
   always left a visible scrim edge once the copy went near-full-width. */
const QUIET_PAD_X = 26
const QUIET_PAD_Y = 20
let quietEls = []
let quietRight = 0
let quietActive = false
let quietSettleTimers = []

/* tight bounds of an element's inline content — a Range hugs the line boxes,
   so a left-aligned headline doesn't claim its whole block width */
const contentRect = (el) => {
  const range = document.createRange()
  range.selectNodeContents(el)
  const r = range.getBoundingClientRect()
  return r.width > 0 && r.height > 0 ? r : el.getBoundingClientRect()
}

/* only clears when a zone is actually set — setQuiet repaints the still frame
   under reduced motion, so a no-op call per scroll event would be costly */
const clearQuiet = () => {
  quietSettleTimers.forEach(clearTimeout)
  quietSettleTimers = []
  if (!quietActive) return
  glApi?.setQuiet(null)
  quietActive = false
}

const measureQuiet = () => {
  if (!glApi) return
  const live = quietEls.filter((el) => el?.isConnected)
  if (!live.length || window.scrollY > window.innerHeight * 1.5) {
    clearQuiet()
    return
  }

  let left = Infinity
  let right = -Infinity
  let top = Infinity
  let bottom = -Infinity
  for (const el of live) {
    const r = contentRect(el)
    if (!r.width || !r.height) continue
    left = Math.min(left, r.left)
    right = Math.max(right, r.right)
    top = Math.min(top, r.top)
    bottom = Math.max(bottom, r.bottom)
  }
  if (left === Infinity) {
    clearQuiet()
    return
  }

  /* the landing headline types itself in and out — hold the widest edge seen
     so the zone settles instead of breathing with every character */
  quietRight = Math.max(quietRight, right)

  const w = window.innerWidth
  const h = window.innerHeight
  const x0 = left - QUIET_PAD_X
  const x1 = quietRight + QUIET_PAD_X
  const y0 = top - QUIET_PAD_Y
  const y1 = bottom + QUIET_PAD_Y
  glApi.setQuiet({
    x: ((x0 + x1) / 2 / w) * 2 - 1,
    y: -((((y0 + y1) / 2) / h) * 2 - 1),
    halfW: (x1 - x0) / w,
    halfH: (y1 - y0) / h,
  })
  quietActive = true
}

provide("v6Quiet", {
  /* target: a container whose element children hold the copy, or an explicit
     element list when the copy sits deeper (the landing h1 wraps its lines) */
  set: (target) => {
    const list = Array.isArray(target) ? target : [...(target?.children ?? [])]
    clearQuiet()
    quietEls = list.filter(Boolean)
    quietRight = 0
    measureQuiet()
    /* hero copy animates in on most pages — settle the zone once it has landed */
    quietSettleTimers = [400, 1400].map((ms) => setTimeout(measureQuiet, ms))
  },
  clear: () => {
    quietEls = []
    quietRight = 0
    clearQuiet()
  },
  /* set() always measures once; live refreshes are skipped under reduced
     motion for the same reason as in onScroll */
  refresh: () => { if (!prefersReducedMotion()) measureQuiet() },
})

watch(() => route.path, () => {
  accentOverride.value = null
  mobileOpen.value = false
  quietEls = []
  quietRight = 0
  clearQuiet()
  onScroll()
})
watch(mobileOpen, async (open) => {
  if (!open) openGroup.value = null
  document.documentElement.classList.toggle("v6-menu-open", open)
  await nextTick()
  if (open) mobilePanelEl.value?.querySelector("a")?.focus()
  else menuToggleEl.value?.focus()
})
watch(accent, (value) => glApi?.setAccent(value[0], value[1]))

const onScroll = () => {
  const y = window.scrollY
  scrolled.value = y > 60
  const max = document.documentElement.scrollHeight - window.innerHeight
  if (progressEl.value) {
    progressEl.value.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`
  }
  if (glApi && !prefersReducedMotion()) {
    glApi.setScroll(route.meta.v6DimBg ? 0 : Math.min(1, y / (window.innerHeight * 0.35)) * 0.8)
    /* reduced motion keeps a still frame — leave its zone where it was measured
       instead of repainting the whole scene on every scroll event */
    measureQuiet()
  }
}

const onResize = () => {
  quietRight = 0
  measureQuiet()
}

const onKeydown = (event) => {
  if (event.key === "Escape" && mobileOpen.value) mobileOpen.value = false
  if (event.key !== "Tab" || !mobileOpen.value || !mobilePanelEl.value) return

  /* links inside a collapsed group carry tabindex="-1" and stay out of the cycle */
  const focusable = [...mobilePanelEl.value.querySelectorAll('a[href]:not([tabindex="-1"]), button:not([disabled])')]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  glApi = createV6Background(glEl.value, {
    light: !isDark.value,
    accent: accent.value,
  })
  if (glApi) {
    cleanups.push(glApi.dispose)
    if (prefersReducedMotion()) glApi.setScroll(0.35)
  }

  watch(isDark, (dark) => {
    glApi?.setTheme(!dark)
    const value = accent.value
    glApi?.setAccent(value[0], value[1])
  })

  cleanups.push(initMagnetic(navEl.value))

  window.addEventListener("scroll", onScroll, { passive: true })
  cleanups.push(() => window.removeEventListener("scroll", onScroll))
  window.addEventListener("resize", onResize)
  cleanups.push(() => window.removeEventListener("resize", onResize))
  window.addEventListener("keydown", onKeydown)
  cleanups.push(() => window.removeEventListener("keydown", onKeydown))
  onScroll()
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove("v6-menu-open")
  quietSettleTimers.forEach(clearTimeout)
  quietSettleTimers = []
  cleanups.forEach((off) => off && off())
  cleanups = []
  glApi = null
})
</script>
