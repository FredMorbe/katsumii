<template>
  <main ref="rootEl" class="mc">
    <!-- HERO -->
    <section class="mc-hero">
      <div class="mc-hero-copy">
        <p class="mc-brand v6-reveal">
          <span class="mc-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l5.5-3.5z" /></svg></span>
          <span><strong>{{ t('products.mediacenter.name') }}</strong><small>{{ t('mediacenterPage.hero.brandSub') }}</small></span>
        </p>
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('mediacenterPage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('mediacenterPage.hero.h1.pre') }} <em>{{ t('mediacenterPage.hero.h1.em') }}</em><b class="v6-dot">.</b></h1>
        <p class="mc-sub v6-reveal">{{ t('mediacenterPage.hero.sub') }}</p>
        <ul class="v6-card-chips v6-reveal">
          <li v-for="c in chips" :key="c">{{ c }}</li>
        </ul>
        <div class="mc-actions v6-reveal">
          <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-magnetic">{{ t('mediacenterPage.hero.cta') }} <span aria-hidden="true">→</span></RouterLink>
          <a href="#inside" class="v6-quiet v6-magnetic">{{ t('mediacenterPage.hero.more') }}</a>
        </div>
      </div>

      <figure class="mc-stage v6-reveal">
        <span class="mc-window">
          <img
            v-zoom
            :src="shot(SHOTS[0])"
            :alt="shots[0].alt"
            width="1600"
            height="929"
            decoding="async"
          />
        </span>
      </figure>
    </section>

    <!-- DEVELOPMENT NOTICE -->
    <section class="mc-notice">
      <aside class="mc-dev v6-card v6-reveal" role="note">
        <span class="mc-dev-dot" aria-hidden="true"></span>
        <div>
          <h2 class="mc-dev-title">{{ t('mediacenterPage.dev.title') }}</h2>
          <p>{{ t('mediacenterPage.dev.copy') }}</p>
          <RouterLink :to="`/${lang}/contact`" class="mc-link">{{ t('mediacenterPage.dev.link') }} <span aria-hidden="true">→</span></RouterLink>
        </div>
      </aside>
    </section>

    <!-- INSIDE -->
    <section id="inside" class="mc-section">
      <header class="mc-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('mediacenterPage.inside.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('mediacenterPage.inside.title.pre') }} <em>{{ t('mediacenterPage.inside.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="mc-lead v6-reveal">{{ t('mediacenterPage.inside.sub') }}</p>
      </header>
      <div class="mc-features">
        <article v-for="(f, i) in inside" :key="f.title" class="v6-card mc-feature v6-reveal">
          <span class="v6-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="ICONS[i]" /></svg>
          </span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.copy }}</p>
        </article>
      </div>
    </section>

    <!-- IN PICTURES -->
    <section class="mc-section">
      <header class="mc-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('mediacenterPage.shots.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('mediacenterPage.shots.title.pre') }} <em>{{ t('mediacenterPage.shots.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="mc-lead v6-reveal">{{ t('mediacenterPage.shots.sub') }}</p>
      </header>
      <div class="mc-gallery">
        <figure v-for="s in gallery" :key="s.name" class="mc-shot v6-reveal">
          <span class="mc-window">
            <img
              v-zoom
              :src="shot(s.name)"
              :alt="s.alt"
              width="1600"
              :height="SHOT_HEIGHT[s.name] || 929"
              loading="lazy"
              decoding="async"
            />
          </span>
          <figcaption>{{ s.caption }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- STATUS -->
    <section class="mc-section">
      <header class="mc-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('mediacenterPage.status.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('mediacenterPage.status.title.pre') }} <em>{{ t('mediacenterPage.status.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="mc-lead v6-reveal">{{ t('mediacenterPage.status.sub') }}</p>
      </header>
      <div class="mc-status">
        <article class="v6-card mc-state v6-reveal">
          <p class="mc-state-label">{{ t('mediacenterPage.status.works.label') }}</p>
          <ul class="mc-list works">
            <li v-for="item in works" :key="item">{{ item }}</li>
          </ul>
        </article>
        <article class="v6-card mc-state v6-reveal">
          <p class="mc-state-label">{{ t('mediacenterPage.status.testing.label') }}</p>
          <ul class="mc-list testing">
            <li v-for="item in testing" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <!-- CALM -->
    <section class="mc-section">
      <header class="mc-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('mediacenterPage.calm.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('mediacenterPage.calm.title.pre') }} <em>{{ t('mediacenterPage.calm.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>
      <ul class="mc-calm">
        <li v-for="c in calm" :key="c.title" class="v6-reveal">
          <strong>{{ c.title }}</strong>
          <span>{{ c.copy }}</span>
        </li>
      </ul>
      <p class="mc-calm-foot v6-reveal">{{ t('mediacenterPage.calm.spec') }}</p>
    </section>

    <!-- CTA -->
    <section class="mc-cta v6-reveal">
      <span class="mc-mark mc-mark-lg" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M10 8.5v7l5.5-3.5z" /></svg></span>
      <h2 class="mc-cta-title">{{ t('mediacenterPage.cta.title.pre') }} <em>{{ t('mediacenterPage.cta.title.em') }}</em><b class="v6-dot">.</b></h2>
      <p class="mc-lead">{{ t('mediacenterPage.cta.sub') }}</p>
      <div class="mc-cta-actions">
        <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('mediacenterPage.cta.button') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="{ path: `/${lang}/sandbox`, hash: '#apps' }" class="v6-quiet">{{ t('mediacenterPage.cta.studio') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"

const { t, tm, rt } = useI18n()
const route = useRoute()
const baseUrl = import.meta.env.BASE_URL

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* structure only — every string lives in mediacenterPage; the screenshots show the app's own UI, one set for all locales */
const SHOTS = ["start", "detail", "library", "music", "series"]
const SHOT_HEIGHT = { detail: 602, library: 602 } /* these two are cropped to the part the app fills; all other shots are 1600×929 */
const ICONS = [
  "M4 5h16v14H4zM8 5v14M16 5v14M4 9h4M4 15h4M16 9h4M16 15h4",
  "M9 18V6l10-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM19 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z",
  "M4 10h16v9H4zM7 10l10-6M15 14.5h2M7 14.5h4",
  "M4 6h16v11H4zM9 21h6M12 17v4",
  "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM10 8.5v7l5.5-3.5z",
  "M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3zM6 18v2M18 18v2",
]

const shot = (name) => `${baseUrl}mediacenter/shots/${name}.webp`

const list = (key) => (tm(key) || []).map(rt)
const zip = (key, fields) => (tm(key) || []).map((item) => Object.fromEntries(fields.map((f) => [f, rt(item[f])])))
const chips = computed(() => list("mediacenterPage.hero.chips"))
const inside = computed(() => zip("mediacenterPage.inside.items", ["title", "copy"]))
const shots = computed(() => zip("mediacenterPage.shots.items", ["caption", "alt"]))
/* the first shot leads the hero — the gallery shows the rest */
const gallery = computed(() => shots.value.map((s, i) => ({ ...s, name: SHOTS[i] })).slice(1))
const works = computed(() => list("mediacenterPage.status.works.items"))
const testing = computed(() => list("mediacenterPage.status.testing.items"))
const calm = computed(() => zip("mediacenterPage.calm.items", ["title", "copy"]))

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
.mc { position: relative; z-index: 1; }

/* ── hero ── */
.mc-hero {
  position: relative;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) var(--v6-page-hero-bottom);
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: clamp(1.5rem, 4vw, 4rem);
  align-items: center;
}
.mc-hero .v6-h1 { font-size: clamp(2.3rem, 4.6vw, 4rem); }
.mc-brand { display: flex; align-items: center; gap: 0.9rem; margin: 0 0 1.6rem; }
.mc-brand span:last-child { display: flex; flex-direction: column; line-height: 1.15; }
.mc-brand strong { font-family: var(--v6-display); font-weight: 700; font-size: 1.35rem; letter-spacing: 0.02em; }
.mc-brand small { font-family: var(--v6-mono); font-size: 0.66rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--v6-gold); }
.mc-mark {
  display: inline-grid;
  place-items: center;
  flex: none;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  color: var(--v6-gold-hi);
  background: color-mix(in srgb, var(--v6-gold) 12%, transparent);
  box-shadow: 0 0 0 1px var(--v6-line-strong), 0 10px 30px -10px rgba(0, 0, 0, 0.6);
}
.mc-mark svg { width: 26px; height: 26px; }
.mc-mark-lg { width: 72px; height: 72px; border-radius: 18px; }
.mc-mark-lg svg { width: 40px; height: 40px; }
.mc-sub { max-width: 34rem; color: var(--v6-muted); }
.mc-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1.2rem; margin-top: 2.2rem; }

