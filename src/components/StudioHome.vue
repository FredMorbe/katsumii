<template>
  <main ref="rootEl" class="v6-studio">
    <!-- HERO -->
    <section class="v6st-hero">
      <div>
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('studio.hero.titlePre') }} <em>{{ t(view === 'galaxy' ? 'studio.hero.titleEmGalaxy' : 'studio.hero.titleEm') }}</em><b class="v6-dot">.</b></h1>
      </div>
      <div class="v6st-hero-side">
        <p class="v6st-sub v6-reveal">{{ t('studio.hero.sub') }}</p>
        <div class="v6st-viewbar v6-reveal" role="group" :aria-label="t('studio.view.label')">
          <span class="v6-mono v6st-viewlabel" aria-hidden="true">{{ t('studio.view.label') }}</span>
          <button
            v-for="v in VIEWS"
            :key="v"
            type="button"
            class="v6st-viewbtn"
            :class="{ active: view === v }"
            :aria-pressed="view === v"
            @click="setView(v)"
          >
            {{ t(`studio.view.${v}`) }}
          </button>
        </div>
      </div>
    </section>

    <!-- SKY: galaxy or constellation, switchable -->
    <section class="v6st-sky-wrap">
      <!-- the reveal sits on the static wrapper: elements swapped in later never get initV6Reveals -->
      <div class="v6-reveal">
      <StudioGalaxy v-if="view === 'galaxy'" />

      <div v-else class="v6st-chart" :aria-label="t('studio.chart.aria')">
        <!-- graticule + dust: purely decorative -->
        <svg class="v6st-graticule" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="50" cy="50" rx="45" ry="44" />
          <ellipse cx="50" cy="50" rx="29" ry="44" />
          <ellipse cx="50" cy="50" rx="12" ry="44" />
          <line x1="5" y1="50" x2="95" y2="50" />
        </svg>
        <i v-for="(d, i) in dust" :key="i" class="v6st-dust" :style="{ left: d.x + '%', top: d.y + '%', width: d.r + 'px', height: d.r + 'px', animationDelay: d.delay + 's' }" aria-hidden="true"></i>

        <!-- constellation lines: one set per layout (wide chart / vertical chart) -->
        <svg class="v6st-lines v6st-lines-wide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line v-for="(l, i) in lines" :key="'lw' + i" :x1="l.a.x" :y1="l.a.y" :x2="l.b.x" :y2="l.b.y" class="v6st-line" :style="{ animationDelay: 0.5 + i * 0.18 + 's' }" />
          <line v-for="(g, i) in ghostLines" :key="'gw' + i" :x1="g.a.x" :y1="g.a.y" :x2="g.b.x" :y2="g.b.y" class="v6st-line v6st-line-dash" />
        </svg>
        <svg class="v6st-lines v6st-lines-tall" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line v-for="(l, i) in lines" :key="'lt' + i" :x1="l.a.mx" :y1="l.a.my" :x2="l.b.mx" :y2="l.b.my" class="v6st-line" :style="{ animationDelay: 0.5 + i * 0.18 + 's' }" />
          <line v-for="(g, i) in ghostLines" :key="'gt' + i" :x1="g.a.mx" :y1="g.a.my" :x2="g.b.mx" :y2="g.b.my" class="v6st-line v6st-line-dash" />
        </svg>

        <span
          v-for="(g, i) in GHOST_STARS"
          :key="'g' + i"
          class="v6st-ghost"
          :style="{ '--x': g.x + '%', '--y': g.y + '%', '--mx': g.mx + '%', '--my': g.my + '%' }"
          aria-hidden="true"
        ></span>

        <RouterLink
          v-for="(p, i) in PRODUCTS"
          :key="p.key"
          class="v6st-star"
          :to="`/${lang}${p.path}`"
          :style="starStyle(p, i)"
        >
          <i class="v6st-dot" aria-hidden="true"></i>
          <span class="v6st-label">
            <span class="v6-mono v6st-cat">KAT-0{{ i + 1 }} · {{ t(`studio.platform.${p.platform}`) }}</span>
            <b>{{ t(`products.${p.key}.name`) }}</b>
            <em>{{ t(`products.${p.key}.tagline`) }}</em>
          </span>
        </RouterLink>

        <p class="v6st-caption v6-mono" aria-hidden="true">{{ t('studio.chart.caption') }}</p>
        <p class="v6st-legend v6-mono">{{ t('studio.chart.legend') }}</p>
      </div>
      </div>
    </section>

    <!-- APPS -->
    <section class="v6st-apps">
      <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.apps.eyebrow') }}</p>
      <h2 class="v6-h2 v6-reveal">{{ t('studio.apps.titlePre') }} <em>{{ t('studio.apps.titleEm') }}</em><b class="v6-dot">.</b></h2>
      <div class="v6st-grid">
        <RouterLink
          v-for="p in PRODUCTS"
          :key="p.key"
          class="v6-card v6st-card v6-reveal"
          :to="`/${lang}${p.path}`"
          :style="accentVars(p)"
        >
          <p class="v6-mono v6st-card-kicker">{{ t(`studio.platform.${p.platform}`) }} · {{ t(`studio.price.${p.price}`) }}</p>
          <h3>{{ t(`products.${p.key}.name`) }}</h3>
          <p class="v6st-card-tag">{{ t(`products.${p.key}.tagline`) }}</p>
          <p class="v6st-card-copy">{{ t(`products.${p.key}.desc`) }}</p>
          <span class="v6st-card-go">{{ t('studio.apps.open') }} <span aria-hidden="true">→</span></span>
        </RouterLink>
      </div>
    </section>

    <!-- STUDIO -->
    <section class="v6st-about">
      <div class="v6st-about-inner v6-reveal">
        <div>
          <p class="v6-eyebrow"><i></i>{{ t('studio.about.eyebrow') }}</p>
          <h2 class="v6-h2">{{ t('studio.about.titlePre') }} <em>{{ t('studio.about.titleEm') }}</em><b class="v6-dot">.</b></h2>
        </div>
        <div class="v6st-about-side">
          <p>{{ t('studio.about.copy') }}</p>
          <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('studio.about.cta') }} <span aria-hidden="true">→</span></RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import StudioGalaxy from "./StudioGalaxy.vue"
