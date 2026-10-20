<template>
  <main ref="rootEl" class="v6-welcome">
    <!-- HERO -->
    <section class="v6w-hero">
      <p class="v6-eyebrow v6-reveal"><i></i>{{ t('welcomePage.eyebrow') }}</p>
      <h1 class="v6-h1 v6-reveal">{{ t('welcomePage.titlePre') }} <em>{{ t('welcomePage.titleEm') }}</em><b class="v6-dot">.</b></h1>
      <p class="v6w-sub v6-reveal">{{ t('welcomePage.sub') }}</p>
    </section>

    <!-- ONBOARDING STEPS -->
    <section class="v6w-steps" :aria-label="t('welcomePage.ariaSteps')">
      <article v-for="(s, i) in steps" :key="s.title" class="v6-card v6w-step v6-reveal">
        <p class="v6w-step-idx">{{ pad(i + 1) }}</p>
        <h2>{{ s.title }}</h2>
        <p class="v6w-step-copy">{{ s.copy }}</p>
      </article>
    </section>

    <!-- CHECKLIST -->
    <section class="v6w-checklist">
      <div class="v6w-check-panel v6-reveal">
        <p class="v6-eyebrow"><i></i>{{ t('welcomePage.checklistLabel') }}</p>
        <h2 class="v6-h2 v6w-check-title">{{ t('welcomePage.checklistTitle') }}</h2>
        <ul class="v6w-check-list">
          <li v-for="item in checklist" :key="item">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2.2 7.4 5.4 10.6 11.8 3.6" />
            </svg>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- CTA -->
    <section class="v6w-cta">
      <div class="v6w-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/manual`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('welcomePage.openManual') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/faq`" class="v6-quiet v6-magnetic">{{ t('welcomePage.browseFaq') }}</RouterLink>
      </div>
      <p class="v6w-cta-note v6-reveal">
        {{ t('welcomePage.notePre') }}
        <a href="mailto:info@katsumii.com">info@katsumii.com</a>.
      </p>
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

const pad = (n) => String(n).padStart(2, "0")

const steps = computed(() =>
  (tm("welcomePage.steps") || []).map((s) => ({ title: rt(s.title), copy: rt(s.copy) }))
)
const checklist = computed(() => (tm("welcomePage.checklist") || []).map(rt))

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
/* Welcome layout — shared tokens/chrome live in src/styles/v6.css */
.v6-welcome { position: relative; z-index: 1; }

/* ── hero ── */
.v6w-hero {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) 0;
  text-align: center;
}
.v6w-hero .v6-eyebrow { justify-content: center; }
.v6w-hero .v6-h1 { font-size: clamp(2.4rem, 5.2vw, 4rem); }
.v6w-sub {
  max-width: 34rem;
  margin: 1.4rem auto 0;
  color: var(--v6-muted);
  line-height: 1.75;
}

/* ── steps ── */
.v6w-steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block-compact) var(--v6-gutter) 0;
}
.v6w-step { padding: 1.5rem; }
.v6w-step-idx {
  margin: 0;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.18em;
  color: var(--v6-gold);
  font-variant-numeric: tabular-nums;
}
.v6w-step h2 {
  margin: 0.8rem 0 0;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--v6-ink);
}
.v6w-step-copy {
  margin: 0.6rem 0 0;
  font-size: 0.88rem;
  line-height: 1.65;
  color: var(--v6-muted);
}

/* ── checklist ── */
.v6w-checklist {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block-compact) var(--v6-gutter) 0;
}
.v6w-check-panel {
  max-width: 40rem;
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.2rem);
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: var(--v6-panel);
}
.v6w-check-title {
  margin: 0.7rem 0 0;
  font-size: clamp(1.5rem, 3vw, 2rem);
}
.v6w-check-list {
  list-style: none;
  margin: 1.4rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.v6w-check-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--v6-muted);
}
.v6w-check-list svg {
  flex: none;
  width: 14px;
  height: 14px;
  margin-top: 0.35rem;
  color: var(--v6-gold);
}

/* ── cta ── */
.v6w-cta {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
  text-align: center;
}
.v6w-cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
}
.v6w-cta-note {
  margin: 1.6rem 0 0;
  font-size: 0.86rem;
  color: var(--v6-faint);
}
.v6w-cta-note a {
  color: var(--v6-gold);
  text-decoration: none;
  border-bottom: 1px solid var(--v6-line-strong);
  transition: color 0.2s ease;
}
.v6w-cta-note a:hover { color: var(--v6-gold-hi); }

/* ── responsive ── */
@media (max-width: 900px) {
  .v6w-steps { grid-template-columns: 1fr; }
}
</style>