.mc-stage { position: relative; margin: 0; min-width: 0; }
/* a soft pool of light behind the window */
.mc-stage::before {
  content: "";
  position: absolute;
  inset: -8% -4%;
  background: radial-gradient(ellipse 60% 55% at 50% 52%, color-mix(in srgb, var(--v6-gold) 14%, transparent), transparent 70%);
  pointer-events: none;
}
/* the app window that frames every screenshot */
.mc-window {
  position: relative;
  display: block;
  padding: 5px;
  border-radius: 18px;
  background: linear-gradient(160deg, rgba(148, 163, 184, 0.28), rgba(148, 163, 184, 0.06));
  box-shadow: 0 30px 60px -28px rgba(0, 0, 0, 0.75);
}
.mc-window img { display: block; width: 100%; height: auto; border-radius: 13px; background: var(--v6-bg-soft); }

/* ── development notice ── */
.mc-notice { max-width: var(--v6-container); margin: 0 auto; padding: 0 var(--v6-gutter); }
.mc-dev { display: flex; align-items: flex-start; gap: 1.1rem; border-color: var(--v6-line-strong); }
.mc-dev > div { min-width: 0; }
.mc-dev-dot {
  position: relative;
  flex: none;
  width: 12px;
  height: 12px;
  margin-top: 0.55rem;
  border-radius: 50%;
  background: var(--v6-gold);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--v6-gold) 18%, transparent), 0 0 24px 4px color-mix(in srgb, var(--v6-gold) 55%, transparent);
}
.mc-dev-dot::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid var(--v6-gold);
  animation: mc-ping 3s ease-out infinite;
}
@keyframes mc-ping { from { transform: scale(1); opacity: 0.7; } to { transform: scale(4.2); opacity: 0; } }
.mc-dev-title { margin: 0; font-family: var(--v6-display); font-weight: 700; font-size: 1.3rem; letter-spacing: -0.01em; }
.mc-dev p { margin: 0.5rem 0 0; max-width: 46rem; color: var(--v6-muted); }
.mc-link { display: inline-block; margin-top: 0.9rem; color: var(--v6-gold-hi); text-decoration: none; font-family: var(--v6-display); font-weight: 700; }
.mc-link:hover { text-decoration: underline; text-underline-offset: 4px; }

