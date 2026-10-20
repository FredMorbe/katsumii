<template>
  <main ref="rootEl" class="v6-custom">
    <!-- HERO -->
    <section class="v6cu-hero v6-band v6-band-snap">
      <div ref="heroCopyEl" class="v6cu-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('customizationPage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('customizationPage.hero.titlePre') }} <em>{{ t('customizationPage.hero.titleEm') }}</em><b class="v6-dot">.</b></h1>
        <p class="v6cu-sub v6-reveal">{{ t('customizationPage.hero.sub') }}</p>
        <ul class="v6-card-chips v6cu-chips v6-reveal">
          <li v-for="c in heroChips" :key="c">{{ c }}</li>
        </ul>
        <div class="v6cu-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet v6-magnetic">{{ t('common.cta.allFeatures') }}</RouterLink>
        </div>
      </div>
      <figure class="v6cu-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/customize_d.webp' : 'Screenshots/opt/customize_l.webp')"
          :alt="t('customizationPage.hero.alt')"
          width="1600" height="1000"
          loading="eager" decoding="async"
        />
        <figcaption>{{ t('customizationPage.hero.caption') }}</figcaption>
      </figure>
    </section>

    <!-- FOCUS / HIDE UI -->
    <section id="focus" class="v6cu-section v6-band v6-band-snap">
      <div class="v6cu-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('customizationPage.focus.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('customizationPage.focus.title') }}</h2>
        <p class="v6cu-section-sub v6-reveal">{{ t('customizationPage.focus.sub') }}</p>
        <div class="v6cu-rows v6-reveal">
          <button
            v-for="c in layoutControls" :key="c.key"
            type="button" class="v6cu-row v6cu-control"
            role="switch" :aria-checked="c.on.value ? 'true' : 'false'"
            @click="c.on.value = !c.on.value"
          >
            <span class="v6cu-row-toggle" :class="{ off: !c.on.value }" aria-hidden="true"><i></i></span>
            <span class="v6cu-control-copy">
              <span class="v6cu-control-name">{{ c.name }}</span>
              <span class="v6cu-control-note">{{ c.on.value ? c.onCopy : c.offCopy }}</span>
            </span>
          </button>
        </div>
        <p class="v6cu-control-hint v6-reveal">{{ t('customizationPage.focus.hint') }}</p>
      </div>
      <figure class="v6cu-shot v6-reveal">
        <img
          v-zoom
          :src="asset(layoutShot)"
          :alt="layoutAlt"
          width="1600" height="1000"
          loading="lazy" decoding="async"
        />
        <figcaption>{{ t('customizationPage.focus.caption') }}</figcaption>
      </figure>
    </section>

    <!-- MODE COLOR THEMES -->
    <section id="mode-colors" class="v6cu-section flip v6-band v6-band-snap">
      <div class="v6cu-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('customizationPage.modeColors.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('customizationPage.modeColors.title') }}</h2>
        <p class="v6cu-section-sub v6-reveal">{{ t('customizationPage.modeColors.sub') }}</p>
        <p class="v6cu-note v6-reveal">{{ t('customizationPage.modeColors.note') }}</p>
      </div>
      <div class="v6cu-swatch-panel v6-reveal">
        <div v-for="m in modeSwatches" :key="m.name" class="v6cu-swatch-row">
          <span class="v6cu-swatch-name">{{ m.name }}</span>
          <span class="v6cu-swatch-sub">{{ m.sub }}</span>
          <span class="v6cu-swatch-dots" aria-hidden="true">
            <i v-for="c in m.palette" :key="c" :style="{ background: c }" :class="{ active: c === (isDark ? m.dark : m.light) }"></i>
          </span>
          <span class="v6cu-swatch-pair" aria-hidden="true">
            <b :style="{ background: m.light }"></b><small>{{ t('customizationPage.modeColors.light') }}</small>
            <b :style="{ background: m.dark }"></b><small>{{ t('customizationPage.modeColors.dark') }}</small>
          </span>
        </div>
        <p class="v6cu-swatch-foot">{{ t('customizationPage.modeColors.foot') }}</p>
      </div>
    </section>

    <!-- BACKGROUNDS & TONE -->
    <section id="backgrounds" class="v6cu-section v6-band v6-band-snap">
      <div class="v6cu-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('customizationPage.backgrounds.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('customizationPage.backgrounds.title') }}</h2>
        <p class="v6cu-section-sub v6-reveal">{{ t('customizationPage.backgrounds.sub') }}</p>
        <div class="v6cu-rows v6-reveal">
          <div v-for="r in canvasRows" :key="r.name" class="v6cu-row plain">
            <div>
              <h3>{{ r.name }}</h3>
              <p>{{ r.copy }}</p>
            </div>
            <span class="v6cu-row-value">{{ r.value }}</span>
          </div>
        </div>
      </div>
      <div class="v6cu-tone v6-reveal">
        <figure class="v6cu-shot" @mouseleave="hoveredTone = null">
          <div class="v6cu-tone-layers">
            <div
              v-for="(tone, i) in toneLayers" :key="tone.file"
              class="v6cu-tl" :class="{ lifted: hoveredTone === i }"
              :style="{ zIndex: hoveredTone === i ? toneLayers.length + 1 : i + 1 }"
            >
              <div
                class="v6cu-tl-clip"
                :style="{ clipPath: hoveredTone === i ? FULL_CLIP : bandClip(i, toneLayers.length) }"
                @mouseenter="hoveredTone = i"
              >
                <img
                  :src="asset(`Screenshots/opt/themes/${tone.file}.webp`)"
                  :alt="t('customizationPage.backgrounds.themeAlt', { name: tone.name })"
                  width="1600" height="1000"
                  loading="lazy" decoding="async"
                />
              </div>
            </div>
          </div>
          <figcaption>{{ toneCaption }}</figcaption>
        </figure>
        <div class="v6cu-tone-switch" role="group" :aria-label="t('customizationPage.backgrounds.ariaPreview')">
          <button
            v-for="o in ['light', 'dark']" :key="o"
            type="button" class="v6cu-tone-btn"
            :class="{ on: toneMode === o }" :aria-pressed="toneMode === o ? 'true' : 'false'"
            @click="toneOverride = o"
          >{{ t(`customizationPage.backgrounds.${o}`) }}</button>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6cu-cta">
      <h2 class="v6cu-cta-title v6-reveal">{{ t('customizationPage.cta.titlePre') }} <em>{{ t('customizationPage.cta.titleEm') }}</em><b class="v6-dot">.</b></h2>
      <p class="v6cu-cta-sub v6-reveal">{{ t('customizationPage.cta.sub') }}</p>
      <div class="v6cu-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet">{{ t('common.cta.exploreAllFeatures') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"

const { t, tm, rt } = useI18n()
const list = (key) => (tm(key) || []).map(rt)

const isDark = inject("isDark")

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`

const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* Layout playground — two switches pick one of four screenshots per theme.
   Only the selected one sits in the DOM; the other three are warmed during
   browser idle time so switching never waits on a download. */
const sidebars = ref(true)
const compact = ref(false)

const heroChips = computed(() => list("customizationPage.hero.chips"))

const CONTROL_REFS = [
  { key: "sidebars", on: sidebars },
  { key: "compact", on: compact },
]
const layoutControls = computed(() => {
  const copy = tm("customizationPage.focus.controls") || []
  return CONTROL_REFS.map((ctrl, i) => ({
    ...ctrl,
    name: rt(copy[i]?.name),
    onCopy: rt(copy[i]?.on),
    offCopy: rt(copy[i]?.off),
  }))
})

const LAYOUT_VARIANTS = ["full_S1", "full_S0", "compact_S1", "compact_S0"]
const layoutShotFor = (variant, dark) =>
  `Screenshots/opt/layout/dash_${variant}_${dark ? "d" : "l"}.webp`

const layoutShot = computed(() =>
  layoutShotFor(`${compact.value ? "compact" : "full"}_${sidebars.value ? "S1" : "S0"}`, isDark.value)
)
const layoutAlt = computed(() =>
  t("customizationPage.focus.alt", {
    density: t(`customizationPage.focus.${compact.value ? "densityCompact" : "densityFull"}`),
    rails: t(`customizationPage.focus.${sidebars.value ? "railsShown" : "railsHidden"}`),
  })
)

const warmed = new Set()
const warmLayoutShots = (dark) => {
  /* metered or slow connections keep on-demand loading instead */
  const conn = navigator.connection
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ""))) return
  for (const variant of LAYOUT_VARIANTS) {
    const path = layoutShotFor(variant, dark)
    if (warmed.has(path)) continue
    warmed.add(path)
    const img = new Image()
    img.decoding = "async"
    img.src = asset(path)
  }
}
const whenIdle = (fn) =>
  typeof requestIdleCallback === "function"
    ? requestIdleCallback(fn, { timeout: 3000 })
    : setTimeout(fn, 1200)

/* Dark base tones / light papers, shown side by side in one frame: each variant
   is clipped to its own diagonal band, hovering one expands it to the full shot.
   The preview starts on the site's theme but can be switched independently. */
const TONE_SETS = {
  dark: [
    { name: "Ink", file: "theme_ink_d" },
    { name: "Midnight", file: "theme_midnight_d" },
    { name: "Black", file: "theme_black_d" },
  ],
  light: [
    { name: "Soft", file: "theme_paper_l" },
    { name: "Whiteout", file: "theme_snow_l" },
  ],
}

const toneOverride = ref(null)
const toneMode = computed(() => toneOverride.value ?? (isDark.value ? "dark" : "light"))
const toneLayers = computed(() => TONE_SETS[toneMode.value])
const hoveredTone = ref(null)
const toneCaption = computed(() => {
  const layers = toneLayers.value
  const hovered = layers[hoveredTone.value]
  return hovered
    ? t("customizationPage.backgrounds.compareHint", { name: hovered.name })
    : layers.map((tone) => tone.name).join(" · ")
})
/* switching the set must not leave a stale index hovered */
watch(toneMode, () => { hoveredTone.value = null })

const FULL_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
const TONE_SKEW = 5.5 // how far the separator leans, in % of the frame width
/* band i spans boundary i → i+1; the +1px keeps antialiasing from showing a seam */
const bandClip = (i, count) => {
  const top = (n) => (n === 0 ? "0%" : n === count ? "100%" : `${(n / count) * 100 + TONE_SKEW}%`)
  const bot = (n) => (n === 0 ? "0%" : n === count ? "100%" : `${(n / count) * 100 - TONE_SKEW}%`)
  const pad = i + 1 === count ? "" : " + 1px"
  return `polygon(${top(i)} 0, calc(${top(i + 1)}${pad}) 0, calc(${bot(i + 1)}${pad}) 100%, ${bot(i)} 100%)`
}

/* Mode accents — mirror V6_ACCENTS in router.js / app mode themes */
const SWATCH_PALETTE = ["#22d3ee", "#facc15", "#4ade80", "#818cf8"]
const SWATCH_COLORS = [
  { light: "#0369a1", dark: "#22d3ee" },
  { light: "#ab7503", dark: "#facc15" },
  { light: "#047857", dark: "#4ade80" },
  { light: "#6d28d9", dark: "#818cf8" },
]
const modeSwatches = computed(() => {
  const copy = tm("customizationPage.modeColors.swatches") || []
  return SWATCH_COLORS.map((colors, i) => ({
    ...colors,
    palette: SWATCH_PALETTE,
    name: rt(copy[i]?.name),
    sub: rt(copy[i]?.sub),
  }))
})

const canvasRows = computed(() => {
  const copy = tm("customizationPage.backgrounds.rows") || []
  return copy.map((row) => ({ name: rt(row.name), value: rt(row.value), copy: rt(row.copy) }))
})

const v6Quiet = inject("v6Quiet")
const rootEl = ref(null)
const heroCopyEl = ref(null)
let cleanups = []

onMounted(() => {
  cleanups.push(initV6Reveals(rootEl.value))
  cleanups.push(initMagnetic(rootEl.value))
  whenIdle(() => warmLayoutShots(isDark.value))

  /* the particle river thins out behind the hero copy — see v6Quiet in V6Shell */
  v6Quiet?.set(heroCopyEl.value)
  cleanups.push(() => v6Quiet?.clear())

  /* full-viewport bands snap while this page is mounted — see v6.css */
  document.documentElement.classList.add("v6-snap")
})

/* the other theme's set is only worth fetching once the user switches */
watch(isDark, (dark) => whenIdle(() => warmLayoutShots(dark)))

onBeforeUnmount(() => {
  document.documentElement.classList.remove("v6-snap")
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
/* Customization page layout — shared tokens/chrome live in src/styles/v6.css */
.v6-custom { position: relative; z-index: 1; }

/* Bands (.v6-band / .v6-band-snap) live in src/styles/v6.css */

/* ── hero ── */
.v6cu-hero {
  position: relative;
  /* text column deliberately narrow — the screenshot carries the section */
  grid-template-columns: minmax(300px, 4fr) 8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6cu-hero .v6-h1 {
  font-size: clamp(2.1rem, 3.5vw, 3.3rem);
  margin: 1rem 0 1rem;
}
.v6cu-sub {
  max-width: 32rem;
  color: var(--v6-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.v6cu-chips { margin-top: 1.2rem; }
.v6cu-chips li { font-size: 0.62rem; padding: 0.24rem 0.6rem; }
.v6cu-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1.7rem;
}

/* ── screenshots ── */
.v6cu-shot {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--v6-line-strong);
  background: var(--v6-bg-soft);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8), 0 0 60px -20px var(--v6-line-strong);
}
.v6.light .v6cu-shot {
  box-shadow: 0 30px 70px -32px rgba(20, 60, 50, 0.45), 0 0 50px -24px var(--v6-line-strong);
}
.v6cu-shot img { display: block; width: 100%; height: auto; }
.v6cu-shot figcaption {
  padding: 0.7rem 1.1rem;
  border-top: 1px solid var(--v6-line);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── tone comparison stack ── */
.v6cu-tone-layers { position: relative; aspect-ratio: 16 / 10; }
/* the drop-shadow lives on the outer element: on the same element as clip-path
   the clip would cut the shadow away */
.v6cu-tl {
  position: absolute;
  inset: 0;
  pointer-events: none;
  filter: drop-shadow(-4px 0 9px rgba(0, 0, 0, 0.5));
}
.v6.light .v6cu-tl { filter: drop-shadow(-4px 0 9px rgba(20, 60, 50, 0.28)); }
.v6cu-tl-clip {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  cursor: pointer;
  transition: clip-path 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.v6cu-tl img { display: block; width: 100%; height: 100%; object-fit: cover; }

.v6cu-tone-switch {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.9rem;
}
.v6cu-tone-btn {
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  padding: 0.34rem 0.95rem;
  background: none;
  color: var(--v6-muted);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.v6cu-tone-btn:hover { color: var(--v6-ink); }
.v6cu-tone-btn.on {
  color: var(--v6-gold);
  border-color: var(--v6-gold);
  background: color-mix(in srgb, var(--v6-gold) 10%, transparent);
}
.v6cu-tone-btn:focus-visible { outline: 2px solid var(--v6-gold); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  .v6cu-tl-clip { transition: none; }
}

/* ── sections ── */
.v6cu-section {
  grid-template-columns: minmax(300px, 5.2fr) 6.8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6cu-section.flip > :first-child { order: 2; }
.v6cu-section.flip > :last-child { order: 1; }
.v6cu-section .v6-h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); }
.v6cu-section-sub {
  color: var(--v6-muted);
  margin: 0.9rem 0 0;
  max-width: 33rem;
  font-size: 0.92rem;
  line-height: 1.6;
}
.v6cu-note {
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

/* ── setting rows ── */
.v6cu-rows {
  margin-top: 1.4rem;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6cu-rows {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6cu-row {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.85rem clamp(1rem, 2vw, 1.4rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6cu-row:last-child { border-bottom: 0; }
.v6cu-row h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.94rem;
  letter-spacing: -0.01em;
  margin: 0;
}
.v6cu-row p { color: var(--v6-muted); font-size: 0.83rem; line-height: 1.5; margin: 0.3rem 0 0; }
.v6cu-row.plain { justify-content: space-between; align-items: center; }
.v6cu-row-value {
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
/* real switches — same row look, but a button, so keyboard and AT get it too */
.v6cu-control {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--v6-line);
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}
.v6cu-control:last-child { border-bottom: 0; }
.v6cu-control:hover { background: color-mix(in srgb, var(--v6-gold) 7%, transparent); }
.v6cu-control:focus-visible { outline: 2px solid var(--v6-gold); outline-offset: -3px; }
.v6cu-control-copy { display: block; }
.v6cu-control-name {
  display: block;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.94rem;
  letter-spacing: -0.01em;
}
.v6cu-control-note {
  display: block;
  margin-top: 0.3rem;
  color: var(--v6-muted);
  font-size: 0.83rem;
  line-height: 1.5;
}
.v6cu-control-hint {
  margin: 0.9rem 0 0;
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* decorative toggle echoing the in-app switches */
.v6cu-row-toggle {
  flex: none;
  margin-top: 0.2rem;
  width: 34px;
  height: 19px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--v6-gold), var(--v6-gold-hi));
  position: relative;
  transition: background 0.2s ease;
}
.v6cu-row-toggle i {
  position: absolute;
  top: 2.5px;
  left: 17.5px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--v6-bg);
  transition: left 0.2s ease;
}
.v6cu-row-toggle.off { background: var(--v6-line); }
.v6cu-row-toggle.off i { left: 2.5px; }

/* ── mode swatch panel ── */
.v6cu-swatch-panel {
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6cu-swatch-panel {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6cu-swatch-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem clamp(1rem, 2vw, 1.4rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6cu-swatch-name {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.94rem;
  letter-spacing: -0.01em;
  color: var(--v6-ink);
}
.v6cu-swatch-sub { color: var(--v6-faint); font-size: 0.82rem; }
.v6cu-swatch-dots { display: inline-flex; gap: 0.45rem; }
.v6cu-swatch-dots i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  opacity: 0.45;
}
.v6cu-swatch-dots i.active {
  opacity: 1;
  box-shadow: 0 0 0 2px var(--v6-bg), 0 0 0 3.5px currentColor;
}
.v6cu-swatch-pair {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6cu-swatch-pair b { width: 12px; height: 12px; border-radius: 50%; }
.v6cu-swatch-pair small { font-size: inherit; margin-right: 0.4rem; }
.v6cu-swatch-foot {
  margin: 0;
  padding: 0.8rem clamp(1.1rem, 2.2vw, 1.5rem);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── cta ── */
.v6cu-cta {
  text-align: center;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
}
.v6cu-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 1rem;
}
.v6cu-cta-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--v6-gold-hi);
}
.v6cu-cta-sub { color: var(--v6-muted); margin: 0 0 2.2rem; }
.v6cu-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 900px) {
  .v6cu-hero { grid-template-columns: 1fr; }
  .v6cu-section { grid-template-columns: 1fr; gap: 1.6rem; }
  .v6cu-section.flip > :first-child { order: 1; }
  .v6cu-section.flip > :last-child { order: 2; }
  .v6cu-swatch-row { grid-template-columns: auto 1fr auto; }
  .v6cu-swatch-dots { display: none; }
}
@media (max-width: 640px) {
  .v6cu-row.plain { flex-wrap: wrap; }
  .v6cu-swatch-row { grid-template-columns: 1fr auto; }
  .v6cu-swatch-sub { display: none; }
}
@media (max-width: 420px) {
  .v6cu-actions,
  .v6cu-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6cu-actions .v6-quiet,
  .v6cu-cta-actions .v6-quiet { justify-content: center; }
}
</style>
