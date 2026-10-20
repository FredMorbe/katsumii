<template>
  <main ref="rootEl" class="v6-features">
    <!-- HERO -->
    <section class="v6ft-hero v6-band v6-band-snap">
      <div ref="heroCopyEl" class="v6ft-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('featuresPage.hero.label') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ featureHeadline }}<b class="v6-dot">.</b></h1>
        <p class="v6ft-sub v6-reveal">{{ t('featuresPage.hero.description') }}</p>
        <ul class="v6-card-chips v6ft-chips v6-reveal">
          <li v-for="tag in heroTags" :key="tag">{{ tag }}</li>
        </ul>
        <div class="v6ft-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('featuresPage.footerCta.primary') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/manual`" class="v6-quiet v6-magnetic">{{ t('featuresPage.footerCta.secondary') }}</RouterLink>
        </div>
      </div>
      <figure class="v6ft-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/hero_d.webp' : 'Screenshots/opt/hero_l.webp')"
          :alt="t('featuresPage.alts.hero')"
          width="1600" height="1000"
          loading="eager" decoding="async"
        />
        <figcaption>{{ t('featuresPage.hero.windowLabel') }}</figcaption>
      </figure>
    </section>

    <!-- MODULES -->
    <section class="v6ft-modules v6-band v6-band-snap" :aria-label="t('featuresPage.nav.modules')">
      <article v-for="(m, i) in modules" :key="m.title" class="v6-card v6ft-module v6-reveal">
        <p class="v6ft-module-head">
          <span class="v6ft-idx">{{ pad(i + 1) }}</span>
          <span class="v6ft-kicker" :style="m.accent ? { color: isDark ? m.accent.dark : m.accent.light } : null">{{ m.kicker }}</span>
        </p>
        <h2>{{ m.title }}</h2>
        <p class="v6ft-benefit">{{ m.benefit }}</p>
        <ul>
          <li v-for="point in m.points" :key="point">{{ point }}</li>
        </ul>
        <RouterLink v-if="m.path" :to="`/${lang}/journal/${m.path}`" class="v6ft-module-link">
          {{ t('featuresPage.cardLink') }} <span aria-hidden="true">→</span>
        </RouterLink>
      </article>
    </section>

    <!-- COCKPIT INDEX -->
    <section class="v6ft-cockpit v6-band v6-band-snap">
      <div class="v6ft-cockpit-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('featuresPage.cockpit.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('featuresPage.cockpit.title') }}</h2>
      </div>
      <div class="v6ft-screens v6-reveal">
        <div v-for="s in cockpitScreens" :key="s.name">
          <b>{{ s.name }}</b>
          <span>{{ s.desc }}</span>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6ft-cta">
      <p class="v6-eyebrow v6-reveal" style="justify-content: center"><i></i>{{ t('featuresPage.footerCta.label') }}</p>
      <h2 class="v6ft-cta-title v6-reveal">{{ t('featuresPage.footerCta.headline') }}</h2>
      <p class="v6ft-cta-sub v6-reveal">{{ t('featuresPage.footerCta.description') }}</p>
      <div class="v6ft-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('featuresPage.footerCta.primary') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/manual`" class="v6-quiet">{{ t('featuresPage.footerCta.secondary') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"

const { t, tm, rt } = useI18n()
const isDark = inject("isDark")

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`
const pad = (n) => String(n).padStart(2, "0")
const stripTerminalDot = (value) => String(value ?? "").replace(/[.。]\s*$/, "")

const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* deep-dive routes + discipline accents per module position (mirrors V6_ACCENTS).
   The first four must stay in the order Funded → Challenge → Personal → Backtest,
   because the cards are numbered on screen and those numbers are also the
   "Discipline 0X" labels on the mode pages, the landing and the nav.
   Journaling and Imports both resolve to /workflow — that page covers
   "imports, journal & tools" as one workflow. */
const MODULE_META = [
  { path: "funded-accounts",      accent: { dark: "#22d3ee", light: "#0369a1" } },
  { path: "prop-firm-challenges", accent: { dark: "#facc15", light: "#ab7503" } },
  { path: "personal-trading",     accent: { dark: "#4ade80", light: "#047857" } },
  { path: "backtesting",          accent: { dark: "#818cf8", light: "#6d28d9" } },
  { path: "analytics-reviews" },
  { path: "workflow" },
  { path: "workflow" },
  { path: "local-offline" },
]

/* primary app screens — see Katsumii_overview.md. The names are the app's own
   navigation labels and stay in English; only the descriptions translate. */
const COCKPIT_NAMES = [
  "Today", "Dashboard", "Accounts", "Trades", "Calendar", "Analysis",
  "Journal", "Sessions", "Imports", "Reports", "Tools", "Managers",
]
const cockpitScreens = computed(() =>
  COCKPIT_NAMES.map((name, i) => ({ name, desc: (tm("featuresPage.cockpit.screens") || []).map(rt)[i] }))
)

const heroTags = computed(() => {
  const raw = tm("featuresPage.hero.tags")
  return Array.isArray(raw) ? raw : []
})

const featureHeadline = computed(() => stripTerminalDot(t("featuresPage.hero.headline")))

const modules = computed(() => {
  const raw = tm("featuresPage.modules")
  if (!Array.isArray(raw)) return []
  return raw.map((m, i) => ({ ...m, ...MODULE_META[i] }))
})

const v6Quiet = inject("v6Quiet")
const rootEl = ref(null)
const heroCopyEl = ref(null)
let cleanups = []

onMounted(() => {
  cleanups.push(initV6Reveals(rootEl.value))
  cleanups.push(initMagnetic(rootEl.value))

  /* the particle river thins out behind the hero copy — see v6Quiet in V6Shell */
  v6Quiet?.set(heroCopyEl.value)
  cleanups.push(() => v6Quiet?.clear())

  /* full-viewport bands snap while this page is mounted — see v6.css */
  document.documentElement.classList.add("v6-snap")
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove("v6-snap")
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
/* Feature hub layout — shared tokens/chrome live in src/styles/v6.css */
.v6-features { position: relative; z-index: 1; }

/* Bands (.v6-band / .v6-band-snap) live in src/styles/v6.css */

/* ── hero ── */
.v6ft-hero {
  position: relative;
  /* text column deliberately narrow — the screenshot carries the section */
  grid-template-columns: minmax(300px, 4fr) 8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6ft-hero .v6-h1 {
  font-size: clamp(2.1rem, 3.5vw, 3.3rem);
  margin: 1rem 0 1rem;
}
.v6ft-sub {
  max-width: 32rem;
  color: var(--v6-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.v6ft-chips { margin-top: 1.2rem; }
.v6ft-chips li { font-size: 0.62rem; padding: 0.24rem 0.6rem; }
.v6ft-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1.7rem;
}
.v6ft-shot {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--v6-line-strong);
  background: var(--v6-bg-soft);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8), 0 0 60px -20px var(--v6-line-strong);
}
.v6.light .v6ft-shot {
  box-shadow: 0 30px 70px -32px rgba(20, 60, 50, 0.45), 0 0 50px -24px var(--v6-line-strong);
}
.v6ft-shot img { display: block; width: 100%; height: auto; }
.v6ft-shot figcaption {
  padding: 0.7rem 1.1rem;
  border-top: 1px solid var(--v6-line);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── modules ──
   Eight cards read as two rows of four rather than four rows of two, which is
   what lets the whole set land inside one band. */
.v6ft-modules {
  grid-template-columns: repeat(4, 1fr);
  gap: 0.9rem;
}
.v6ft-module { display: flex; flex-direction: column; padding: 1.2rem 1.2rem 1.1rem; }
.v6ft-module-head {
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  margin: 0;
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.v6ft-idx { color: var(--v6-faint); font-variant-numeric: tabular-nums; }
.v6ft-kicker { color: var(--v6-gold); }
.v6ft-module h2 {
  margin: 0.6rem 0 0.4rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.015em;
  color: var(--v6-ink);
}
.v6ft-benefit { color: var(--v6-muted); font-size: 0.84rem; line-height: 1.5; margin: 0 0 0.8rem; }
.v6ft-module ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
}
.v6ft-module ul li {
  position: relative;
  padding-left: 1rem;
  color: var(--v6-muted);
  font-size: 0.8rem;
  line-height: 1.45;
}
.v6ft-module ul li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.58em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--v6-gold);
  opacity: 0.7;
}
.v6ft-module-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.9rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--v6-line);
  text-decoration: none;
  font-family: var(--v6-mono);
  font-size: 0.64rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
  transition: color 0.2s ease;
}
.v6ft-module-link:hover, .v6ft-module-link:focus-visible { color: var(--v6-gold); }

/* ── cockpit index ── */
.v6ft-cockpit { grid-template-rows: auto auto; }
.v6ft-cockpit .v6-h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); }
.v6ft-cockpit-head { max-width: 40rem; margin-bottom: clamp(1.4rem, 3vh, 2rem); }
.v6ft-screens {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6ft-screens {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6ft-screens div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.8rem clamp(1.1rem, 2.2vw, 1.5rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6ft-screens div:nth-child(odd) { border-right: 1px solid var(--v6-line); }
.v6ft-screens div:nth-last-child(-n + 2) { border-bottom: 0; }
.v6ft-screens b {
  font-family: var(--v6-mono);
  font-weight: 500;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.v6ft-screens span { color: var(--v6-muted); font-size: 0.82rem; line-height: 1.45; }

/* ── cta ── */
.v6ft-cta {
  text-align: center;
  padding: clamp(3rem, 9vh, 6rem) var(--v6-gutter) var(--v6-page-bottom);
}
.v6ft-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 1.4rem 0 1rem;
}
.v6ft-cta-sub { color: var(--v6-muted); max-width: 34rem; margin: 0 auto 2.2rem; }
.v6ft-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 1400px) {
  .v6ft-modules { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1100px) {
  .v6ft-modules { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .v6ft-hero { grid-template-columns: 1fr; }
  .v6ft-modules { grid-template-columns: 1fr; }
  .v6ft-screens { grid-template-columns: 1fr; }
  .v6ft-screens div:nth-child(odd) { border-right: 0; }
  .v6ft-screens div:nth-last-child(-n + 2) { border-bottom: 1px solid var(--v6-line); }
  .v6ft-screens div:last-child { border-bottom: 0; }
}
@media (max-width: 420px) {
  .v6ft-actions,
  .v6ft-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6ft-actions .v6-quiet,
  .v6ft-cta-actions .v6-quiet { justify-content: center; }
}
</style>
