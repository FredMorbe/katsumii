<template>
  <main id="top" ref="rootEl" class="v6-landing">
    <!-- HERO -->
    <section class="v6-hero">
      <div class="v6-hero-inner">
        <p class="v6-eyebrow v6-hero-brand v6-copy-glow v6-load v6-load-1">
          <img :src="asset('logo.png')" alt="" width="64" height="64" />
          <b>Katsumii<span class="v6-type-dot">.</span></b>
          <i></i>{{ t('landing.hero.brandTagline') }}
        </p>
        <h1 class="v6-h1">
          <span class="v6-hline"><span class="v6-hline-in v6-load-h1a"><span class="v6-crt" :class="{ on: glitchOn }" :data-text="glitchWord">{{ glitchWord }}</span>{{ headlineLeadRest }}</span></span>
          <span class="v6-hline"><span class="v6-hline-in v6-load-h1b v6-typed-line"><em>{{ typedBody }}<b class="v6-type-dot">{{ typedDot }}</b></em><b class="v6-type-cursor" aria-hidden="true">|</b></span></span>
        </h1>
        <p class="v6-hero-sub v6-copy-glow v6-load v6-load-2">
          {{ t('landing.hero.sub') }}
          <span class="v6-hero-ownership">{{ t('landing.hero.ownership') }}</span>
        </p>
        <div class="v6-hero-actions v6-copy-glow v6-load v6-load-3">
          <span class="v6-btn v6-btn-static" aria-disabled="true">{{ t('landing.hero.ctaPrimary') }}</span>
          <a href="#story" class="v6-quiet v6-magnetic">{{ t('landing.hero.ctaSecondary') }} <span aria-hidden="true">↓</span></a>
        </div>
      </div>
      <p class="v6-hero-hint v6-copy-glow v6-load v6-load-4" aria-hidden="true"><span></span>{{ t('landing.hero.scroll') }}</p>
    </section>

    <!-- MARQUEE -->
    <div class="v6-marquee" aria-hidden="true">
      <div class="v6-marquee-track">
        <span v-for="n in 2" :key="n" class="v6-marquee-seq">
          <template v-for="word in marqueeWords" :key="word">{{ word }} <i>·</i> </template>
        </span>
      </div>
    </div>

    <!-- NUMBERS -->
    <section class="v6-numbers" :aria-label="t('landing.numbers.aria')">
      <div v-for="s in stats" :key="s.label" class="v6-num v6-reveal">
        <span class="v6-num-val"><b :data-count="s.value">0</b><i>{{ s.suffix }}</i></span>
        <span class="v6-num-label">{{ s.label }}</span>
      </div>
    </section>

    <!-- STORY (pinned scrollytelling on desktop) -->
    <section id="story" ref="storyEl" class="v6-story">
      <div ref="storyPinEl" class="v6-story-pin">
        <div class="v6-story-copy">
          <p class="v6-eyebrow v6-reveal"><i></i>{{ t('landing.story.eyebrow') }}</p>
          <h2 class="v6-h2 v6-reveal">
            {{ slides[activeStory].headline }}<br />
            <span class="v6-story-accent">{{ slides[activeStory].accent }}<span class="v6-type-dot">.</span></span>
          </h2>
          <div class="v6-story-steps">
            <div
              v-for="(s, i) in slides" :key="s.title"
              class="v6-story-step" :class="{ active: i === activeStory }"
            >
              <span class="v6-story-num" aria-hidden="true">0{{ i + 1 }}</span>
              <h3>{{ s.title }} <em>— {{ s.tag }}</em></h3>
              <p>{{ s.caption }}</p>
            </div>
          </div>
          <div class="v6-story-dots" role="presentation">
            <button
              v-for="(s, i) in slides" :key="`dot-${s.title}`" type="button"
              :class="{ active: i === activeStory }" :aria-label="t('landing.story.showAria', { title: s.title })"
              @click="goToStory(i)"
            ></button>
          </div>
        </div>
        <div class="v6-story-stage">
          <figure
            v-for="(s, i) in slides" :key="`shot-${s.title}`"
            class="v6-story-shot" :class="{ active: i === activeStory }"
            :inert="i !== activeStory"
          >
            <img
              v-zoom
              :src="shot(s)" :alt="s.alt" :width="s.w" :height="s.h"
              :loading="i === 0 ? 'eager' : 'lazy'" decoding="async"
            />
          </figure>
        </div>
      </div>

      <!-- mobile: plain stacked story -->
      <div class="v6-story-stack">
        <figure v-for="(s, i) in slides" :key="`stack-${s.title}`" class="v6-stack-item v6-reveal">
          <div class="v6-stack-frame">
            <img v-zoom :src="shot(s)" :alt="s.alt" :width="s.w" :height="s.h" loading="lazy" decoding="async" />
          </div>
          <figcaption>
            <span class="v6-story-num" aria-hidden="true">0{{ i + 1 }}</span>
            <strong>{{ s.title }} <em>— {{ s.tag }}</em></strong>
            <span>{{ s.caption }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <div class="v6-branch-divider">
      <svg class="v6-branch" viewBox="0 0 120 170" fill="none" aria-hidden="true">
        <path class="v6-branch-path" d="M62 166 C 56 140, 46 132, 48 110 C 50 92, 66 88, 68 68 C 70 50, 58 42, 60 20 M52 118 C 38 114, 26 116, 14 104 M66 78 C 82 74, 94 78, 104 66 M59 34 C 50 30, 44 32, 36 24" stroke-linecap="round" />
        <circle class="v6-branch-leaf" cx="13" cy="103" r="4" />
        <circle class="v6-branch-leaf" cx="22" cy="99" r="2.5" />
        <circle class="v6-branch-leaf" cx="105" cy="65" r="4" />
        <circle class="v6-branch-leaf" cx="96" cy="73" r="2.5" />
        <circle class="v6-branch-leaf" cx="35" cy="23" r="3" />
        <circle class="v6-branch-leaf" cx="60" cy="18" r="4" />
      </svg>
    </div>

    <!-- MODES (pinned discipline stage — each retints the whole page) -->
    <section id="modes" ref="modesEl" class="v6-modes">
      <div class="v6-modes-pin">
        <div class="v6-section-head">
          <p class="v6-eyebrow v6-reveal"><i></i>{{ t('landing.modes.eyebrow') }}</p>
          <h2 class="v6-h2 v6-reveal">{{ t('landing.modes.headlineA') }}<br />{{ t('landing.modes.headlineB') }}</h2>
        </div>

        <!-- desktop (test): fold accordion, layout concept from V5 -->
        <div v-if="MODES_FOLDS" class="v6-folds v6-reveal">
          <article
            v-for="(m, i) in modes" :key="`fold-${m.name}`"
            class="v6-fold" :class="{ open: i === activeMode }"
            :style="{ '--mode-c': isDark ? m.accent.dark[0] : m.accent.light[0] }"
          >
            <button
              type="button" class="v6-fold-head"
              :aria-expanded="i === activeMode" :aria-controls="`v6-fold-${i}`"
              @click="activeMode = i"
            >
              <span class="v6-fold-num" aria-hidden="true">0{{ i + 1 }}</span>
              <span class="v6-fold-name">{{ m.name }}</span>
              <span class="v6-fold-dot" aria-hidden="true"></span>
            </button>
            <div :id="`v6-fold-${i}`" class="v6-fold-body">
              <div class="v6-fold-body-in">
                <p class="v6-mode-tag">{{ m.tag }}</p>
                <h3>{{ m.headline }}</h3>
                <p class="v6-mode-copy">{{ m.copy }}</p>
                <ul>
                  <li v-for="p in m.points" :key="p">{{ p }}</li>
                </ul>
                <RouterLink :to="`/${lang}/journal${m.path}`" class="v6-quiet v6-mode-link">
                  {{ t('landing.modes.explore', { name: m.name }) }} <span aria-hidden="true">→</span>
                </RouterLink>
              </div>
            </div>
          </article>
        </div>

        <!-- desktop: pinned stage -->
        <div v-else class="v6-modes-stage">
          <div class="v6-modes-side">
            <span class="v6-modes-count" aria-hidden="true">0{{ activeMode + 1 }}</span>
            <div class="v6-modes-names" role="tablist" :aria-label="t('landing.modes.ariaTabs')">
              <button
                v-for="(m, i) in modes" :key="m.name" type="button" role="tab"
                :aria-selected="i === activeMode" :class="{ active: i === activeMode }"
                @click="goToMode(i)"
              >
                <em aria-hidden="true"></em>{{ m.name }}
              </button>
            </div>
          </div>
          <div class="v6-modes-panel">
            <Transition name="v6-mode" mode="out-in">
              <article :key="activeMode" class="v6-mode-card">
                <p class="v6-mode-tag">{{ modes[activeMode].tag }}</p>
                <h3>{{ modes[activeMode].headline }}</h3>
                <p class="v6-mode-copy">{{ modes[activeMode].copy }}</p>
                <ul>
                  <li v-for="p in modes[activeMode].points" :key="p">{{ p }}</li>
                </ul>
                <RouterLink :to="`/${lang}/journal${modes[activeMode].path}`" class="v6-quiet v6-mode-link">
                  {{ t('landing.modes.explore', { name: modes[activeMode].name }) }} <span aria-hidden="true">→</span>
                </RouterLink>
              </article>
            </Transition>
          </div>
        </div>

        <!-- mobile: stacked cards, each in its own accent -->
        <div class="v6-modes-stack">
          <article
            v-for="(m, i) in modes" :key="`stack-${m.name}`"
            class="v6-mode-card v6-reveal"
            :style="{ '--mode-c': isDark ? m.accent.dark[0] : m.accent.light[0] }"
          >
            <p class="v6-mode-tag"><span aria-hidden="true">0{{ i + 1 }}</span> {{ m.name }} — {{ m.tag }}</p>
            <h3>{{ m.headline }}</h3>
            <p class="v6-mode-copy">{{ m.copy }}</p>
            <ul>
              <li v-for="p in m.points" :key="p">{{ p }}</li>
            </ul>
            <RouterLink :to="`/${lang}/journal${m.path}`" class="v6-quiet v6-mode-link">
              {{ t('landing.modes.explore', { name: m.name }) }} <span aria-hidden="true">→</span>
            </RouterLink>
          </article>
        </div>
      </div>
    </section>

    <!-- CRAFT -->
    <section id="craft" class="v6-craft">
      <div class="v6-section-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('landing.craft.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('landing.craft.headlineA') }}<br />{{ t('landing.craft.headlineB') }}</h2>
      </div>
      <div class="v6-craft-grid">
        <article v-for="f in features" :key="f.title" :class="['v6-card', 'v6-reveal', f.span]">
          <span class="v6-card-icon" aria-hidden="true" v-html="f.icon"></span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.copy }}</p>
          <ul v-if="f.chips" class="v6-card-chips">
            <li v-for="c in f.chips" :key="c">{{ c }}</li>
          </ul>
        </article>
      </div>
    </section>

    <div class="v6-branch-divider">
      <svg class="v6-branch" viewBox="0 0 120 170" fill="none" aria-hidden="true">
        <path class="v6-branch-path" d="M58 166 C 64 142, 76 134, 74 112 C 72 94, 56 90, 54 70 C 52 52, 64 44, 62 22 M70 120 C 84 116, 96 118, 108 106 M56 80 C 40 76, 28 80, 16 68 M63 36 C 72 32, 78 34, 86 26" stroke-linecap="round" />
        <circle class="v6-branch-leaf" cx="109" cy="105" r="4" />
        <circle class="v6-branch-leaf" cx="98" cy="113" r="2.5" />
        <circle class="v6-branch-leaf" cx="15" cy="67" r="4" />
        <circle class="v6-branch-leaf" cx="26" cy="75" r="2.5" />
        <circle class="v6-branch-leaf" cx="87" cy="25" r="3" />
        <circle class="v6-branch-leaf" cx="62" cy="20" r="4" />
      </svg>
    </div>

    <!-- MANIFESTO -->
    <section id="manifesto" class="v6-manifesto">
      <div class="v6-manifesto-cycle" :aria-label="t('landing.manifesto.aria')">
        <span v-for="p in cyclePhrases" :key="p" class="v6-cycle-line" aria-hidden="true">{{ p }}</span>
      </div>
      <p ref="manifestoEl" class="v6-manifesto-text">
        <span v-for="(word, i) in manifestoWords" :key="i" class="v6-word">{{ word }}</span>
      </p>
      <div class="v6-manifesto-notes v6-reveal">
        <span v-for="note in manifestoNotes" :key="note">{{ note }}</span>
      </div>
    </section>

    <!-- MANIFESTO STATS -->
    <section class="v6-mstats">
      <div v-for="stat in manifestoStats" :key="stat.label" class="v6-mstat v6-reveal">
        <span class="v6-mstat-num"><b :data-count="stat.value">0</b><i>{{ stat.suffix }}</i></span>
        <span class="v6-mstat-label">{{ stat.label }}</span>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6-cta">
      <img class="v6-cta-logo v6-reveal" :src="asset('logo.png')" alt="" width="72" height="72" loading="lazy" />
      <h2 class="v6-cta-title v6-reveal">{{ t('landing.cta.titleA') }}<br /><em>{{ t('landing.cta.titleB') }}</em></h2>
      <p class="v6-cta-sub v6-reveal">{{ t('landing.cta.sub') }}</p>
      <div class="v6-cta-actions v6-reveal">
        <span class="v6-btn v6-btn-lg v6-btn-static" aria-disabled="true">{{ t('landing.cta.primary') }}</span>
        <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet">{{ t('landing.cta.secondary') }}</RouterLink>
      </div>
    </section>

    <!-- SYSTEM REQUIREMENTS (moved from the prelaunch page) -->
    <section id="system-requirements" class="v6-sysreq" :aria-label="t('sysreq.aria')">
      <div class="v6-sysreq-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('sysreq.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('sysreq.headline') }}</h2>
        <p class="v6-sysreq-sub v6-reveal">{{ t('sysreq.sub') }}</p>
      </div>
      <div class="v6-sysreq-grid v6-reveal">
        <div>
          <h3>{{ t('sysreq.runsOn.title') }}</h3>
          <ul>
            <li v-for="item in sysreqRunsOn" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div>
          <h3>{{ t('sysreq.requirements.title') }}</h3>
          <ul>
            <li v-for="item in sysreqRequirements" :key="item">{{ item }}</li>
          </ul>
        </div>
        <div>
          <h3>{{ t('sysreq.integration.title') }}</h3>
          <p>{{ t('sysreq.integration.body') }}</p>
        </div>
        <div>
          <h3>{{ t('sysreq.api.title') }}</h3>
          <p>{{ t('sysreq.api.body') }}</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { initMagnetic, prefersReducedMotion, setupCountUps, setupReveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`

const { t, tm, rt } = useI18n()
/* tm() returns raw message objects — rt() resolves each leaf to a plain string.
   Optional fields (a card without chips) must be skipped: rt(undefined) throws. */
const list = (key) => (tm(key) || []).map(rt)
const listOf = (key, fields) =>
  (tm(key) || []).map((entry) => Object.fromEntries(
    fields
      .filter((f) => entry?.[f] !== undefined)
      .map((f) => [f, Array.isArray(entry[f]) ? entry[f].map(rt) : rt(entry[f])])
  ))

const route = useRoute()
const isDark = inject("isDark")
const v6Accent = inject("v6Accent")
const v6Quiet = inject("v6Quiet")

/* Story slides ship a light and a dark screenshot; pick by active theme. */
const shot = (s) => asset(isDark.value ? s.imgD : s.imgL)

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const rootEl = ref(null)
const storyEl = ref(null)
const storyPinEl = ref(null)
const activeStory = ref(0)
const activeMode = ref(0)
const modesEl = ref(null)
const manifestoEl = ref(null)

/* ── hero typewriter — timing ported 1:1 from the old prelaunch page ── */
/* "proof." carries the local-first promise the sub-line spells out — the rest are
   virtues any journal could claim, so they stay the backdrop it lands against */
const typeWords = computed(() => list("landing.hero.typedWords"))
const typed = ref(typeWords.value[0] ?? "")
/* trailing dot rendered separately so it can take the ember accent —
   CJK writes it as the full-width 。, so both forms count */
const TERMINAL_DOT = /[.。]$/
const typedBody = computed(() => typed.value.replace(TERMINAL_DOT, ""))
const typedDot = computed(() => (TERMINAL_DOT.test(typed.value) ? typed.value.slice(-1) : ""))
let typingTimer = null

/* The lead line reads "<glitch word> with". The glitch word needs its own span,
   so we substitute a sentinel and keep only what follows it — the locale still
   controls word order (zh trails a particle where English leads with "with"). */
const LEAD_SENTINEL = "\u0000"
const headlineLeadRest = computed(() =>
  t("landing.hero.headlineLead", { word: LEAD_SENTINEL }).split(LEAD_SENTINEL)[1] ?? ""
)
const marqueeWords = computed(() => list("landing.marquee"))
const manifestoNotes = computed(() => list("landing.manifesto.notes"))
const cyclePhrases = computed(() => list("landing.manifesto.cycle"))
const sysreqRunsOn = computed(() => list("sysreq.runsOn.items"))
const sysreqRequirements = computed(() => list("sysreq.requirements.items"))

const HOLD_MS = 5000
/* fires once per word, exactly at the midpoint of its hold phase (word fully typed,
   not yet deleting) — the CRT glitch below listens to this instead of running its
   own clock, so it always lands while the typewriter is standing still. This is
   what keeps it in sync without hand-calculating each word's type/delete time. */
let onHoldMidpoint = null
let holdMidpointTimer = null

const startTypewriter = () => {
  const TYPE_WORDS = typeWords.value
  let wordIdx = 0
  let charIdx = TYPE_WORDS[0].length
  let deleting = false

  const scheduleHold = (holdMs) => {
    typingTimer = setTimeout(() => { deleting = true; tick() }, holdMs)
    holdMidpointTimer = setTimeout(() => onHoldMidpoint?.(), holdMs / 2)
  }

  const tick = () => {
    const word = TYPE_WORDS[wordIdx]
    if (deleting) {
      charIdx--
      typed.value = word.slice(0, charIdx)
      if (charIdx === 0) {
        deleting = false
        wordIdx = (wordIdx + 1) % TYPE_WORDS.length
        typingTimer = setTimeout(tick, 390)
      } else {
        typingTimer = setTimeout(tick, 100)
      }
    } else {
      charIdx++
      typed.value = TYPE_WORDS[wordIdx].slice(0, charIdx)
      /* headline grows — let the shell re-measure so the quiet zone covers
         the widest word (it keeps the widest edge it has seen) */
      requestAnimationFrame(() => v6Quiet?.refresh())
      if (charIdx === TYPE_WORDS[wordIdx].length) {
        scheduleHold(HOLD_MS)
      } else {
        typingTimer = setTimeout(tick, 115)
      }
    }
  }

  scheduleHold(4400)
}

/* ── CRT interference: "Trade" glitches into "Journal" and back ──
   Swaps only on a typewriter hold-midpoint (never mid-type/-delete). "Trade" rides
   out 2 hold-midpoints before swapping (~9-11s at the 5s hold above), "Journal"
   swaps back on the very next one (~5-6s) — adjust HOLDS_PER_STATE to retune. */
const glitchWords = computed(() => list("landing.hero.glitchWords"))
const glitchIdx = ref(0)
const glitchWord = computed(() => glitchWords.value[glitchIdx.value] ?? "")
const glitchOn = ref(false)
let glitchTimers = []
/* holds each state rides out before swapping — index 0 is the primary word */
const HOLDS_PER_STATE = [2, 1]
let holdsSinceSwap = 0

const startGlitchLoop = () => {
  holdsSinceSwap = 0
  onHoldMidpoint = () => {
    holdsSinceSwap++
    if (holdsSinceSwap < HOLDS_PER_STATE[glitchIdx.value]) return
    holdsSinceSwap = 0
    glitchOn.value = true
    /* swap the word mid-burst so the interference masks the change */
    glitchTimers.push(setTimeout(() => {
      glitchIdx.value = (glitchIdx.value + 1) % glitchWords.value.length
    }, 300))
    glitchTimers.push(setTimeout(() => { glitchOn.value = false }, 760))
  }
}

/* the numbers are structural; only their captions are translated */
const STAT_VALUES = [
  { value: 4, suffix: "" },
  { value: 100, suffix: "%" },
  { value: 6, suffix: "" },
  { value: 4, suffix: "" },
]
const stats = computed(() =>
  STAT_VALUES.map((s, i) => ({ ...s, label: list("landing.numbers.labels")[i] ?? "" }))
)

/* screenshots and their intrinsic sizes stay here; copy comes from the locale */
const SLIDE_MEDIA = [
  { imgL: "Screenshots/opt/hero_l.webp", imgD: "Screenshots/opt/hero_d.webp", w: 1600, h: 1000 },
  { imgL: "Screenshots/opt/accounts_f_l.webp", imgD: "Screenshots/opt/accounts_f_d.webp", w: 1600, h: 1000 },
  { imgL: "Screenshots/opt/calendar_f_l.webp", imgD: "Screenshots/opt/calendar_f_d.webp", w: 1600, h: 1000 },
  { imgL: "Screenshots/opt/analysis_f_l_1.webp", imgD: "Screenshots/opt/analysis_f_d_1.webp", w: 1600, h: 1000 },
]
const slides = computed(() => {
  const copy = listOf("landing.story.slides", ["headline", "accent", "title", "tag", "caption", "alt"])
  return SLIDE_MEDIA.map((media, i) => ({ ...media, ...copy[i] }))
})

/* Test flag: true = fold accordion (V5 layout concept), false = pinned stage */
const MODES_FOLDS = true

/* Each discipline retints the page accent AND the background
cles
   (via the shell's accent API). Funded keeps the legacy brand teal. */
const MODE_META = [
  { path: "/funded-accounts", accent: { dark: ["#22d3ee", "#67e8f9"], light: ["#0369a1", "#075985"] } },
  { path: "/prop-firm-challenges", accent: { dark: ["#facc15", "#fde68a"], light: ["#ab7503", "#8a5e02"] } },
  { path: "/personal-trading", accent: { dark: ["#4ade80", "#a7f3c0"], light: ["#047857", "#065f46"] } },
  { path: "/backtesting", accent: { dark: ["#818cf8", "#c4b5fd"], light: ["#6d28d9", "#5b21b6"] } },
]
const modes = computed(() => {
  const copy = listOf("landing.modes.items", ["name", "tag", "headline", "copy", "points"])
  return MODE_META.map((meta, i) => ({ ...meta, ...copy[i] }))
})

/* The manifesto reveals word by word. CJK has no spaces, so there it staggers
   per character instead — splitting on " " would yield one giant block. */
const manifestoWords = computed(() => {
  const text = t("landing.manifesto.text")
  if (/[一-鿿]/.test(text)) return [...text]
  return text.split(" ").map((w) => `${w} `)
})

/* deliberately does not repeat the hero numbers above (4 modes, 100% local) —
   these answer what the manifesto just claimed */
const MANIFESTO_VALUES = [
  { value: 0, suffix: "" },
  { value: 0, suffix: "" },
  { value: 1, suffix: "" },
]
const manifestoStats = computed(() =>
  MANIFESTO_VALUES.map((s, i) => ({ ...s, label: list("landing.manifesto.stats")[i] ?? "" }))
)

const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`

/* icon art and grid span are presentation; title/copy/chips come from the locale.
   Card 2's copy notes that sync is manual by design and Professional-only —
   both facts belong there, since its chips name the providers. */
const FEATURE_META = [
  { icon: icon('<path d="M16.86 4.49a1.87 1.87 0 1 1 2.65 2.65L7.5 19.14 4 20l.86-3.5L16.86 4.49z"/><path d="M15 6.5l2.5 2.5"/>'), span: "v6-span-7" },
  { icon: icon('<path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M4 21h16"/>'), span: "v6-span-5" },
  { icon: icon('<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"/><path d="M9.5 12l2 2 3.5-3.5"/>'), span: "v6-span-5" },
  { icon: icon('<path d="M6 3h9l4 4v14H6V3z"/><path d="M15 3v6h4"/><path d="M9 13l2.2 2.2L15 11"/>'), span: "v6-span-7" },
  { icon: icon('<path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z"/>'), span: "v6-span-6" },
  { icon: icon('<path d="M4 5h16"/><path d="M7 12h10"/><path d="M10 19h4"/>'), span: "v6-span-6" },
]
const features = computed(() => {
  const copy = listOf("landing.craft.items", ["title", "copy", "chips"])
  return FEATURE_META.map((meta, i) => {
    const { chips, ...rest } = copy[i] ?? {}
    return { ...meta, ...rest, chips: Array.isArray(chips) && chips.length ? chips : null }
  })
})

let gsapCtx = null
let storyTrigger = null
let modesTrigger = null
let cleanups = []

/* discipline → shell accent (page vars + background particles) */
watch(activeMode, (i) => v6Accent?.set(modes.value[i].accent))

const goToStory = (i) => {
  if (storyTrigger) {
    const { start, end } = storyTrigger
    const target = start + ((end - start) * (i + 0.5)) / slides.value.length
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  } else {
    activeStory.value = i
  }
}

const goToMode = (i) => {
  if (modesTrigger) {
    const { start, end } = modesTrigger
    const target = start + ((end - start) * (i + 0.5)) / modes.value.length
    window.scrollTo({ top: target, behavior: prefersReducedMotion() ? "auto" : "smooth" })
  } else {
    activeMode.value = i
  }
}

onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)

  cleanups.push(initMagnetic(rootEl.value))

  /* hand the hero copy to the shell so the particle river thins out behind it
     — replaces the old scrim, which showed its edge once the copy went wide */
  v6Quiet?.set([
    ...rootEl.value.querySelectorAll(".v6-hero-brand, .v6-hline-in, .v6-hero-sub, .v6-hero-actions"),
  ])
  cleanups.push(() => v6Quiet?.clear())

  startTypewriter()
  cleanups.push(() => { clearTimeout(typingTimer); clearTimeout(holdMidpointTimer); onHoldMidpoint = null })

  const reduced = prefersReducedMotion()

  if (!reduced) {
    startGlitchLoop()
    cleanups.push(() => { glitchTimers.forEach(clearTimeout); glitchTimers = [] })
  }

  gsapCtx = gsap.context(() => {
    if (reduced) {
      gsap.set(".v6-load, .v6-hline-in, .v6-reveal", { clearProps: "all", opacity: 1 })
      rootEl.value.querySelectorAll("[data-count]").forEach((el) => {
        el.textContent = el.dataset.count
      })
      return
    }

    /* hero entrance */
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } })
    intro
      .fromTo(".v6-load-h1a", { yPercent: 112 }, { yPercent: 0, duration: 1.0 }, 0.15)
      .fromTo(".v6-load-h1b", { yPercent: 112 }, { yPercent: 0, duration: 1.0 }, 0.28)
      .fromTo(".v6-load-1", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.1)
      .fromTo(".v6-load-2", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.55)
      .fromTo(".v6-load-3", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.7)
      .fromTo(".v6-load-4", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.0 }, 1.1)

    setupReveals()
    setupCountUps()

    /* bonsai dividers draw themselves while scrolling in */
    rootEl.value.querySelectorAll(".v6-branch").forEach((branch) => {
      const path = branch.querySelector(".v6-branch-path")
      const len = path.getTotalLength()
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: branch, start: "top 92%", end: "bottom 45%", scrub: 0.6 },
      })
      gsap.from(branch.querySelectorAll(".v6-branch-leaf"), {
        scale: 0,
        transformOrigin: "center",
        ease: "back.out(3)",
        stagger: 0.08,
        scrollTrigger: { trigger: branch, start: "top 55%", once: true },
      })
    })

    /* cycling local offline phrases: fade in, hold, fade out, next */
    const cycleLines = rootEl.value.querySelectorAll(".v6-cycle-line")
    if (cycleLines.length) {
      const cycleTl = gsap.timeline({ repeat: -1, paused: true })
      cycleLines.forEach((el) => {
        cycleTl
          .fromTo(el, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" })
          .to(el, { autoAlpha: 0, y: -8, duration: 0.5, ease: "power2.in" }, "+=1.4")
      })
      ScrollTrigger.create({
        trigger: ".v6-manifesto",
        start: "top 85%",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? cycleTl.play() : cycleTl.pause()),
      })
    }

    /* manifesto word-by-word ink reveal */
    if (manifestoEl.value) {
      gsap.fromTo(manifestoEl.value.querySelectorAll(".v6-word"),
        { opacity: 0.13 },
        {
          opacity: 1, stagger: 0.4, ease: "none",
          scrollTrigger: { trigger: manifestoEl.value, start: "top 78%", end: "bottom 45%", scrub: 0.4 },
        })
    }

    /* responsive scroll behavior: desktop stages pin */
    ScrollTrigger.matchMedia({
      "(min-width: 901px)": () => {
        /* refreshPriority makes ScrollTrigger refresh in document order, so the
           manifesto triggers further down include the pin-spacer offsets —
           without it they'd be measured pre-pin and fire ~7 viewports too early */
        storyTrigger = ScrollTrigger.create({
          trigger: storyPinEl.value,
          refreshPriority: 0,
          start: "top top",
          end: () => `+=${window.innerHeight * (slides.value.length - 1) * 1.1}`,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            const i = Math.min(slides.value.length - 1, Math.floor(self.progress * slides.value.length))
            if (activeStory.value !== i) activeStory.value = i
          },
        })
        if (!MODES_FOLDS) {
          modesTrigger = ScrollTrigger.create({
            trigger: modesEl.value,
            refreshPriority: 0,
            start: "top top",
            end: () => `+=${modes.value.length * 90}%`,
            pin: ".v6-modes-pin",
            anticipatePin: 1,
            onUpdate: (self) => {
              const i = Math.min(modes.value.length - 1, Math.floor(self.progress * modes.value.length))
              if (activeMode.value !== i) activeMode.value = i
            },
          })
        }
        return () => {
          storyTrigger?.kill()
          storyTrigger = null
          modesTrigger?.kill()
          modesTrigger = null
        }
      },
    })
  }, rootEl.value)
})