import { normalizeLocale } from "../utils/routes.js"
import { CONSTELLATION_LINES, GHOST_STARS, PRODUCTS, productByKey } from "../utils/products.js"

const { t } = useI18n()
const route = useRoute()
const isDark = inject("isDark")

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const accentOf = (p) => (isDark.value ? p.accent.dark : p.accent.light)
const accentVars = (p) => ({ "--ac": accentOf(p)[0], "--ac-hi": accentOf(p)[1] })
const starStyle = (p, i) => ({
  ...accentVars(p),
  "--x": `${p.star.x}%`,
  "--y": `${p.star.y}%`,
  "--mx": `${p.star.mx}%`,
  "--my": `${p.star.my}%`,
  "--i": i,
})

const lines = CONSTELLATION_LINES.map(([a, b]) => ({ a: productByKey(a).star, b: productByKey(b).star }))
const ghostLines = GHOST_STARS.map((g) => ({
  a: productByKey(g.from).star,
  b: { x: g.x, y: g.y, mx: g.mx, my: g.my },
}))

/* deterministic "dust" so the sky is the same on every render */
const dust = (() => {
  let seed = 7
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  return Array.from({ length: 70 }, () => ({
    x: +(rnd() * 100).toFixed(1),
    y: +(rnd() * 100).toFixed(1),
    r: +(1 + rnd() * 1.6).toFixed(1),
    delay: +(rnd() * 6).toFixed(1),
  }))
})()

/* galaxy is the default; the visitor's choice is remembered */
const VIEWS = ["galaxy", "constellation"]
const VIEW_KEY = "katsumii-sky-view"
const readView = () => {
  try {
    const saved = localStorage.getItem(VIEW_KEY)
    return VIEWS.includes(saved) ? saved : "galaxy"
  } catch {
    return "galaxy"
  }
}
const view = ref(readView())
const setView = (v) => {
  view.value = v
  try { localStorage.setItem(VIEW_KEY, v) } catch { /* private mode — the choice just isn't remembered */ }
}

