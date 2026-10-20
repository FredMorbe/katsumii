<template>
  <main ref="rootEl" class="v6-product">
    <!-- HERO -->
    <section class="v6pp-hero">
      <div class="v6pp-hero-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t(`studio.platform.${product.platform}`) }} · {{ t(`studio.price.${product.price}`) }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t(`products.${product.key}.name`) }}<b class="v6-dot">.</b></h1>
        <p class="v6pp-tag v6-reveal">{{ t(`products.${product.key}.tagline`) }}</p>
        <p class="v6pp-sub v6-reveal">{{ t(`products.${product.key}.desc`) }}</p>
        <div class="v6pp-actions v6-reveal">
          <span class="v6-btn v6-btn-lg v6-btn-static" aria-disabled="true">{{ t('shell.comingSoon') }}</span>
          <RouterLink :to="`/${lang}`" class="v6-quiet v6-magnetic">{{ t('productPage.back') }}</RouterLink>
        </div>
      </div>
      <figure class="v6pp-shot v6-reveal" :class="product.platform">
        <div class="v6pp-shot-inner" role="img" :aria-label="t('productPage.previewLabel')">
          <span class="v6-mono">{{ t('productPage.previewLabel') }}</span>
        </div>
      </figure>
    </section>

    <!-- WHAT TO EXPECT -->
    <section class="v6pp-points">
      <p class="v6-eyebrow v6-reveal"><i></i>{{ t('productPage.pointsEyebrow') }}</p>
      <div class="v6pp-grid">
        <article v-for="(p, i) in points" :key="p.title" class="v6-card v6pp-card v6-reveal">
          <p class="v6-mono v6pp-idx">0{{ i + 1 }}</p>
          <h2>{{ p.title }}</h2>
          <p>{{ p.copy }}</p>
        </article>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6pp-cta">
      <div class="v6pp-cta-inner v6-reveal">
        <h2 class="v6-h2">{{ t('productPage.cta.titlePre') }} <em>{{ t('productPage.cta.titleEm') }}</em><b class="v6-dot">?</b></h2>
        <div class="v6pp-actions">
          <RouterLink :to="`/${lang}/contact`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('productPage.cta.button') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}`" class="v6-quiet">{{ t('productPage.back') }} <span aria-hidden="true">→</span></RouterLink>
        </div>
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
import { productByKey } from "../utils/products.js"

const { t, tm, rt } = useI18n()
const route = useRoute()

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const product = computed(() => productByKey(route.meta.product))
const points = computed(() =>
  (tm("productPage.points") || []).map((p) => ({ title: rt(p.title), copy: rt(p.copy) }))
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
.v6-product { position: relative; z-index: 1; }

/* ── hero ── */
.v6pp-hero {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) 0;
  display: grid;
  grid-template-columns: minmax(300px, 5fr) 6fr;
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
}
.v6pp-hero-copy { display: grid; gap: 1.1rem; justify-items: start; }
.v6pp-tag {
  margin: 0;
  font-family: var(--v6-display);
  font-weight: 700;
  font-style: italic;
  font-size: 1.3rem;
  color: var(--v6-gold-hi);
}
.v6pp-sub { margin: 0; max-width: 32rem; color: var(--v6-muted); line-height: 1.75; }
.v6pp-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 1.3rem; margin-top: 0.4rem; }

/* placeholder preview frame — swap for a real screenshot per product */
.v6pp-shot { margin: 0; position: relative; }
.v6pp-shot::before {
  content: "";
  position: absolute;
  inset: -10% -6%;
  z-index: -1;
  background: radial-gradient(ellipse at center, color-mix(in srgb, var(--v6-gold) 14%, transparent), transparent 65%);
}
.v6pp-shot-inner {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--v6-line-strong);
  border-radius: 14px;
  background:
    repeating-linear-gradient(135deg, color-mix(in srgb, var(--v6-gold) 9%, transparent) 0 10px, transparent 10px 20px),
    var(--v6-bg-soft);
  box-shadow: 0 30px 80px -40px rgba(0, 0, 0, 0.8), 0 0 60px -30px var(--v6-gold);
  color: var(--v6-gold);
}
.v6pp-shot.mobile .v6pp-shot-inner { aspect-ratio: 9 / 16; width: min(100%, 260px); margin: 0 auto; border-radius: 34px; }

/* ── points ── */
.v6pp-points {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) 0;
}
.v6pp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(0.9rem, 2vw, 1.4rem);
  margin-top: 1.6rem;
}
.v6pp-card { padding: clamp(1.3rem, 2.4vw, 1.8rem); display: grid; gap: 0.6rem; align-content: start; }
.v6pp-idx { margin: 0; color: var(--v6-gold); }
.v6pp-card h2 { margin: 0; font-family: var(--v6-display); font-weight: 700; font-size: 1.18rem; letter-spacing: -0.02em; }
.v6pp-card p:last-child { margin: 0; color: var(--v6-muted); font-size: 0.95rem; }

/* ── cta ── */
.v6pp-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) 0;
}
.v6pp-cta-inner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.6rem;
  padding-top: clamp(2rem, 5vh, 3rem);
  border-top: 1px solid var(--v6-line);
}

@media (max-width: 900px) {
  .v6pp-hero, .v6pp-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .v6pp-actions .v6-btn { width: 100%; }
}
</style>
