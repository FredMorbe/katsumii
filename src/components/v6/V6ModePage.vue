<template>
  <main ref="rootEl" class="v6-mode-page">
    <!-- HERO -->
    <section class="v6m-hero">
      <div ref="heroCopyEl" class="v6m-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t(`${ns}.eyebrow`) }}</p>
        <h1 class="v6-h1 v6-reveal">
          {{ t(`${ns}.h1.pre`) }} <em>{{ t(`${ns}.h1.em`) }}</em><b class="v6-dot">.</b>
        </h1>
        <p class="v6m-hero-sub v6-reveal">{{ t(`${ns}.sub`) }}</p>
        <ul class="v6-card-chips v6m-hero-chips v6-reveal">
          <li v-for="c in chips" :key="c">{{ c }}</li>
        </ul>
        <div class="v6m-hero-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet v6-magnetic">{{ t('common.cta.allFeatures') }}</RouterLink>
        </div>
      </div>
    </section>

    <!-- METRICS -->
    <section class="v6m-metrics" :aria-label="t('modePages.ui.ariaMetrics')">
      <article v-for="m in metrics" :key="m.label" class="v6-card v6-reveal">
        <p class="v6m-metric-label">{{ m.label }}</p>
        <div class="v6m-metric-row">
          <span class="v6m-metric-val">{{ m.value }}</span>
          <span class="v6m-status">{{ t(`modePages.ui.status.${m.status}`) }}</span>
        </div>
        <span class="v6m-bar" role="presentation"><i :style="{ width: m.progress }"></i></span>
        <p>{{ m.copy }}</p>
      </article>
    </section>

    <!-- SECTIONS -->
    <section
      v-for="(s, idx) in sections" :id="s.id" :key="s.id"
      class="v6m-section" :class="{ flip: idx % 2 === 1 }"
    >
      <div class="v6m-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ s.kicker }}</p>
        <h2 class="v6-h2 v6-reveal">{{ s.title }}</h2>
        <p class="v6m-section-sub v6-reveal">{{ s.copy }}</p>
      </div>
      <div class="v6m-rows v6-reveal">
        <div v-for="r in s.rows" :key="r.name" class="v6m-row">
          <div class="v6m-row-head">
            <h3>{{ r.name }}</h3>
            <span class="v6m-status">{{ t(`modePages.ui.status.${r.status}`) }}</span>
          </div>
          <p>{{ r.copy }}</p>
          <div class="v6m-row-meter">
            <span class="v6m-row-val">{{ r.value }}</span>
            <span class="v6m-bar" role="presentation"><i :style="{ width: r.progress }"></i></span>
            <span class="v6m-row-pct">{{ r.progress }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- DISCLAIMER -->
    <section class="v6m-disclaimer">
      <div class="v6m-disclaimer-inner">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('modePages.ui.importantContext') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t(`${ns}.disclaimer.headline`) }}</h2>
        <div class="v6m-disclaimer-points">
          <p v-for="p in disclaimerPoints" :key="p" class="v6-reveal">{{ p }}</p>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6m-cta">
      <h2 class="v6m-cta-title v6-reveal">{{ t(`${ns}.cta.title`) }} <em>{{ t(`${ns}.cta.em`) }}</em><b class="v6-dot">.</b></h2>
      <p class="v6m-cta-sub v6-reveal">{{ t(`${ns}.cta.sub`) }}</p>
      <div class="v6m-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink v-if="next" :to="`/${lang}/journal${next.path}`" class="v6-quiet">
          {{ t('modePages.ui.nextDiscipline', { name: t(`shell.pages.${next.key}.label`) }) }} <span aria-hidden="true">→</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals } from "../../v6/motion.js"
import { normalizeLocale } from "../../utils/routes.js"

/* The page component supplies structure only — which locale block to read, the
   section ids, meter widths and the status key per row. All copy comes from
   modePages.<mode> so the four deep-dives translate as one unit.

   `status` is drawn from one fixed vocabulary across all four mode pages, so the
   pills read as app states rather than as adjectives:
   live (recalculated from your trades) · tracked (counted for you) ·
   manual (you enter it) · context (framing, not a measurement) · archived (kept for later) */
const props = defineProps({
  mode: { type: String, required: true },
  metrics: { type: Array, required: true },
  sections: { type: Array, required: true },
  next: { type: Object, default: null },
})

const { t, tm, rt } = useI18n()
const ns = computed(() => `modePages.${props.mode}`)

const list = (key) => (tm(key) || []).map(rt)
const chips = computed(() => list(`${ns.value}.chips`))
const disclaimerPoints = computed(() => list(`${ns.value}.disclaimer.points`))

/* zip the structural meta with the translated copy, position by position */
const metrics = computed(() => {
  const copy = tm(`${ns.value}.metrics`) || []
  return props.metrics.map((meta, i) => ({
    ...meta,
    label: rt(copy[i]?.label),
    value: rt(copy[i]?.value),
    copy: rt(copy[i]?.copy),
  }))
})