const rootEl = ref(null)
let cleanups = []

onMounted(() => {
  cleanups.push(initV6Reveals(rootEl.value))
  cleanups.push(initMagnetic(rootEl.value))
})

onBeforeUnmount(() => {
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
.v6-studio { position: relative; z-index: 1; }

/* ── hero ── */
.v6st-hero {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(6.5rem, 14vh, 8.5rem) var(--v6-gutter) 0;
  display: grid;
  grid-template-columns: 1fr minmax(260px, 24rem);
  gap: 1.5rem clamp(2rem, 5vw, 4.5rem);
  align-items: end;
}
.v6st-hero .v6-h1 { margin-top: 1rem; font-size: clamp(2.6rem, 6vw, 5rem); max-width: 14ch; }
.v6st-hero-side { display: grid; gap: 1.2rem; }
.v6st-sub { margin: 0; color: var(--v6-muted); line-height: 1.75; }

/* ── view switch ── */
.v6st-viewbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.v6st-viewlabel { margin-right: 0.4rem; color: var(--v6-faint); }
.v6st-viewbtn {
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--v6-line);
  background: transparent;
  color: var(--v6-muted);
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.v6st-viewbtn:hover { color: var(--v6-gold-hi); border-color: var(--v6-line-strong); }
.v6st-viewbtn.active { background: var(--v6-gold); border-color: var(--v6-gold); color: #031820; }
.v6.light .v6st-viewbtn.active { color: #ecfeff; }

/* ── constellation chart ── */
.v6st-sky-wrap {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(1.2rem, 3vh, 2.2rem) var(--v6-gutter) 0;
}
.v6st-chart {
  position: relative;
  width: 100%;
  aspect-ratio: 1240 / 540;
  background: radial-gradient(ellipse at 50% 50%, color-mix(in srgb, var(--v6-gold) 7%, transparent), transparent 70%);
}
.v6st-graticule, .v6st-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.v6st-graticule ellipse, .v6st-graticule line {
  fill: none;
  stroke: var(--v6-line);
  stroke-width: 1.2;
  vector-effect: non-scaling-stroke;
}
.v6st-dust {
  position: absolute;
  border-radius: 50%;
  background: var(--v6-ink);
  opacity: 0.22;
  pointer-events: none;
  animation: v6st-twinkle 6s ease-in-out infinite;
}
@keyframes v6st-twinkle { 50% { opacity: 0.06; } }

.v6st-line {
  stroke: color-mix(in srgb, var(--v6-gold-hi) 55%, transparent);
  stroke-width: 1.3;
  vector-effect: non-scaling-stroke;
  opacity: 0;
  animation: v6st-fade 1.2s ease forwards;
}
.v6st-line-dash {
  stroke: var(--v6-faint);
  stroke-dasharray: 5 6;
  stroke-width: 1.1;
  animation-delay: 1.4s;
}
@keyframes v6st-fade { to { opacity: 1; } }

.v6st-lines-tall { display: none; }

.v6st-ghost {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 9px;
  height: 9px;
  margin: -4.5px 0 0 -4.5px;
  border: 1px dashed var(--v6-faint);
  border-radius: 50%;
}

/* ── stars ── */
.v6st-star {
  position: absolute;
  left: var(--x);
  top: var(--y);
  display: flex;
  align-items: center;
  gap: 0.9rem;
  transform: translate(-9px, -50%);
  color: var(--v6-ink);
  text-decoration: none;
  opacity: 0;
  animation: v6st-fade 0.9s ease forwards;
  animation-delay: calc(var(--i) * 0.16s + 0.2s);
}
.v6st-dot {
  position: relative;
  flex: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--ac);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--ac) 16%, transparent), 0 0 38px 8px color-mix(in srgb, var(--ac) 55%, transparent);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.v6st-dot::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1px solid var(--ac);
  opacity: 0;
  animation: v6st-ping 3.4s ease-out infinite;
  animation-delay: calc(var(--i) * 0.7s);
}
@keyframes v6st-ping {
  0% { transform: scale(0.8); opacity: 0.7; }
  70%, 100% { transform: scale(2.1); opacity: 0; }
}
.v6st-label { display: grid; gap: 0.1rem; max-width: 15rem; }
.v6st-cat { color: var(--ac); font-size: 0.68rem; letter-spacing: 0.16em; }
.v6st-label b {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.15rem, 2.3vw, 1.7rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
  transition: color 0.3s;
}
.v6st-label em {
  font-family: var(--v6-display);
  font-weight: 700;
  font-style: italic;
  font-size: clamp(0.8rem, 1.2vw, 0.95rem);
  color: var(--ac-hi);
}
.v6st-star:hover .v6st-dot, .v6st-star:focus-visible .v6st-dot { transform: scale(1.35); }
.v6st-star:hover .v6st-label b, .v6st-star:focus-visible .v6st-label b { color: var(--ac-hi); }
.v6st-star:focus-visible { outline: 2px solid var(--ac-hi); outline-offset: 8px; border-radius: 12px; }

.v6st-caption, .v6st-legend {
  position: absolute;
  left: 0;
  margin: 0;
  color: var(--v6-faint);
  font-size: 0.68rem;
}
.v6st-caption { top: 0; }
.v6st-legend { bottom: 0; }

/* ── apps grid ── */
.v6st-apps {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) 0;
}
.v6st-apps .v6-h2 { margin-top: 1rem; }
.v6st-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(0.9rem, 2vw, 1.4rem);
  margin-top: clamp(1.8rem, 4vh, 2.8rem);
}
.v6st-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: clamp(1.3rem, 2.4vw, 1.9rem);
  color: var(--v6-ink);
  text-decoration: none;
}
.v6st-card:hover { border-color: color-mix(in srgb, var(--ac) 45%, transparent); }
.v6st-card-kicker { color: var(--ac); margin: 0; }
.v6st-card h3 {
  margin: 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 2.8vw, 2.1rem);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.v6st-card-tag { margin: 0; font-family: var(--v6-display); font-weight: 700; font-style: italic; color: var(--ac-hi); }