onBeforeUnmount(() => {
  gsapCtx?.revert()
  gsapCtx = null
  storyTrigger = null
  modesTrigger = null
  cleanups.forEach((off) => off && off())
  cleanups = []
  v6Accent?.clear()
})
</script>

<style scoped>
/* Page-specific styles — shared tokens/chrome live in src/styles/v6.css */

.v6-story-accent { color: var(--v6-gold-hi); }

/* ── hero ── */
.v6-hero {
  position: relative;
  z-index: 1;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(6rem, 16vh, 9rem) var(--v6-gutter) 4rem;
}
.v6-hero-inner { max-width: var(--v6-container); margin: 0 auto; width: 100%; position: relative; }
/* brand row: logo + wordmark like the nav brand but larger, dash, tagline in accent */
.v6-hero-brand { gap: 0.8rem; }
.v6-hero-brand img { display: block; border-radius: 10px; }
.v6-hero-brand b {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.9rem;
  letter-spacing: 0.01em;
  text-transform: none;
  line-height: 1;
  color: var(--v6-ink);
}
.v6-hero-sub {
  max-width: 34rem;
  color: var(--v6-muted);
  font-size: clamp(1rem, 1.4vw, 1.15rem);
}
.v6-hero-ownership {
  display: block;
  margin-top: 0.7rem;
  color: var(--v6-ink);
  font-family: var(--v6-mono);
  font-size: 0.68em;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ── CRT interference on the first H1 word ── */
.v6-crt { position: relative; display: inline-block; }
.v6-crt.on { animation: v6-crt-jitter 0.76s linear; }
.v6-crt.on::before,
.v6-crt.on::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  pointer-events: none;
}
/* orange ghost: brief flash early in the burst, gone by half-time */
.v6-crt.on::before {
  color: var(--v6-ember);
  animation: v6-crt-slice-a 0.34s linear forwards;
}
/* cyan ghost: carries the whole burst — larger offsets, soft glow */
.v6-crt.on::after {
  color: var(--v6-gold-hi);
  text-shadow: 0 0 14px color-mix(in srgb, var(--v6-gold) 55%, transparent);
  animation: v6-crt-slice-b 0.76s linear;
}
@keyframes v6-crt-jitter {
  0%, 100% { transform: none; opacity: 1; }
  10% { transform: translateX(-0.02em) skewX(-2deg); opacity: 0.85; }
  24% { transform: translateX(0.025em); opacity: 0.6; }
  38% { transform: translateX(-0.015em) skewX(1.5deg); opacity: 0.9; }
  52% { transform: translateX(0.02em) skewX(-1deg); opacity: 0.7; }
  68% { transform: translateX(-0.01em); opacity: 0.9; }
  84% { transform: none; opacity: 0.96; }
}
@keyframes v6-crt-slice-a {
  0%   { clip-path: inset(10% 0 64% 0); transform: translateX(-0.06em); opacity: 0.55; }
  35%  { clip-path: inset(48% 0 30% 0); transform: translateX(0.05em); opacity: 0.5; }
  70%  { clip-path: inset(72% 0 6% 0);  transform: translateX(-0.04em); opacity: 0.35; }
  100% { clip-path: inset(50% 0 50% 0); transform: none; opacity: 0; }
}
@keyframes v6-crt-slice-b {
  0%   { clip-path: inset(58% 0 16% 0); transform: translateX(0.09em); opacity: 0.95; }
  14%  { clip-path: inset(8% 0 70% 0);  transform: translateX(-0.07em); }
  28%  { clip-path: inset(34% 0 46% 0); transform: translateX(0.08em); }
  42%  { clip-path: inset(78% 0 4% 0);  transform: translateX(-0.09em); }
  56%  { clip-path: inset(12% 0 62% 0); transform: translateX(0.06em); }
  70%  { clip-path: inset(44% 0 36% 0); transform: translateX(-0.05em); opacity: 0.85; }
  85%  { clip-path: inset(24% 0 58% 0); transform: translateX(0.03em); opacity: 0.6; }
  100% { clip-path: inset(50% 0 50% 0); transform: none; opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .v6-crt.on, .v6-crt.on::before, .v6-crt.on::after { animation: none; }
  .v6-crt.on::before, .v6-crt.on::after { content: none; }
}

/* ── hero typewriter ── */
.v6-typed-line { white-space: nowrap; }
.v6-type-dot { color: var(--v6-ember); font-weight: inherit; }
.v6-type-cursor {
  display: inline-block;
  color: var(--v6-gold);
  font-weight: 300;
  font-style: normal;
  margin-left: 0.04em;
  animation: v6-cursor-blink 0.75s step-end infinite;
}
@keyframes v6-cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .v6-type-cursor { animation: none; }
}
.v6-hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.4rem;
  margin-top: 2.4rem;
}
.v6-hero-hint {
  position: absolute;
  bottom: 1.6rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6-hero-hint span {
  width: 1px;
  height: 44px;
  background: linear-gradient(to bottom, transparent, var(--v6-gold));
  animation: v6-drip 2.2s ease-in-out infinite;
}
@keyframes v6-drip {
  0% { transform: scaleY(0); transform-origin: top; }
  45% { transform: scaleY(1); transform-origin: top; }
  55% { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

/* ── marquee ── */
.v6-marquee {
  position: relative;
  z-index: 1;
  overflow: hidden;
  border-block: 1px solid var(--v6-line);
  padding: 0.85rem 0;
  mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
.v6-marquee-track {
  display: flex;
  width: max-content;
  animation: v6-marquee 36s linear infinite;
}
.v6-marquee-seq {
  white-space: nowrap;
  font-family: var(--v6-mono);
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--v6-faint);
  padding-right: 0.6rem;
}
.v6-marquee-seq i { color: var(--v6-gold); font-style: normal; padding: 0 0.5rem; }
@keyframes v6-marquee { to { transform: translateX(-50%); } }

/* ── numbers ── */
.v6-numbers {
  position: relative;
  z-index: 1;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(4rem, 9vh, 6.5rem) var(--v6-gutter);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}
.v6-num { display: flex; flex-direction: column; gap: 0.4rem; }
.v6-num-val {
  font-family: var(--v6-mono);
  font-size: clamp(2.1rem, 4.4vw, 3.3rem);
  color: var(--v6-ink);
  line-height: 1;
}
.v6-num-val i { color: var(--v6-gold); font-style: normal; }
.v6-num-label {
  font-family: var(--v6-mono);
  font-size: 0.74rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── story (pinned) ── */
.v6-story { position: relative; z-index: 1; }
.v6-story-pin {
  min-height: 100vh;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(4rem, 10vh, 6rem) var(--v6-gutter);
  display: grid;
  grid-template-columns: minmax(320px, 5fr) 7fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}
.v6-story-steps { position: relative; margin-top: 2.6rem; min-height: 11rem; }
.v6-story-step {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.45s ease, transform 0.45s ease;
  pointer-events: none;
}
.v6-story-step.active { opacity: 1; transform: none; }
.v6-story-num {
  font-family: var(--v6-mono);
  font-size: 0.78rem;
  color: var(--v6-ember);
  letter-spacing: 0.16em;
}
.v6-story-step h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.45rem;
  letter-spacing: -0.015em;
  margin: 0.5rem 0 0.7rem;
}
.v6-story-step h3 em, .v6-stack-item strong em {
  font-style: italic;
  font-weight: 500;
  color: var(--v6-gold);
  font-size: 0.9em;
}
.v6-story-step p { color: var(--v6-muted); max-width: 26rem; margin: 0; }
.v6-story-dots { display: flex; gap: 0.6rem; margin-top: 2.2rem; }
.v6-story-dots button {
  width: 30px;
  height: 4px;
  border: 0;
  border-radius: 2px;
  background: var(--v6-line);
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.v6-story-dots button.active { background: var(--v6-gold); }
.v6-story-stage { position: relative; aspect-ratio: 16 / 10; }
.v6-story-shot {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  transform: scale(0.965);
  transition: opacity 0.55s ease, transform 0.55s ease;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--v6-line-strong);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8), 0 0 60px -20px rgba(34, 211, 238, 0.14);
  background: var(--v6-bg-soft);
}
.v6-story-shot.active { opacity: 1; transform: none; }
.v6-story-shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
  display: block;
}
.v6-story-stack { display: none; }
.v6.light .v6-story-shot,
.v6.light .v6-stack-frame {
  box-shadow: 0 30px 70px -32px rgba(15, 30, 45, 0.45), 0 0 50px -24px rgba(3, 105, 161, 0.18);
}

/* ── modes (pinned discipline stage) ── */
.v6-modes {
  position: relative;
  z-index: 1;
  padding-top: clamp(1rem, 3vh, 2.5rem);
}
.v6-modes-pin { padding-bottom: clamp(3rem, 8vh, 5rem); }
.v6-modes-stage {
  display: grid;
  grid-template-columns: minmax(280px, 0.9fr) 1.4fr;
  gap: clamp(2rem, 5vw, 5rem);
  align-items: center;
  max-width: var(--v6-container);
  margin: clamp(2.5rem, 6vh, 4rem) auto 0;
  padding: 0 var(--v6-gutter);
  min-height: 46vh;
}
.v6-modes-count {
  display: block;
  font-family: var(--v6-mono);
  font-size: clamp(4.5rem, 8vw, 7.5rem);
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--v6-gold);
  opacity: 0.85;
  transition: -webkit-text-stroke-color 0.5s ease;
}
.v6-modes-names {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
  margin-top: 1.6rem;
}
.v6-modes-names button {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  background: none;
  border: none;
  padding: 0.35rem 0;
  cursor: pointer;
  font-family: var(--v6-display);
  font-size: clamp(1.15rem, 1.9vw, 1.55rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--v6-faint);
  transition: color 0.35s ease;
}
.v6-modes-names button em {
  width: 20px;
  height: 1px;
  background: var(--v6-gold);
  opacity: 0;
  transform: scaleX(0.4);
  transform-origin: left;
  transition: opacity 0.35s ease, transform 0.35s ease, background-color 0.5s ease;
}
.v6-modes-names button.active { color: var(--v6-ink); }
.v6-modes-names button.active em { opacity: 1; transform: scaleX(1); }
.v6-modes-names button:hover { color: var(--v6-muted); }
.v6-modes-names button.active:hover { color: var(--v6-ink); }
.v6-mode-card {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  padding: clamp(1.6rem, 3vw, 2.6rem);
  background: linear-gradient(165deg, var(--v6-panel), rgba(13, 22, 38, 0.22));
}
.v6.light .v6-mode-card {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(248, 250, 252, 0.4));
}
.v6-mode-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--mode-c, var(--v6-gold));
  opacity: 0.85;
  transition: background-color 0.5s ease;
}
.v6-mode-tag {
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--mode-c, var(--v6-gold));
  transition: color 0.5s ease;
}
.v6-mode-tag span { opacity: 0.6; margin-right: 0.4rem; }
.v6-mode-card h3 {
  margin: 0.9rem 0 0;
  font-family: var(--v6-display);
  font-size: clamp(1.6rem, 2.6vw, 2.3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
.v6-mode-copy {
  margin: 0.9rem 0 0;
  color: var(--v6-muted);
  max-width: 34rem;
}
.v6-mode-card ul {
  list-style: none;
  margin: 1.4rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}
.v6-mode-card li {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  color: var(--v6-muted);
  font-size: 0.95rem;
}
.v6-mode-card li::before {
  content: "";
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  margin-top: 0.55em;
  border-radius: 999px;
  background: var(--mode-c, var(--v6-gold));
  box-shadow: 0 0 12px var(--mode-c, var(--v6-gold));
  transition: background-color 0.5s ease;
}
.v6-mode-link { margin-top: 1.2rem; padding-bottom: 0; }
.v6-mode-enter-active, .v6-mode-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.v6-mode-enter-from { opacity: 0; transform: translateY(22px); }
.v6-mode-leave-to { opacity: 0; transform: translateY(-16px); }
.v6-modes-stack { display: none; }

/* ── modes: fold accordion (test — V5 layout concept) ── */
.v6-folds {
  display: flex;
  gap: 0.8rem;
  max-width: var(--v6-container);
  height: 540px;
  margin: clamp(2.5rem, 6vh, 4rem) auto 0;
  padding: 0 var(--v6-gutter);
}
.v6-fold {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(13, 22, 38, 0.22));
  transition: flex-grow 0.85s cubic-bezier(0.32, 0.72, 0.15, 1), border-color 0.5s ease;
}
.v6.light .v6-fold { background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(248, 250, 252, 0.4)); }
.v6-fold:hover { border-color: color-mix(in srgb, var(--mode-c) 35%, var(--v6-line)); }
.v6-fold.open {
  flex-grow: 3.1;
  border-color: color-mix(in srgb, var(--mode-c) 45%, var(--v6-line));
}
.v6-fold::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--mode-c, var(--v6-gold));
  opacity: 0;
  transition: opacity 0.5s ease;
}
.v6-fold.open::before { opacity: 0.85; }
.v6-fold-head {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  padding: 1.5rem 1.6rem;
  font: inherit;
  color: inherit;
  text-align: left;
}
.v6-fold-num {
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  color: var(--v6-faint);
}
.v6-fold-name {
  writing-mode: vertical-rl;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--mode-c) 45%, var(--v6-faint));
  transition: color 0.35s ease;
}
.v6-fold:hover .v6-fold-name { color: color-mix(in srgb, var(--mode-c) 75%, var(--v6-faint)); }
.v6-fold.open .v6-fold-name { color: var(--mode-c); }
.v6-fold-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--mode-c, var(--v6-gold));
  box-shadow: 0 0 12px var(--mode-c, var(--v6-gold));
}
.v6-fold-body {
  position: absolute;
  top: 0;
  bottom: 0;
  left: clamp(4.6rem, 6vw, 5.8rem);
  width: clamp(300px, 28vw, 460px);
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateX(14px);
  transition: opacity 0.4s 0s, transform 0.4s 0s;
  pointer-events: none;
}
.v6-fold.open .v6-fold-body {
  opacity: 1;
  transform: translateX(0);
  transition: opacity 0.6s 0.3s, transform 0.7s 0.3s;
  pointer-events: auto;
}
.v6-fold-body-in { padding: 1.5rem 1.5rem 1.5rem 0; }
.v6-fold-body h3 {
  margin: 0.9rem 0 0;
  font-family: var(--v6-display);
  font-size: clamp(1.4rem, 2vw, 1.9rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.08;
}
.v6-fold-body ul {
  list-style: none;
  margin: 1.2rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
}
.v6-fold-body li {
  display: flex;
  gap: 0.7rem;
  align-items: flex-start;
  color: var(--v6-muted);
  font-size: 0.92rem;
}
.v6-fold-body li::before {
  content: "";
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  margin-top: 0.55em;
  border-radius: 999px;
  background: var(--mode-c, var(--v6-gold));
  box-shadow: 0 0 12px var(--mode-c, var(--v6-gold));
}

/* ── craft ── */
.v6-craft {
  position: relative;
  z-index: 1;
  padding: clamp(5rem, 12vh, 9rem) 0;
}
.v6-craft-grid {
  max-width: var(--v6-container);
  margin: 3.2rem auto 0;
  padding: 0 clamp(1.1rem, 4vw, 3rem);
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.1rem;
}
.v6-span-5 { grid-column: span 5; }
.v6-span-6 { grid-column: span 6; }
.v6-span-7 { grid-column: span 7; }

/* ── manifesto ── */
.v6-manifesto {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(1rem, 3vh, 2.5rem) var(--v6-gutter) clamp(6rem, 16vh, 11rem);
  text-align: center;
}
.v6-branch-divider {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: clamp(3rem, 7vh, 5rem) 0;
}
.v6-branch { width: 84px; height: auto; display: block; }
.v6-branch-path { stroke: var(--v6-gold); stroke-width: 2.4; opacity: 0.75; }
.v6-branch-leaf { fill: var(--v6-ember); }
.v6-manifesto-text {
  font-family: var(--v6-display);
  font-size: clamp(1.5rem, 3.4vw, 2.6rem);
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.02em;
  margin: 0;
}
.v6-word { display: inline-block; }
.v6-manifesto-cycle {
  display: grid;
  justify-items: center;
  min-height: 1.25em;
  margin-bottom: 2.4rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.9rem, 4.4vw, 3.3rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--v6-gold);
}
.v6-cycle-line { grid-area: 1 / 1; opacity: 0; will-change: transform, opacity; }
.v6-manifesto-notes {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.2rem 2.2rem;
  margin-top: 2.6rem;
}
.v6-manifesto-notes span {
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  color: var(--v6-faint);
}

