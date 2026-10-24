<template>
  <main ref="rootEl" class="std">
    <StudioGalaxy />

    <!-- APPS -->
    <section id="apps" class="std-section">
      <header class="std-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.page.apps.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('studio.page.apps.title.pre') }} <em>{{ t('studio.page.apps.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="std-lead v6-reveal">{{ t('studio.page.apps.sub') }}</p>
      </header>

      <div class="std-apps">
        <article
          v-for="(p, i) in PRODUCTS"
          :id="`apps-${p.key}`"
          :key="p.key"
          class="v6-card std-app v6-reveal"
          :style="accentStyle(p)"
        >
          <div class="std-app-shot">
            <img
              v-if="p.shot"
              :src="shotSrc(p)"
              :alt="t('studio.page.apps.shotAlt', { name: t(`products.${p.key}.name`) })"
              width="1600"
              height="1000"
              loading="lazy"
              decoding="async"
            />
            <span v-else class="std-app-shot-empty">{{ t('studio.page.apps.preview', { name: t(`products.${p.key}.name`) }) }}</span>
          </div>
          <p class="std-app-cat"><span class="std-star" aria-hidden="true"></span>KAT-0{{ i + 1 }}</p>
          <h3>{{ t(`products.${p.key}.name`) }}</h3>
          <p class="std-app-tag">{{ t(`products.${p.key}.tagline`) }}</p>
          <p class="std-app-desc">{{ t(`products.${p.key}.desc`) }}</p>
          <ul class="v6-card-chips std-app-chips">
            <li>{{ t(`studio.platform.${p.platform}`) }}</li>
            <li>{{ t(`studio.galaxy.price.${p.price}`) }}</li>
          </ul>
          <RouterLink v-if="p.page" class="std-app-link" :to="`/${lang}${p.page}`">
            {{ t('studio.page.apps.visit') }} <span aria-hidden="true">→</span>
          </RouterLink>
          <span v-else class="std-app-link std-app-soon">{{ t('studio.page.apps.soon') }}</span>
        </article>
      </div>
    </section>

    <!-- JOURNAL SPOTLIGHT -->
    <section id="journal" class="std-section std-spot" :style="accentStyle(journal)">
      <div class="std-spot-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.page.spotlight.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('studio.page.spotlight.title.pre') }} <em>{{ t('studio.page.spotlight.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="std-lead v6-reveal">{{ t('products.journal.desc') }}</p>
        <ul class="std-points v6-reveal">
          <li v-for="point in spotlightPoints" :key="point">{{ point }}</li>
        </ul>
        <div class="v6-reveal">
          <RouterLink :to="`/${lang}${journal.page}`" class="v6-btn v6-btn-lg v6-magnetic">
            {{ t('studio.page.spotlight.cta') }} <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>

      <div class="std-win v6-reveal">
        <div class="std-win-bar" aria-hidden="true"><b></b><b></b><b></b></div>
        <img
          :src="`${baseUrl}Screenshots/opt/${isDark ? 'hero_d' : 'hero_l'}.webp`"
          :alt="t('studio.page.spotlight.imageAlt')"
          width="1600"
          height="1000"
          loading="lazy"
          decoding="async"
        />
      </div>
    </section>

    <!-- PRINCIPLES -->
    <section class="std-section">
      <header class="std-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.page.principles.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('studio.page.principles.title.pre') }} <em>{{ t('studio.page.principles.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>

      <div class="std-principles">
        <article v-for="(item, i) in principles" :key="item.title" class="std-principle v6-reveal">
          <span class="std-principle-idx">0{{ i + 1 }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.copy }}</p>
        </article>
      </div>
    </section>

    <!-- CONTACT -->
    <section class="std-cta">
      <h2 class="std-cta-title v6-reveal">{{ t('studio.page.cta.title.pre') }} <em>{{ t('studio.page.cta.title.em') }}</em><b class="v6-dot">.</b></h2>
      <p class="std-lead v6-reveal">{{ t('studio.page.cta.sub') }}</p>
      <div class="std-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-btn-lg v6-magnetic">
          {{ t('studio.page.cta.button') }} <span aria-hidden="true">→</span>
        </RouterLink>
        <span class="v6-quiet">{{ t('studio.page.cta.mail') }}&nbsp;<a class="std-mail" href="mailto:info@katsumii.com">info@katsumii.com</a></span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import StudioGalaxy from "./StudioGalaxy.vue"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"
import { PRODUCTS, productByKey } from "../utils/products.js"

const { t, tm, rt } = useI18n()
const route = useRoute()
const isDark = inject("isDark")
const baseUrl = import.meta.env.BASE_URL

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const journal = productByKey("journal")

/* product accents follow the page theme; the galaxy sky is always dark */
const accentStyle = (p) => {
  const [ac, hi] = isDark.value ? p.accent.dark : p.accent.light
  return { "--ac": ac, "--ac-hi": hi }
}

const shotSrc = (p) => `${baseUrl}Screenshots/opt/${(isDark.value && p.shot.dark) || p.shot.light || p.shot.dark}`

const spotlightPoints = computed(() => (tm("studio.page.spotlight.points") || []).map(rt))
const principles = computed(() =>
  (tm("studio.page.principles.items") || []).map((item) => ({ title: rt(item.title), copy: rt(item.copy) })),
)

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
.std { position: relative; z-index: 1; }