.v6st-card-copy { margin: 0; color: var(--v6-muted); font-size: 0.95rem; max-width: 30rem; }
.v6st-card-go {
  margin-top: auto;
  padding-top: 0.8rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--v6-muted);
  transition: color 0.25s;
}
.v6st-card:hover .v6st-card-go { color: var(--ac-hi); }

/* ── studio band ── */
.v6st-about {
  max-width: var(--v6-container);
  margin: var(--v6-cta-top) auto 0;
  padding: 0 var(--v6-gutter);
}
.v6st-about-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
  padding-block: clamp(2.5rem, 7vh, 4.5rem);
  border-block: 1px solid var(--v6-line);
}
.v6st-about .v6-h2 { margin-top: 1rem; }
.v6st-about-side { display: grid; gap: 1.4rem; justify-items: start; }
.v6st-about-side p { margin: 0; color: var(--v6-muted); max-width: 32rem; }

/* ── responsive ── */
@media (max-width: 900px) {
  .v6st-hero { grid-template-columns: 1fr; }
  .v6st-chart { aspect-ratio: 390 / 720; }
  .v6st-lines-wide { display: none; }
  .v6st-lines-tall { display: block; }
  .v6st-star { left: var(--mx); top: var(--my); gap: 0.7rem; }
  .v6st-ghost { left: var(--mx); top: var(--my); }
  .v6st-label { max-width: 11.5rem; }
  .v6st-grid, .v6st-about-inner { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .v6st-card:hover { transform: none; }
  .v6st-about-side .v6-btn { width: 100%; }
}
@media (prefers-reduced-motion: reduce) {
  .v6st-dust, .v6st-dot::after { animation: none; }
  .v6st-line, .v6st-star { animation: none; opacity: 1; }
}
</style>
