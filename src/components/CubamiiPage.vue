<template>
  <main ref="rootEl" class="cm">
    <!-- HERO -->
    <section class="cm-hero">
      <div class="cm-hero-copy">
        <p class="cm-brand v6-reveal">
          <img :src="`${baseUrl}cubamii/icon.webp`" alt="" width="46" height="46" />
          <span><strong>Cubamii</strong><small>{{ t('cubamiiPage.hero.brandSub') }}</small></span>
        </p>
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal" :aria-label="headlineLabel">
          <span aria-hidden="true">{{ t('cubamiiPage.hero.h1.pre') }}</span>
          <!-- the ghost holds the longest line so the headline keeps its height while the word is typed -->
          <em class="cm-typed" aria-hidden="true">
            <span class="cm-typed-ghost">{{ headline(longestWord) }}.</span>
            <span class="cm-typed-live">{{ headline(typedBody) }}<b class="v6-dot">{{ typedDot }}</b><b class="cm-type-cursor">|</b></span>
          </em>
        </h1>
        <p class="cm-sub v6-reveal">{{ t('cubamiiPage.hero.sub') }}</p>
        <ul class="v6-card-chips v6-reveal">
          <li v-for="c in chips" :key="c">{{ c }}</li>
        </ul>
        <div class="cm-actions v6-reveal">
          <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-magnetic">{{ t('cubamiiPage.hero.cta') }} <span aria-hidden="true">→</span></RouterLink>
          <a href="#how" class="v6-quiet v6-magnetic">{{ t('cubamiiPage.hero.more') }}</a>
        </div>
      </div>

      <div class="cm-stage">
        <canvas
          v-show="!noGl"
          ref="canvasEl"
          class="cm-canvas"
          tabindex="0"
          role="img"
          :aria-label="t('cubamiiPage.cube.aria')"
        ></canvas>
        <img
          v-if="noGl"
          class="cm-canvas-fallback"
          :src="shot('start')"
          :alt="t('cubamiiPage.cube.fallbackAlt')"
          width="540"
          height="898"
        />
        <div v-if="!noGl" class="cm-controls">
          <p class="cm-hint" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M7 8l-3 4 3 4M17 8l3 4-3 4" /></svg>
            {{ t('cubamiiPage.cube.hint') }}
          </p>
          <button type="button" class="cm-carve" :disabled="phase === 'carving'" @click="carve">
            {{ t(phase === 'carving' ? 'cubamiiPage.cube.busy' : phase === 'done' ? 'cubamiiPage.cube.again' : 'cubamiiPage.cube.carve') }}
          </button>
        </div>
        <p v-if="!noGl" class="cm-caption" aria-live="polite">
          {{ t(phase === 'done' ? 'cubamiiPage.cube.captionDone' : 'cubamiiPage.cube.caption') }}
        </p>
      </div>
    </section>

    <!-- HOW IT PLAYS -->
    <section id="how" class="cm-section">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.how.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.how.title.pre') }} <em>{{ t('cubamiiPage.how.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="cm-lead v6-reveal">{{ t('cubamiiPage.how.sub') }}</p>
      </header>
      <div class="cm-steps">
        <article v-for="(s, i) in steps" :key="s.title" class="v6-card cm-step v6-reveal">
          <p class="cm-step-no">0{{ i + 1 }}</p>
          <h3>{{ s.title }}</h3>
          <p>{{ s.copy }}</p>
          <figure class="cm-phone">
            <img v-zoom :src="shot(STEP_SHOTS[i])" :alt="s.alt" width="540" height="898" loading="lazy" decoding="async" />
          </figure>
        </article>
      </div>
    </section>

    <!-- CLUES -->
    <section class="cm-section">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.clues.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.clues.title.pre') }} <em>{{ t('cubamiiPage.clues.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="cm-lead v6-reveal">{{ t('cubamiiPage.clues.sub') }}</p>
      </header>
      <ul class="cm-clues">
        <li v-for="(c, i) in clues" :key="i" class="v6-card cm-clue v6-reveal">
          <span class="cm-glyph" :class="GLYPHS[i].shape" aria-hidden="true">{{ GLYPHS[i].digit }}</span>
          <p>{{ c.copy }}</p>
        </li>
      </ul>
      <p class="cm-note v6-reveal">{{ t('cubamiiPage.clues.note') }}</p>
    </section>

    <!-- COLLECTION -->
    <section class="cm-section cm-section-wide">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.models.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.models.title.pre') }} <em>{{ t('cubamiiPage.models.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="cm-lead v6-reveal">{{ t('cubamiiPage.models.sub') }}</p>
      </header>
      <div class="cm-rail v6-reveal" tabindex="0" role="region" :aria-label="t('cubamiiPage.models.eyebrow')">
        <figure v-for="(m, i) in MODELS" :key="m" class="cm-model">
          <span class="cm-phone">
            <img
              v-zoom
              :src="shot(m)"
              :alt="t('cubamiiPage.models.alt', { name: modelNames[i] })"
              width="540"
              height="898"
              loading="lazy"
              decoding="async"
            />
          </span>
          <figcaption>{{ modelNames[i] }}</figcaption>
        </figure>
      </div>
      <ul class="cm-stats">
        <li v-for="s in stats" :key="s.value" class="v6-card cm-stat v6-reveal">
          <strong>{{ s.value }}</strong>
          <span>{{ s.label }}</span>
        </li>
      </ul>
    </section>

    <!-- FEATURES -->
    <section class="cm-section">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.features.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.features.title.pre') }} <em>{{ t('cubamiiPage.features.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>
      <div class="cm-features">
        <article v-for="(f, i) in features" :key="f.title" class="v6-card cm-feature v6-reveal">
          <span class="v6-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="ICONS[i]" /></svg>
          </span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.copy }}</p>
        </article>
      </div>
    </section>

    <!-- PRICING -->
    <section class="cm-section">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.pricing.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.pricing.title.pre') }} <em>{{ t('cubamiiPage.pricing.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>
      <div class="cm-pricing">
        <article v-for="(p, i) in pricing" :key="p.title" class="v6-card cm-plan v6-reveal" :class="{ featured: i === 1 }">
          <p class="cm-plan-label">{{ p.label }}</p>
          <h3>{{ p.title }}</h3>
          <p>{{ p.copy }}</p>
        </article>
      </div>
      <p class="cm-note v6-reveal">{{ t('cubamiiPage.pricing.note') }}</p>
    </section>

    <!-- CALM -->
    <section class="cm-section">
      <header class="cm-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('cubamiiPage.calm.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('cubamiiPage.calm.title.pre') }} <em>{{ t('cubamiiPage.calm.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>
      <ul class="cm-calm">
        <li v-for="c in calm" :key="c.title" class="v6-reveal">
          <strong>{{ c.title }}</strong>
          <span>{{ c.copy }}</span>
        </li>
      </ul>
      <p class="cm-calm-foot v6-reveal">
        <span>{{ t('cubamiiPage.calm.spec') }}</span>
        <a class="cm-link" href="/cubamii/privacy/">{{ t('cubamiiPage.calm.privacy') }} <span aria-hidden="true">→</span></a>
      </p>
    </section>

    <!-- CTA -->
    <section class="cm-cta v6-reveal">
      <img :src="`${baseUrl}cubamii/icon.webp`" alt="" width="72" height="72" class="cm-cta-icon" />
      <h2 class="cm-cta-title">{{ t('cubamiiPage.cta.title.pre') }} <em>{{ t('cubamiiPage.cta.title.em') }}</em><b class="v6-dot">.</b></h2>
      <p class="cm-lead">{{ t('cubamiiPage.cta.sub') }}</p>
      <div class="cm-cta-actions">
        <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('cubamiiPage.cta.button') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="{ path: `/${lang}/sandbox`, hash: '#apps' }" class="v6-quiet">{{ t('cubamiiPage.cta.studio') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals, prefersReducedMotion } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"
import { createCubamiiCube } from "./cubamii/cubamiiCube.js"

const { t, tm, rt } = useI18n()
const route = useRoute()
const baseUrl = import.meta.env.BASE_URL

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* structure only — every string lives in cubamiiPage; screenshots are the app's own, one set per locale */
const STEP_SHOTS = ["start", "carve", "fox"]
const MODELS = ["fox", "squirrel", "tarantula", "tikal", "pirate", "western", "castle", "garden", "lighthouse"]
const GLYPHS = [
  { digit: "3", shape: "plain" },
  { digit: "3", shape: "circle" },
  { digit: "3", shape: "square" },
  { digit: "0", shape: "plain" },
]
const ICONS = [
  "M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4",
  "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
  "M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4",
  "M5 5h14v15H5zM5 10h14M9 3v4M15 3v4",
  "M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s-.3-2 1-2H17a4 4 0 0 0 4-4c0-5-4-10-9-10zM7.5 11.5h.01M10 7.5h.01M15 8h.01",
  "M4 12v7h16v-7M12 3v12M8 7l4-4 4 4",
  "M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5z",
  "M3 19l5-13 5 13M5 14h6M15 19l3.5-9 3.5 9M16.2 16.5h4.6",
]

const shot = (name) => `${baseUrl}cubamii/shots/${lang.value}/${name}.webp`

const list = (key) => (tm(key) || []).map(rt)
const chips = computed(() => list("cubamiiPage.hero.chips"))
const modelNames = computed(() => list("cubamiiPage.models.items"))
const zip = (key, fields) => (tm(key) || []).map((item) => Object.fromEntries(fields.map((f) => [f, rt(item[f])])))
const steps = computed(() => zip("cubamiiPage.how.steps", ["title", "copy", "alt"]))
const clues = computed(() => zip("cubamiiPage.clues.items", ["copy"]))
const stats = computed(() => zip("cubamiiPage.models.stats", ["value", "label"]))
const features = computed(() => zip("cubamiiPage.features.items", ["title", "copy"]))
const pricing = computed(() => zip("cubamiiPage.pricing.items", ["label", "title", "copy"]))
const calm = computed(() => zip("cubamiiPage.calm.items", ["title", "copy"]))

/* ── hero typewriter — same timing as the landing page: 115 ms typing, 100 ms deleting, 5 s hold ── */
const words = computed(() => list("cubamiiPage.hero.h1.words"))
const headline = (word) => t("cubamiiPage.hero.h1.em", { word })
const headlineLabel = computed(() => `${t("cubamiiPage.hero.h1.pre")} ${headline(words.value.join(", "))}.`)
const longestWord = computed(() => words.value.reduce((a, b) => (b.length > a.length ? b : a), ""))
const typed = ref(`${words.value[0] ?? ""}.`)
/* the trailing dot is rendered apart so it can take the ember accent */
const TERMINAL_DOT = /[.。]$/
const typedBody = computed(() => typed.value.replace(TERMINAL_DOT, ""))
const typedDot = computed(() => (TERMINAL_DOT.test(typed.value) ? typed.value.slice(-1) : ""))
let typingTimer = 0

const startTypewriter = () => {
  const HOLD_MS = 5000
  let wordIdx = 0
  let charIdx = (words.value[0] ?? "").length + 1
  let deleting = false

  const tick = () => {
    const pool = words.value
    const word = `${pool[wordIdx % pool.length]}.`
    if (deleting) {
      charIdx--
      typed.value = word.slice(0, charIdx)
      if (charIdx === 0) {
        deleting = false
        wordIdx = (wordIdx + 1) % pool.length
        typingTimer = window.setTimeout(tick, 390)
      } else {
        typingTimer = window.setTimeout(tick, 100)
      }
    } else {
      charIdx++
      typed.value = word.slice(0, charIdx)
      typingTimer = window.setTimeout(charIdx === word.length ? () => { deleting = true; tick() } : tick, charIdx === word.length ? HOLD_MS : 115)
    }
  }

  typingTimer = window.setTimeout(() => { deleting = true; tick() }, 4400)
}

/* ── the hero cube ── */
const canvasEl = ref(null)
const phase = ref("block")
const noGl = ref(false)
let cube = null
let autoplay = 0

const carve = () => {
  clearTimeout(autoplay)
  cube?.replay()
}

const rootEl = ref(null)
let cleanups = []

onMounted(() => {
  cleanups.push(initV6Reveals(rootEl.value))
  cleanups.push(initMagnetic(rootEl.value))
  startTypewriter()

  try {
    cube = createCubamiiCube(canvasEl.value, {
      reducedMotion: prefersReducedMotion(),
      onPhase: (next) => { phase.value = next },
    })
  } catch (err) {
    noGl.value = true
    console.error("Cubamii cube: could not start WebGL — showing the screenshot instead.", err)
    return
  }
  /* once the block has built up, it carves itself a single time; reduced motion waits for the button */
  if (!prefersReducedMotion()) autoplay = window.setTimeout(() => cube.play(), 2400)
})

onBeforeUnmount(() => {
  clearTimeout(typingTimer)
  clearTimeout(autoplay)
  cube?.dispose()
  cube = null
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
.cm { position: relative; z-index: 1; }

/* ── hero ── */
.cm-hero {
  position: relative;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) var(--v6-page-hero-bottom);
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: center;
}
.cm-hero .v6-h1 { font-size: clamp(2.5rem, 5vw, 4.3rem); }
.cm-typed { display: grid; }
.cm-typed > * { grid-area: 1 / 1; }
.cm-typed-ghost { visibility: hidden; }
.cm-type-cursor {
  display: inline-block;
  color: var(--v6-gold);
  font-weight: 300;
  font-style: normal;
  margin-left: 0.04em;
  animation: cm-cursor-blink 0.75s step-end infinite;
}
@keyframes cm-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.cm-brand {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin: 0 0 1.6rem;
}
.cm-brand img { border-radius: 12px; box-shadow: 0 0 0 1px var(--v6-line), 0 10px 30px -10px rgba(0, 0, 0, 0.6); }
.cm-brand span { display: flex; flex-direction: column; line-height: 1.15; }
.cm-brand strong {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.04em;
}
.cm-brand small {
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.cm-sub { max-width: 34rem; color: var(--v6-muted); }
.cm-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1.2rem; margin-top: 2.2rem; }

.cm-stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}
/* a soft pool of light the cube floats in */
.cm-stage::before {
  content: "";
  position: absolute;
  inset: 4% 2% 14%;
  background:
    radial-gradient(ellipse 52% 46% at 50% 54%, color-mix(in srgb, var(--v6-gold) 12%, transparent), transparent 70%),
    radial-gradient(ellipse 60% 50% at 50% 60%, rgba(45, 212, 232, 0.1), transparent 72%);
  pointer-events: none;
}
.cm-canvas {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1 / 1;
  max-height: 74vh;
  cursor: grab;
  touch-action: pan-y;
  outline-offset: -4px;
  border-radius: 24px;
}
.cm-canvas.is-dragging { cursor: grabbing; }
.cm-canvas-fallback { position: relative; width: min(100%, 17rem); height: auto; border-radius: 22px; box-shadow: 0 0 0 1px var(--v6-line-strong); }
.cm-controls {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.8rem 1.4rem;
  margin-top: 0.4rem;
}
.cm-hint {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.cm-hint svg { width: 18px; height: 18px; }
.cm-carve {
  padding: 0.55rem 1.3rem;
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  background: color-mix(in srgb, var(--v6-gold) 10%, transparent);
  color: var(--v6-gold-hi);
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.25s ease, color 0.25s ease, opacity 0.25s ease;
}
.cm-carve:hover:not(:disabled) { background: color-mix(in srgb, var(--v6-gold) 22%, transparent); }
.cm-carve:disabled { opacity: 0.55; cursor: default; }
.cm-caption {
  position: relative;
  max-width: 28rem;
  margin: 0.9rem 0 0;
  text-align: center;
  font-size: 0.88rem;
  color: var(--v6-muted);
}

/* ── sections ── */
.cm-section {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block) var(--v6-gutter);
  scroll-margin-top: 4.5rem;
}
.cm-head { margin-bottom: clamp(1.8rem, 4vw, 3rem); }
.cm-lead { max-width: 38rem; margin: 1.2rem 0 0; color: var(--v6-muted); }

/* ── how it plays ── */
.cm-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.9rem, 2vw, 1.4rem); }
.cm-step { display: flex; flex-direction: column; }
.cm-step-no {
  margin: 0 0 1rem;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  color: var(--v6-gold);
}
.cm-step .cm-phone { margin: 1.6rem auto 0; width: min(100%, 15rem); }

