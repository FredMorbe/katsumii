<template>
  <main ref="rootEl" class="v6-notfound">
    <section class="v6nf-wrap">
      <p class="v6-eyebrow v6-reveal"><i></i>404</p>
      <h1 class="v6-h1 v6nf-title">{{ t('notFoundPage.title') }}<b class="v6-dot">.</b></h1>
      <p class="v6nf-sub v6-reveal">{{ t('notFoundPage.sub') }}</p>

      <div class="v6nf-actions v6-reveal">
        <RouterLink :to="`/${lang}`" class="v6-btn v6-magnetic">{{ t('notFoundPage.back') }} <span aria-hidden="true">→</span></RouterLink>
      </div>

      <nav class="v6nf-links v6-reveal" :aria-label="t('notFoundPage.ariaLinks')">
        <RouterLink v-for="l in links" :key="l.path" :to="`/${lang}${l.path}`">
          <span class="v6nf-link-name">{{ l.name }}</span>
          <span class="v6nf-link-copy">{{ l.copy }}</span>
        </RouterLink>
      </nav>
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
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const LINK_PATHS = ["/journal/features", "/journal/pricing", "/journal/manual", "/journal/faq"]
const links = computed(() =>
  (tm("notFoundPage.links") || []).map((l, i) => ({
    path: LINK_PATHS[i], name: rt(l.name), copy: rt(l.copy),
  }))
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
/* 404 layout — shared tokens/chrome live in src/styles/v6.css */
.v6-notfound { position: relative; z-index: 1; }

.v6nf-wrap {
  max-width: 640px;
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) var(--v6-page-bottom);
  text-align: center;
}
.v6nf-wrap .v6-eyebrow { justify-content: center; }
.v6nf-title { font-size: clamp(2.2rem, 4.6vw, 3.6rem); }
.v6nf-sub {
  max-width: 30rem;
  margin: 1.2rem auto 0;
  color: var(--v6-muted);
  line-height: 1.7;
}
.v6nf-actions { margin-top: 2rem; }

.v6nf-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  margin-top: clamp(2.5rem, 6vh, 3.5rem);
  text-align: left;
}
.v6nf-links a {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.95rem 1.1rem;
  border: 1px solid var(--v6-line);
  border-radius: 14px;
  background: var(--v6-panel);
  text-decoration: none;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.v6nf-links a:hover {
  border-color: var(--v6-line-strong);
  transform: translateY(-2px);
}
.v6nf-link-name {
  font-size: 0.94rem;
  font-weight: 600;
  color: var(--v6-ink);
}
.v6nf-link-copy {
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--v6-muted);
}

/* ── responsive ── */
@media (max-width: 600px) {
  .v6nf-links { grid-template-columns: 1fr; }
}
</style>