/* ── manifesto stats ── */
.v6-mstats {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 clamp(1.1rem, 4vw, 3rem) clamp(4rem, 10vh, 7rem);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.1rem;
}
.v6-mstat {
  border-top: 1px solid var(--v6-line);
  padding-top: 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.v6-mstat-num {
  font-family: var(--v6-mono);
  font-size: clamp(2.6rem, 5vw, 4rem);
  color: var(--v6-gold);
  line-height: 1;
}
.v6-mstat-num b { font-weight: 400; }
.v6-mstat-num i { color: var(--v6-gold-hi); font-style: normal; }
.v6-mstat-label { color: var(--v6-muted); font-size: 0.92rem; }

/* ── cta ── */
.v6-cta {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: clamp(6rem, 16vh, 11rem) var(--v6-gutter) clamp(7rem, 18vh, 12rem);
  border-top: 1px solid var(--v6-line);
}
.v6-cta-logo { margin: 0 auto 1.6rem; display: block; }
.v6-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.6rem, 7.4vw, 5.6rem);
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin: 0 0 1.1rem;
}
.v6-cta-title em {
  font-style: italic;
  font-weight: 600;
  color: var(--v6-gold-hi);
}
.v6-cta-sub { color: var(--v6-muted); margin: 0 0 2.4rem; }
.v6-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── system requirements ── */
.v6-sysreq {
  position: relative;
  z-index: 1;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(3rem, 8vh, 5rem) var(--v6-gutter) clamp(5rem, 12vh, 8rem);
}

