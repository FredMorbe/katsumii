<template>
  <main ref="rootEl" class="std">
    <StudioGalaxy />

    <!-- APPS -->
    <section id="apps" class="std-section">
      <header class="std-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('studio.page.apps.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('studio.page.apps.title.pre') }} <em>{{ t('studio.page.apps.title.em') }}</em><b class="v6-dot">.</b></h2>
      </header>

      <ul class="std-filter v6-reveal" :aria-label="t('studio.page.filter.aria')">
        <li v-for="f in filters" :key="f">
          <button type="button" class="std-chip" :class="{ on: platform === f }" :aria-pressed="platform === f" @click="platform = f">
            {{ f === 'all' ? t('studio.page.filter.all') : t(`studio.platform.${f}`) }}
          </button>
        </li>
      </ul>

      <div class="std-apps">
        <article
          v-for="(p, i) in PRODUCTS"
          v-show="shown.includes(p)"
          :id="`apps-${p.key}`"
          :key="p.key"
          class="v6-card std-app v6-reveal"
          :class="{ wide: [0, 3].includes(shown.indexOf(p) % 4) }"
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
          <a v-if="p.download" class="std-app-dl" :href="p.download" download>{{ t('studio.page.apps.download') }}</a>
        </article>
      </div>

      <ul class="std-principles">
        <li v-for="item in principles" :key="item.title" class="std-principle v6-reveal">
          <strong>{{ item.title }}</strong>
          <span>{{ item.copy }}</span>
        </li>
      </ul>
    </section>

    <!-- CONTACT -->
    <section class="std-cta v6-reveal">
      <div>
        <h2 class="std-cta-title">{{ t('studio.page.cta.title.pre') }} <em>{{ t('studio.page.cta.title.em') }}</em><b class="v6-dot">.</b></h2>
        <p class="std-lead">{{ t('studio.page.cta.sub') }}</p>
      </div>
      <div class="std-cta-actions">
        <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-magnetic">
          {{ t('studio.page.cta.button') }} <span aria-hidden="true">→</span>
        </RouterLink>
        <span class="v6-quiet">{{ t('studio.page.cta.mail') }}&nbsp;<a class="std-mail" href="mailto:info@katsumii.com">info@katsumii.com</a></span>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import StudioGalaxy from "./StudioGalaxy.vue"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"
import { PRODUCTS } from "../utils/products.js"

const { t, tm, rt } = useI18n()
const route = useRoute()
const isDark = inject("isDark")
const baseUrl = import.meta.env.BASE_URL

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* product accents follow the page theme; the galaxy sky is always dark */
const accentStyle = (p) => {
  const [ac, hi] = isDark.value ? p.accent.dark : p.accent.light
  return { "--ac": ac, "--ac-hi": hi }
}

/* platform filter: only offered for the platforms the line-up actually has */
const filters = ["all", ...new Set(PRODUCTS.map((p) => p.platform))]
const platform = ref("all")
const shown = computed(() => PRODUCTS.filter((p) => platform.value === "all" || p.platform === platform.value))
/* a link to #apps-<key> (galaxy, footer) must find its card, whatever the filter says */
watch(() => route.hash, () => { platform.value = "all" }, { flush: "sync" })

const shotSrc = (p) => `${baseUrl}Screenshots/opt/${(isDark.value && p.shot.dark) || p.shot.light || p.shot.dark}`

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
/* bento rhythm: wide / narrow, then narrow / wide (counted among the cards the filter leaves visible) */
.std-app { grid-column: span 5; }
.std-app.wide { grid-column: span 7; }
.std-filter { list-style: none; display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0 0 1.4rem; padding: 0; }
.std-chip {
  padding: 0.35rem 0.95rem;
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  background: transparent;
  color: var(--v6-muted);
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s, background 0.25s;
}
.std-chip:hover { color: var(--v6-ink); }
.std-chip.on { color: var(--v6-ink); border-color: var(--v6-gold); background: color-mix(in srgb, var(--v6-gold) 14%, transparent); }
.std-app {
  position: relative;
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
.std-app-link::after { content: ""; position: absolute; inset: 0; border-radius: inherit; }
.std-app-soon {
  font-family: var(--v6-mono);
  font-weight: 400;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.std-app-soon:hover { text-decoration: none; }
.std-app-soon::after { content: none; }
/* the download button sits above the card-wide link */
.std-app-dl {
  position: relative;
  z-index: 1;
  align-self: flex-start;
  margin-top: 1rem;
  padding: 0.4rem 1rem;
  border: 1px solid var(--ac-line);
  border-radius: 999px;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--ac-hi);
  text-decoration: none;
}
.std-app-dl:hover { background: color-mix(in srgb, var(--ac) 16%, transparent); }

/* ── principles: one slim strip under the cards ── */
.std-principles {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.8rem clamp(1.2rem, 3vw, 2.4rem);
  margin: clamp(1.8rem, 4vw, 3rem) 0 0;
  padding: 1.2rem 0 0;
  border-top: 1px solid var(--v6-line);
}
.std-principle { display: grid; gap: 0.2rem; font-size: 0.9rem; color: var(--v6-muted); }
.std-principle strong { font-family: var(--v6-display); font-size: 1rem; color: var(--v6-ink); letter-spacing: -0.01em; }

/* ── contact: one slim row ── */
.std-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: 0 var(--v6-gutter) var(--v6-page-bottom);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.4rem 2rem;
}
.std-cta-title {
  margin: 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(1.6rem, 3.4vw, 2.4rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}
.std-cta-title em { font-style: italic; font-weight: 600; color: var(--v6-gold-hi); }
.std-cta .std-lead { margin-top: 0.5rem; }
.std-mail { color: var(--v6-ink); text-decoration: underline; text-underline-offset: 4px; }
.std-cta-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 1.2rem; }

@media (max-width: 900px) {
  .std-apps { grid-template-columns: repeat(2, 1fr); }
  .std-app, .std-app.wide { grid-column: auto; }
  .std-principles { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .std-apps { grid-template-columns: 1fr; }
  .std-app:hover { transform: none; }
}
</style>
