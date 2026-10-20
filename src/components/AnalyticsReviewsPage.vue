<template>
  <main ref="rootEl" class="v6-analytics">
    <!-- HERO -->
    <section class="v6an-hero v6-band v6-band-snap">
      <div ref="heroCopyEl" class="v6an-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('analyticsPage.hero.titlePre') }} <em>{{ t('analyticsPage.hero.titleEm') }}</em><b class="v6-dot">.</b></h1>
        <p class="v6an-sub v6-reveal">{{ t('analyticsPage.hero.sub') }}</p>
        <ul class="v6-card-chips v6an-chips v6-reveal">
          <li v-for="c in heroChips" :key="c">{{ c }}</li>
        </ul>
        <div class="v6an-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet v6-magnetic">{{ t('common.cta.allFeatures') }}</RouterLink>
        </div>
      </div>
      <figure class="v6an-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/analysis_f_d_1.webp' : 'Screenshots/opt/analysis_f_l_1.webp')"
          :alt="t('analyticsPage.hero.alt')"
          width="1600" height="1000"
          loading="eager" decoding="async"
        />
        <figcaption>{{ t('analyticsPage.hero.caption') }}</figcaption>
      </figure>
    </section>

    <!-- DASHBOARD -->
    <section id="dashboard" class="v6an-section v6-band v6-band-snap">
      <div class="v6an-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.dashboard.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.dashboard.title') }}</h2>
        <p class="v6an-section-sub v6-reveal">{{ t('analyticsPage.dashboard.sub') }}</p>
        <div class="v6an-rows v6-reveal">
          <div v-for="r in dashboardRows" :key="r.name" class="v6an-row">
            <div>
              <h3>{{ r.name }}</h3>
              <p>{{ r.copy }}</p>
            </div>
            <span class="v6an-row-value">{{ r.value }}</span>
          </div>
        </div>
      </div>
      <figure class="v6an-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/analysis_f_d_2.webp' : 'Screenshots/opt/analysis_f_l_2.webp')"
          :alt="t('analyticsPage.dashboard.alt')"
          width="1600" height="1000"
          loading="lazy" decoding="async"
        />
        <figcaption>{{ t('analyticsPage.dashboard.caption') }}</figcaption>
      </figure>
    </section>

    <!-- ANALYSIS LAB -->
    <section id="analysis" class="v6an-section flip v6-band v6-band-snap">
      <div class="v6an-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.analysis.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.analysis.title') }}</h2>
        <p class="v6an-section-sub v6-reveal">{{ t('analyticsPage.analysis.sub') }}</p>
        <p class="v6an-note v6-reveal">{{ t('analyticsPage.analysis.note') }}</p>
      </div>
      <div class="v6an-rows v6-reveal">
        <div v-for="r in analysisRows" :key="r.name" class="v6an-row">
          <div>
            <h3>{{ r.name }}</h3>
            <p>{{ r.copy }}</p>
          </div>
          <span class="v6an-row-value">{{ r.value }}</span>
        </div>
      </div>
    </section>

    <!-- SLICING / FILTERS -->
    <section id="breakdowns" class="v6an-slice v6-band v6-band-snap">
      <div class="v6an-slice-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.breakdowns.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.breakdowns.title') }}</h2>
        <p class="v6an-section-sub v6-reveal">{{ t('analyticsPage.breakdowns.sub') }}</p>
      </div>
      <ul class="v6an-dimensions v6-reveal" :aria-label="t('analyticsPage.breakdowns.ariaDimensions')">
        <li v-for="d in dimensions" :key="d">{{ d }}</li>
      </ul>
    </section>

    <!-- NUMBERS -->
    <section id="numbers" class="v6an-section flip v6-band v6-band-snap">
      <div class="v6an-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.numbers.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.numbers.title') }}</h2>
        <p class="v6an-section-sub v6-reveal">{{ t('analyticsPage.numbers.sub') }}</p>
        <div class="v6an-rows v6-reveal">
          <div v-for="r in numberRows" :key="r.name" class="v6an-row">
            <div>
              <h3>{{ r.name }}</h3>
              <p>{{ r.copy }}</p>
            </div>
            <span class="v6an-row-value">{{ r.value }}</span>
          </div>
        </div>
      </div>
      <figure class="v6an-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/analysis_f_d_3.webp' : 'Screenshots/opt/analysis_f_l_3.webp')"
          :alt="t('analyticsPage.numbers.alt')"
          width="1600" height="1000"
          loading="lazy" decoding="async"
        />
        <figcaption>{{ t('analyticsPage.numbers.caption') }}</figcaption>
      </figure>
    </section>

    <!-- CALENDAR & REPORTS -->
    <section id="reviews" class="v6an-section v6-band v6-band-snap">
      <div class="v6an-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('analyticsPage.reviews.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.reviews.title') }}</h2>
        <p class="v6an-section-sub v6-reveal">{{ t('analyticsPage.reviews.sub') }}</p>
        <div class="v6an-rows v6-reveal">
          <div v-for="r in reviewRows" :key="r.name" class="v6an-row">
            <div>
              <h3>{{ r.name }}</h3>
              <p>{{ r.copy }}</p>
            </div>
            <span class="v6an-row-value">{{ r.value }}</span>
          </div>
        </div>
      </div>
      <figure class="v6an-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/report_d.webp' : 'Screenshots/opt/report_l.webp')"
          :alt="t('analyticsPage.reviews.alt')"
          width="1600" height="1000"
          loading="lazy" decoding="async"
        />
        <figcaption>{{ t('analyticsPage.reviews.caption') }}</figcaption>
      </figure>
    </section>

    <!-- DISCLAIMER -->
    <section class="v6an-disclaimer">
      <div class="v6an-disclaimer-inner">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('modePages.ui.importantContext') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('analyticsPage.disclaimer.title') }}</h2>
        <div class="v6an-disclaimer-points">
          <p v-for="p in disclaimerPoints" :key="p" class="v6-reveal">{{ p }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6an-cta">
      <h2 class="v6an-cta-title v6-reveal">{{ t('analyticsPage.cta.titlePre') }} <em>{{ t('analyticsPage.cta.titleEm') }}</em><b class="v6-dot">.</b></h2>
      <p class="v6an-cta-sub v6-reveal">{{ t('analyticsPage.cta.sub') }}</p>
      <div class="v6an-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet">{{ t('common.cta.exploreAllFeatures') }} <span aria-hidden="true">→</span></RouterLink>
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
const list = (key) => (tm(key) || []).map(rt)
const rows = (key) => (tm(key) || []).map((r) => ({
  name: rt(r.name), value: r.value !== undefined ? rt(r.value) : undefined, copy: rt(r.copy),
}))

const isDark = inject("isDark")

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`

const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* Every row below is copy — the page keeps no data of its own. */
const heroChips = computed(() => list("analyticsPage.hero.chips"))
const dashboardRows = computed(() => rows("analyticsPage.dashboard.rows"))
const analysisRows = computed(() => rows("analyticsPage.analysis.rows"))
const numberRows = computed(() => rows("analyticsPage.numbers.rows"))
const reviewRows = computed(() => rows("analyticsPage.reviews.rows"))
const disclaimerPoints = computed(() => list("analyticsPage.disclaimer.points"))

/* Global filter-bar dimensions — see Katsumii_overview.md */
const dimensions = computed(() => list("analyticsPage.breakdowns.dimensions"))


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
/* Analytics page layout — shared tokens/chrome live in src/styles/v6.css */
.v6-analytics { position: relative; z-index: 1; }

/* Bands (.v6-band / .v6-band-snap) live in src/styles/v6.css */

/* ── hero ── */
.v6an-hero {
  position: relative;
  /* text column deliberately narrow — the screenshot carries the section */
  grid-template-columns: minmax(300px, 4fr) 8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6an-hero .v6-h1 {
  font-size: clamp(2.1rem, 3.5vw, 3.3rem);
  margin: 1rem 0 1rem;
}
.v6an-sub {
  max-width: 32rem;
  color: var(--v6-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.v6an-chips { margin-top: 1.2rem; }
.v6an-chips li { font-size: 0.62rem; padding: 0.24rem 0.6rem; }
.v6an-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1.7rem;
}

/* ── screenshots ── */
.v6an-shot {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--v6-line-strong);
  background: var(--v6-bg-soft);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8), 0 0 60px -20px var(--v6-line-strong);
}
.v6.light .v6an-shot {
  box-shadow: 0 30px 70px -32px rgba(20, 60, 50, 0.45), 0 0 50px -24px var(--v6-line-strong);
}
.v6an-shot img { display: block; width: 100%; height: auto; }
.v6an-shot figcaption {
  padding: 0.7rem 1.1rem;
  border-top: 1px solid var(--v6-line);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── sections ── */
.v6an-section {
  grid-template-columns: minmax(300px, 5.2fr) 6.8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6an-section.flip > :first-child { order: 2; }
.v6an-section.flip > :last-child { order: 1; }
.v6an-section .v6-h2,
.v6an-slice .v6-h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); }
.v6an-section-sub {
  color: var(--v6-muted);
  margin: 0.9rem 0 0;
  max-width: 33rem;
  font-size: 0.92rem;
  line-height: 1.6;
}
.v6an-note {
  margin: 1.2rem 0 0;
  padding: 0.8rem 1rem;
  border-left: 2px solid var(--v6-ember);
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.55;
  background: linear-gradient(90deg, var(--v6-panel), transparent 80%);
  border-radius: 0 10px 10px 0;
  max-width: 33rem;
}

/* ── metric rows ── */
.v6an-rows {
  margin-top: 1.4rem;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6an-rows {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6an-section.flip .v6an-rows { margin-top: 0; }
.v6an-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem clamp(1rem, 2vw, 1.4rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6an-row:last-child { border-bottom: 0; }
.v6an-row h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.94rem;
  letter-spacing: -0.01em;
  margin: 0;
}
.v6an-row p { color: var(--v6-muted); font-size: 0.83rem; line-height: 1.5; margin: 0.3rem 0 0; }
.v6an-row-value {
  flex: none;
  font-family: var(--v6-mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-gold);
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  white-space: nowrap;
}

/* ── slicing ── */
.v6an-slice { grid-template-rows: auto auto; }
.v6an-slice-head { max-width: 44rem; }
.v6an-slice .v6an-section-sub { max-width: 44rem; }
.v6an-dimensions {
  list-style: none;
  margin: 1.6rem 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}
.v6an-dimensions li {
  padding: 0.5rem 0.95rem;
  border: 1px solid var(--v6-line);
  border-radius: 999px;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-muted);
  background: linear-gradient(165deg, var(--v6-panel), transparent);
}

/* ── disclaimer ── */
.v6an-disclaimer { padding: clamp(3rem, 9vh, 6rem) var(--v6-gutter); }
.v6an-disclaimer-inner { max-width: var(--v6-container); margin: 0 auto; }
.v6an-disclaimer-points {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem;
  margin-top: 2.2rem;
}
.v6an-disclaimer-points p {
  margin: 0;
  padding: 1.2rem 1.3rem;
  border: 1px solid var(--v6-line);
  border-radius: 14px;
  color: var(--v6-muted);
  font-size: 0.92rem;
  background: linear-gradient(165deg, var(--v6-panel), transparent);
}

/* ── cta ── */
.v6an-cta {
  text-align: center;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
}
.v6an-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 1rem;
}
.v6an-cta-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--v6-gold-hi);
}
.v6an-cta-sub { color: var(--v6-muted); margin: 0 0 2.2rem; }
.v6an-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 900px) {
  .v6an-hero { grid-template-columns: 1fr; }
  .v6an-section { grid-template-columns: 1fr; gap: 1.6rem; }
  .v6an-section.flip > :first-child { order: 1; }
  .v6an-section.flip > :last-child { order: 2; }
  .v6an-disclaimer-points { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .v6an-row { flex-wrap: wrap; }
}
@media (max-width: 420px) {
  .v6an-actions,
  .v6an-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6an-actions .v6-quiet,
  .v6an-cta-actions .v6-quiet { justify-content: center; }
}
</style>