/* At the desktop pin exit, the screenshot still occupies the upper part of
   the viewport. Lift only the following divider so its visible distance to
   that screenshot and to the next heading reads as one balanced interval. */
@media (min-width: 901px) {
  .v6-story + .v6-branch-divider .v6-branch {
    transform: translateY(clamp(-6rem, -10vh, -4rem));
  }
}
.v6-sysreq-head { max-width: 44rem; margin-bottom: 2.2rem; }
.v6-sysreq-sub { color: var(--v6-muted); font-size: 0.94rem; margin: 1.2rem 0 0; }
.v6-sysreq-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6-sysreq-grid {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6-sysreq-grid > div {
  padding: 1.4rem clamp(1.1rem, 2vw, 1.5rem);
  border-right: 1px solid var(--v6-line);
}
.v6-sysreq-grid > div:last-child { border-right: 0; }
.v6-sysreq-grid h3 {
  margin: 0 0 0.9rem;
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-gold);
  font-weight: 500;
}
.v6-sysreq-grid ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.v6-sysreq-grid li {
  position: relative;
  padding-left: 1rem;
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.5;
}
.v6-sysreq-grid li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.56em;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--v6-gold);
  opacity: 0.7;
}
.v6-sysreq-grid p {
  margin: 0;
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.6;
}