/* phone frame shared by the steps and the collection rail */
.cm-phone {
  display: block;
  padding: 5px;
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(148, 163, 184, 0.28), rgba(148, 163, 184, 0.06));
  box-shadow: 0 24px 48px -22px rgba(0, 0, 0, 0.7);
}
.cm-phone img { display: block; width: 100%; height: auto; border-radius: 21px; background: var(--v6-bg-soft); }

/* ── clues ── */
.cm-clues {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(0.9rem, 2vw, 1.4rem);
  margin: 0;
  padding: 0;
}
.cm-clue { display: flex; flex-direction: column; align-items: flex-start; gap: 1.1rem; }
.cm-glyph {
  display: inline-grid;
  place-items: center;
  width: 3.6rem;
  height: 3.6rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.9rem;
  line-height: 1;
  color: var(--v6-ink);
  border: 2.5px solid transparent;
}
.cm-glyph.circle { border-color: var(--v6-gold); border-radius: 50%; }
.cm-glyph.square { border-color: var(--v6-gold); border-radius: 9px; }
.cm-note { max-width: 40rem; margin: 1.6rem 0 0; color: var(--v6-faint); font-size: 0.92rem; }

/* ── collection ── */
.cm-section-wide { padding-bottom: calc(var(--v6-section-block) * 0.6); }
.cm-rail {
  display: flex;
  gap: clamp(0.9rem, 1.6vw, 1.3rem);
  overflow-x: auto;
  padding: 0.4rem 0.2rem 1.2rem;
  scroll-snap-type: x proximity;
  overscroll-behavior-x: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--v6-line-strong) transparent;
}
.cm-model { flex: none; width: clamp(10.5rem, 17vw, 12.8rem); margin: 0; scroll-snap-align: start; }
.cm-model figcaption {
  margin-top: 0.85rem;
  text-align: center;
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--v6-muted);
}
.cm-stats {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(0.9rem, 2vw, 1.4rem);
  margin: clamp(1.6rem, 3vw, 2.4rem) 0 0;
  padding: 0;
}
.cm-stat { display: flex; flex-direction: column; gap: 0.5rem; }
.cm-stat strong {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 2.6vw, 2.1rem);
  letter-spacing: -0.02em;
  color: var(--v6-gold-hi);
}
.cm-stat span { color: var(--v6-muted); font-size: 0.94rem; }