const sections = computed(() => {
  const copy = tm(`${ns.value}.sections`) || []
  return props.sections.map((meta, i) => ({
    id: meta.id,
    kicker: rt(copy[i]?.kicker),
    title: rt(copy[i]?.title),
    copy: rt(copy[i]?.copy),
    rows: meta.rows.map((row, j) => ({
      ...row,
      name: rt(copy[i]?.rows?.[j]?.name),
      value: rt(copy[i]?.rows?.[j]?.value),
      copy: rt(copy[i]?.rows?.[j]?.copy),
    })),
  }))
})

const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
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
})

onBeforeUnmount(() => {
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
/* Mode deep-dive layout — shared tokens/chrome live in src/styles/v6.css */
.v6-mode-page { position: relative; z-index: 1; }

/* ── hero ── */
.v6m-hero {
  position: relative;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) var(--v6-page-hero-bottom);
}
.v6m-hero .v6-h1 { font-size: clamp(2.5rem, 5.4vw, 4.4rem); }
.v6m-hero-sub { max-width: 34rem; color: var(--v6-muted); }
.v6m-hero-chips { margin-top: 1.6rem; }
.v6m-hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 2.2rem;
}

/* ── metrics ── */
.v6m-metrics {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block-compact) var(--v6-gutter) var(--v6-page-hero-bottom);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.1rem;
}
.v6m-metric-label {
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
  margin: 0;
}
.v6m-metric-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.8rem;
  margin: 0.7rem 0 0.9rem;
}
.v6m-metric-val {
  font-family: var(--v6-mono);
  font-size: 1.7rem;
  line-height: 1;
  color: var(--v6-ink);
}
.v6m-status {
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-gold);
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  padding: 0.22rem 0.6rem;
  white-space: nowrap;
}
.v6m-bar {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--v6-line);
  overflow: hidden;
}
.v6m-bar i {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, var(--v6-gold), var(--v6-gold-hi));
}
.v6m-metrics .v6-card > p:last-child { margin-top: 0.9rem; }

/* ── sections ── */
.v6m-section {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block) var(--v6-gutter);
  display: grid;
  grid-template-columns: minmax(300px, 5fr) 6fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: start;
}
.v6m-section.flip .v6m-section-copy { order: 2; }
.v6m-section.flip .v6m-rows { order: 1; }
.v6m-section-sub { color: var(--v6-muted); margin: 1.2rem 0 0; max-width: 30rem; }
.v6m-rows {
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6m-rows {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6m-row { padding: 1.4rem clamp(1.2rem, 2.4vw, 1.8rem); border-bottom: 1px solid var(--v6-line); }
.v6m-row:last-child { border-bottom: 0; }
.v6m-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
}
.v6m-row-head h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  margin: 0;
}
.v6m-row > p { color: var(--v6-muted); font-size: 0.92rem; margin: 0.5rem 0 0.9rem; }
.v6m-row-meter {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.9rem;
}
.v6m-row-val, .v6m-row-pct {
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6m-row-pct { color: var(--v6-gold); }

/* ── disclaimer ── */
.v6m-disclaimer { padding: clamp(3rem, 9vh, 6rem) var(--v6-gutter); }
.v6m-disclaimer-inner { max-width: var(--v6-container); margin: 0 auto; }
.v6m-disclaimer-points {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem;
  margin-top: 2.2rem;
}
.v6m-disclaimer-points p {
  margin: 0;
  padding: 1.2rem 1.3rem;
  border: 1px solid var(--v6-line);
  border-radius: 14px;
  color: var(--v6-muted);
  font-size: 0.92rem;
  background: linear-gradient(165deg, var(--v6-panel), transparent);
}

/* ── cta ── */
.v6m-cta {
  text-align: center;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
}
.v6m-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 1rem;
}
.v6m-cta-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--v6-gold-hi);
}
.v6m-cta-sub { color: var(--v6-muted); margin: 0 0 2.2rem; }
.v6m-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 1100px) {
  .v6m-metrics { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .v6m-hero { padding-top: 7rem; }
  .v6m-section { grid-template-columns: 1fr; gap: 1.6rem; }
  .v6m-section.flip .v6m-section-copy { order: 1; }
  .v6m-section.flip .v6m-rows { order: 2; }
  .v6m-disclaimer-points { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .v6m-metrics { grid-template-columns: 1fr; }
  .v6m-row { padding: 1.2rem 1.05rem; }
  .v6m-row-head { align-items: flex-start; }
  .v6m-row-meter { grid-template-columns: 1fr auto; }
  .v6m-row-meter .v6m-row-val { grid-column: 1 / -1; }
}
@media (max-width: 420px) {
  .v6m-hero-actions,
  .v6m-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6m-hero-actions .v6-quiet,
  .v6m-cta-actions .v6-quiet { justify-content: center; }
}
</style>