/* ── responsive ── */
@media (max-width: 1100px) {
  .v6-span-5, .v6-span-6, .v6-span-7 { grid-column: span 6; }
}
@media (max-width: 900px) {
  .v6-numbers { grid-template-columns: repeat(2, 1fr); gap: 2.2rem 1.2rem; }
  .v6-sysreq-grid { grid-template-columns: 1fr; }
  .v6-sysreq-grid > div { border-right: 0; border-bottom: 1px solid var(--v6-line); }
  .v6-sysreq-grid > div:last-child { border-bottom: 0; }
  .v6-story-pin { display: none; }
  .v6-story-stack {
    display: flex;
    flex-direction: column;
    gap: 3.4rem;
    max-width: var(--v6-container);
    margin: 0 auto;
    padding: clamp(4rem, 10vh, 6rem) clamp(1.1rem, 4vw, 3rem);
  }
  .v6-stack-item { margin: 0; }
  .v6-stack-frame {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--v6-line-strong);
    background: var(--v6-bg-soft);
    box-shadow: 0 24px 60px -28px rgba(0, 0, 0, 0.8);
  }
  .v6-stack-frame img { display: block; width: 100%; height: auto; }
  .v6-stack-item figcaption {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-top: 1rem;
  }
  .v6-stack-item strong {
    font-family: var(--v6-display);
    font-size: 1.15rem;
    letter-spacing: -0.01em;
  }
  .v6-stack-item figcaption > span:last-child { color: var(--v6-muted); font-size: 0.95rem; }
  .v6-modes-stage { display: none; }
  .v6-folds { display: none; }
  .v6-modes-stack {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    max-width: var(--v6-container);
    margin: 2.5rem auto 0;
    padding: 0 clamp(1.1rem, 4vw, 3rem);
  }
}
@media (max-width: 640px) {
  .v6-span-5, .v6-span-6, .v6-span-7 { grid-column: span 12; }
  .v6-hero { padding-top: 7.5rem; padding-bottom: 5.5rem; }
  .v6-hero-sub { line-height: 1.65; }
  .v6-story-stack { gap: 2.6rem; }
  .v6-stack-item figcaption { padding-top: 0.85rem; }
  .v6-modes-stack { gap: 0.9rem; margin-top: 2rem; }
  .v6-craft { padding-block: 4rem; }
  .v6-craft-grid { margin-top: 2.2rem; }
  .v6-sysreq-grid > div { padding: 1.2rem; }
  .v6-mstats { grid-template-columns: 1fr; gap: 2rem; }
}
@media (max-width: 420px) {
  .v6-hero-actions,
  .v6-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6-hero-actions .v6-quiet,
  .v6-cta-actions .v6-quiet { justify-content: center; }
  .v6-hero-hint { display: none; }
  .v6-typed-line { white-space: normal; }
}

/* ── reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .v6-marquee-track { animation: none; }
  .v6-manifesto-cycle { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem 1.6rem; }
  .v6-cycle-line { opacity: 1; }
  .v6-hero-hint span { animation: none; transform: none; }
  .v6-story-step, .v6-story-shot,
  .v6-modes-count, .v6-modes-names button, .v6-modes-names button em { transition: none; }
  .v6-fold, .v6-fold-body, .v6-fold-name { transition: none; }
}
</style>