/* ── sections ── */
.mc-section {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block) var(--v6-gutter);
  scroll-margin-top: 4.5rem;
}
.mc-head { margin-bottom: clamp(1.8rem, 4vw, 3rem); }
.mc-lead { max-width: 38rem; margin: 1.2rem 0 0; color: var(--v6-muted); }

/* ── inside ── */
.mc-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(0.9rem, 2vw, 1.4rem); }

/* ── in pictures ── */
.mc-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(1rem, 2.4vw, 1.8rem); align-items: start; }
.mc-shot { margin: 0; min-width: 0; }
.mc-shot figcaption {
  margin-top: 0.85rem;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-muted);
}

/* ── status ── */
.mc-status { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(0.9rem, 2vw, 1.4rem); }
.mc-state-label {
  margin: 0 0 1.1rem;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.mc-list { list-style: none; display: grid; gap: 0.7rem; margin: 0; padding: 0; }
.mc-list li { position: relative; padding-left: 1.7rem; color: var(--v6-muted); }
.mc-list li::before { content: ""; position: absolute; left: 0; top: 0.5em; width: 0.85rem; height: 0.85rem; border-radius: 50%; box-sizing: border-box; }
.mc-list.works li::before { background: var(--v6-gold); box-shadow: 0 0 0 3px color-mix(in srgb, var(--v6-gold) 20%, transparent); }
.mc-list.testing li::before { border: 1.5px dashed var(--v6-gold); }

/* ── calm ── */
.mc-calm {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem clamp(1.2rem, 3vw, 2.4rem);
  margin: 0;
  padding: 1.4rem 0 0;
  border-top: 1px solid var(--v6-line);
}
.mc-calm li { display: grid; align-content: start; gap: 0.35rem; color: var(--v6-muted); }
.mc-calm strong { font-family: var(--v6-display); font-size: 1.1rem; color: var(--v6-ink); letter-spacing: -0.01em; }
.mc-calm-foot {
  margin: 1.8rem 0 0;
  font-family: var(--v6-mono);
  font-size: 0.7rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── cta ── */
.mc-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
  text-align: center;
}
.mc-cta .mc-mark { margin: 0 auto; }
.mc-cta-title {
  margin: 1.4rem 0 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.2rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
}
.mc-cta-title em { font-style: italic; font-weight: 600; color: var(--v6-gold-hi); }
.mc-cta .mc-lead { margin: 1rem auto 2.2rem; }
.mc-cta-actions { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 1.6rem; }

/* ── responsive ── */
@media (max-width: 1100px) {
  .mc-features { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  /* the window leads on a phone, the copy follows */
  .mc-hero { grid-template-columns: 1fr; padding-top: 5.5rem; }
  .mc-stage { order: -1; }
  .mc-status, .mc-calm, .mc-gallery { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .mc-features { grid-template-columns: 1fr; }
}
@media (max-width: 420px) {
  .mc-actions, .mc-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .mc-actions .v6-quiet, .mc-cta-actions .v6-quiet { justify-content: center; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-dev-dot::after { animation: none; }
}
</style>