.std-section {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-bottom) var(--v6-gutter) var(--v6-section-block);
  scroll-margin-top: 4.5rem;
}
.std-head { margin-bottom: clamp(1.8rem, 4vw, 3rem); }
.std-lead { max-width: 36rem; margin: 1.2rem 0 0; color: var(--v6-muted); }

/* ── apps ── */
.std-apps {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: clamp(0.9rem, 2vw, 1.4rem);
}
/* bento rhythm: wide / narrow, then narrow / wide */
.std-app { grid-column: span 5; }
.std-app:nth-child(4n + 1), .std-app:nth-child(4n + 4) { grid-column: span 7; }
.std-app {
  display: flex;
  flex-direction: column;
  scroll-margin-top: 6rem;
  /* the card's own accent colours the hover edge instead of the page accent */
  --ac-line: color-mix(in srgb, var(--ac) 45%, transparent);
}
.std-app:hover { border-color: var(--ac-line); }
.std-app-shot {
  height: 13.5rem;
  margin-bottom: 1.4rem;
  border: 1px solid color-mix(in srgb, var(--ac) 28%, transparent);
  border-radius: 10px;
  overflow: hidden;
  background: var(--v6-bg-soft);
}
.std-app-shot img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top left; }
.std-app-shot-empty {
  display: grid;
  place-items: center;
  height: 100%;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ac);
  background: repeating-linear-gradient(135deg, color-mix(in srgb, var(--ac) 10%, transparent) 0 14px, transparent 14px 28px);
}
.std-app-cat {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1.1rem;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ac);
}
.std-star {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--ac);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--ac) 16%, transparent), 0 0 18px 4px color-mix(in srgb, var(--ac) 50%, transparent);
}
.std-app h3 { font-size: 1.35rem; letter-spacing: -0.02em; }
.std-app .std-app-tag {
  margin: 0 0 0.9rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-style: italic;
  font-size: 0.95rem;
  color: var(--ac-hi);
}
.std-app-desc { flex: 1; }
.std-app-chips li {
  color: var(--ac);
  border-color: var(--ac-line);
}
.std-app-link {
  margin-top: 1.4rem;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--ac-hi);
  text-decoration: none;
}
.std-app-link:hover { text-decoration: underline; text-underline-offset: 4px; }
.std-app-soon {
  font-family: var(--v6-mono);
  font-weight: 400;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.std-app-soon:hover { text-decoration: none; }

/* ── journal spotlight ── */
.std-spot {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}
.std-points {
  list-style: none;
  margin: 1.6rem 0 2rem;
  padding: 0;
  display: grid;
  gap: 0.7rem;
}
.std-points li {
  position: relative;
  padding-left: 1.5rem;
  color: var(--v6-ink);
  font-size: 0.98rem;
}
.std-points li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ac);
  box-shadow: 0 0 12px 2px color-mix(in srgb, var(--ac) 55%, transparent);
}
.std-spot .v6-btn { background: var(--ac); }
.std-spot .v6-btn:hover, .std-spot .v6-btn:focus-visible { background: var(--ac-hi); box-shadow: 0 8px 34px -8px var(--ac); }
.std-win {
  border: 1px solid color-mix(in srgb, var(--ac) 32%, transparent);
  border-radius: 14px;
  background: var(--v6-bg-soft);
  overflow: hidden;
  box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 0.8), 0 0 60px -30px var(--ac);
}
.std-win-bar { display: flex; gap: 6px; padding: 0.6rem 0.8rem; border-bottom: 1px solid var(--v6-line); }
.std-win-bar b {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--v6-line);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
}
.std-win-bar b:first-child { background: var(--ac); }
.std-win img { display: block; width: 100%; height: auto; }

/* ── principles ── */
.std-principles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
.std-principle {
  position: relative;
  padding: 1.5rem 1.6rem 1.6rem 0;
  border-top: 1px solid var(--v6-line);
}
.std-principle + .std-principle { padding-left: 1.6rem; }
.std-principle::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 2px;
  background: linear-gradient(90deg, var(--v6-gold), transparent 70%);
}
.std-principle-idx {
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  color: var(--v6-faint);
}
.std-principle h3 {
  margin: 0.5rem 0 0.5rem;
  font-family: var(--v6-display);
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}
.std-principle p { margin: 0; color: var(--v6-muted); font-size: 0.97rem; max-width: 24rem; }

/* ── contact ── */
.std-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
  text-align: center;
}
.std-cta-title {
  margin: 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 5.6vw, 4.4rem);
  line-height: 1.04;
  letter-spacing: -0.035em;
}
.std-cta-title em { font-style: italic; font-weight: 600; color: var(--v6-gold-hi); }
.std-cta .std-lead { margin-inline: auto; }
.std-mail { color: var(--v6-ink); text-decoration: underline; text-underline-offset: 4px; }
.std-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 2.2rem;
}

@media (max-width: 900px) {
  .std-apps { grid-template-columns: repeat(2, 1fr); }
  .std-app, .std-app:nth-child(4n + 1), .std-app:nth-child(4n + 4) { grid-column: auto; }
  .std-spot { grid-template-columns: 1fr; }
  .std-principles { grid-template-columns: 1fr; }
  .std-principle, .std-principle + .std-principle { padding-left: 0; padding-right: 0; }
}
@media (max-width: 640px) {
  .std-apps { grid-template-columns: 1fr; }
  .std-app:hover { transform: none; }
}
</style>