/* ── features ── */
.cm-features { display: grid; grid-template-columns: repeat(4, 1fr); gap: clamp(0.9rem, 2vw, 1.4rem); }

/* ── pricing ── */
.cm-pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.9rem, 2vw, 1.4rem); }
.cm-plan-label {
  margin: 0 0 1rem;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.cm-plan.featured { border-color: var(--v6-line-strong); }

/* ── calm ── */
.cm-calm {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem clamp(1.2rem, 3vw, 2.4rem);
  margin: 0;
  padding: 1.4rem 0 0;
  border-top: 1px solid var(--v6-line);
}
.cm-calm li { display: grid; align-content: start; gap: 0.35rem; color: var(--v6-muted); }
.cm-calm strong { font-family: var(--v6-display); font-size: 1.1rem; color: var(--v6-ink); letter-spacing: -0.01em; }
.cm-calm-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.8rem 2rem;
  margin: 1.8rem 0 0;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.cm-link { color: var(--v6-gold-hi); text-decoration: none; }
.cm-link:hover { text-decoration: underline; text-underline-offset: 4px; }

/* ── cta ── */
.cm-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
  text-align: center;
}
.cm-cta-icon { display: block; margin: 0 auto; border-radius: 18px; box-shadow: 0 0 0 1px var(--v6-line), 0 16px 40px -14px rgba(0, 0, 0, 0.7); }
.cm-cta-title {
  margin: 1.4rem 0 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.cm-cta-title em { font-style: italic; font-weight: 600; color: var(--v6-gold-hi); }
.cm-cta .cm-lead { margin: 1rem auto 2.2rem; }
.cm-cta-actions { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1.6rem; }

/* ── responsive ── */
@media (max-width: 1100px) {
  .cm-features, .cm-clues { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  /* the cube is the hero: on a phone it comes before the copy */
  .cm-hero { grid-template-columns: 1fr; padding-top: 5.5rem; }
  .cm-stage { order: -1; }
  .cm-canvas { max-height: none; }
  .cm-steps, .cm-stats, .cm-calm, .cm-pricing { grid-template-columns: 1fr; }
  .cm-step .cm-phone { width: min(100%, 14rem); }
}
@media (max-width: 640px) {
  .cm-features, .cm-clues { grid-template-columns: 1fr; }
  .cm-calm-foot { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 420px) {
  .cm-actions, .cm-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .cm-actions .v6-quiet, .cm-cta-actions .v6-quiet { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .cm-type-cursor { animation: none; }
  .cm-carve { transition: none; }
}
</style>
