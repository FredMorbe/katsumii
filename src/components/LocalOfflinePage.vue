<template>
  <main ref="rootEl" class="v6-local">
    <!-- HERO -->
    <section class="v6lo-hero v6-band v6-band-snap">
      <div ref="heroCopyEl" class="v6lo-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('localOfflinePage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('localOfflinePage.hero.titlePre') }} <em>{{ t('localOfflinePage.hero.titleEm') }}</em><b class="v6-dot">.</b></h1>
        <p class="v6lo-sub v6-reveal">{{ t('localOfflinePage.hero.sub') }}</p>
        <ul class="v6-card-chips v6lo-chips v6-reveal">
          <li v-for="c in heroChips" :key="c">{{ c }}</li>
        </ul>
        <div class="v6lo-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet v6-magnetic">{{ t('common.cta.allFeatures') }}</RouterLink>
        </div>
      </div>

      <figure class="v6lo-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/hero_d.webp' : 'Screenshots/opt/hero_l.webp')"
          :alt="t('localOfflinePage.hero.alt')"
          width="1600" height="1000"
          loading="eager" decoding="async"
        />
        <figcaption>{{ t('localOfflinePage.hero.caption') }}</figcaption>
      </figure>
    </section>

    <!-- WHERE THE DATA SITS -->
    <section id="storage" class="v6lo-section v6-band v6-band-snap">
      <div class="v6lo-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('localOfflinePage.storage.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('localOfflinePage.storage.title') }}</h2>
        <p class="v6lo-section-sub v6-reveal">{{ t('localOfflinePage.storage.sub') }}</p>
      </div>

      <div class="v6lo-facts v6-reveal">
        <article v-for="f in storageFacts" :key="f.term" class="v6-card v6lo-fact">
          <p class="v6lo-fact-term">{{ f.term }}</p>
          <p class="v6lo-fact-val">{{ f.value }}</p>
          <p class="v6lo-fact-copy">{{ f.copy }}</p>
        </article>
      </div>
    </section>

    <!-- WHAT TOUCHES THE NETWORK -->
    <section id="network" class="v6lo-section flip v6-band v6-band-snap">
      <div class="v6lo-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('localOfflinePage.network.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('localOfflinePage.network.title') }}</h2>
        <p class="v6lo-section-sub v6-reveal">{{ t('localOfflinePage.network.sub') }}</p>
      </div>

      <ul class="v6lo-net v6-reveal">
        <li v-for="n in networkRows" :key="n.name" class="v6lo-net-row">
          <div class="v6lo-net-head">
            <h3>{{ n.name }}</h3>
            <span class="v6lo-tag" :class="n.tone">{{ n.tag }}</span>
          </div>
          <p>{{ n.copy }}</p>
        </li>
      </ul>
    </section>

    <!-- BACKUPS -->
    <section id="backups" class="v6lo-section v6-band v6-band-snap">
      <div class="v6lo-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('localOfflinePage.backups.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('localOfflinePage.backups.title') }}</h2>
        <p class="v6lo-section-sub v6-reveal">{{ t('localOfflinePage.backups.sub') }}</p>
        <p class="v6lo-note v6-reveal">{{ t('localOfflinePage.backups.note') }}</p>
      </div>

      <ol class="v6lo-steps v6-reveal">
        <li v-for="(s, i) in backupSteps" :key="s.title" class="v6lo-step">
          <span class="v6lo-step-idx">{{ pad(i + 1) }}</span>
          <div>
            <h3>{{ s.title }}</h3>
            <p>{{ s.copy }}</p>
          </div>
        </li>
      </ol>
    </section>

    <!-- CTA -->
    <section class="v6lo-cta">
      <h2 class="v6lo-cta-title v6-reveal">{{ t('localOfflinePage.cta.title') }}<b class="v6-dot">.</b></h2>
      <p class="v6lo-cta-sub v6-reveal">{{ t('localOfflinePage.cta.sub') }}</p>
      <div class="v6lo-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('common.cta.seePricing') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/faq`" class="v6-quiet v6-magnetic">{{ t('localOfflinePage.cta.readFaq') }}</RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue"
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

const pad = (n) => String(n).padStart(2, "0")

const heroChips = computed(() => list("localOfflinePage.hero.chips"))
const storageFacts = computed(() =>
  (tm("localOfflinePage.storage.facts") || []).map((f) => ({
    term: rt(f.term), value: rt(f.value), copy: rt(f.copy),
  }))
)

/* `tone` picks the pill colour and is presentation, so it stays in the component */
const NETWORK_TONES = ["info", "info", "good", "good"]
const networkRows = computed(() =>
  (tm("localOfflinePage.network.rows") || []).map((n, i) => ({
    name: rt(n.name), tag: rt(n.tag), copy: rt(n.copy), tone: NETWORK_TONES[i],
  }))
)

const backupSteps = computed(() =>
  (tm("localOfflinePage.backups.steps") || []).map((s) => ({ title: rt(s.title), copy: rt(s.copy) }))
)
</script>


<style scoped>
/* Local & offline layout — shared tokens/chrome live in src/styles/v6.css */
.v6-local { position: relative; z-index: 1; }

/* Bands (.v6-band / .v6-band-snap) live in src/styles/v6.css */

/* ── hero ── */
.v6lo-hero {
  position: relative;
  grid-template-columns: 1fr 1fr;
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}
.v6lo-hero .v6-h1 { font-size: clamp(2.4rem, 5vw, 4rem); }
.v6lo-sub {
  max-width: 34rem;
  margin: 1.4rem 0 0;
  color: var(--v6-muted);
  line-height: 1.75;
}
.v6lo-chips { margin-top: 1.6rem; }
.v6lo-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.2rem;
  margin-top: 2rem;
}

.v6lo-shot { margin: 0; }
.v6lo-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--v6-line);
  border-radius: 14px;
}
.v6lo-shot figcaption {
  margin-top: 0.7rem;
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── sections ── */
.v6lo-section {
  grid-template-columns: 0.95fr 1.05fr;
  gap: clamp(2rem, 4vw, 4rem);
  align-items: center;
}
.v6lo-section.flip .v6lo-section-copy { order: 2; }
.v6lo-section-sub {
  max-width: 32rem;
  margin: 1.1rem 0 0;
  color: var(--v6-muted);
  line-height: 1.75;
}
.v6lo-note {
  max-width: 32rem;
  margin: 1.3rem 0 0;
  padding-left: 0.9rem;
  border-left: 2px solid var(--v6-line-strong);
  font-size: 0.86rem;
  line-height: 1.65;
  color: var(--v6-faint);
}

/* ── storage facts ── */
.v6lo-facts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
}
.v6lo-fact { padding: 1.3rem; }
.v6lo-fact-term {
  margin: 0;
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6lo-fact-val {
  margin: 0.5rem 0 0;
  font-size: 1.55rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--v6-gold);
}
.v6lo-fact-copy {
  margin: 0.6rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--v6-muted);
}

/* ── network rows ── */
.v6lo-net {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--v6-line);
  border-radius: 16px;
  overflow: hidden;
}
.v6lo-net-row {
  padding: 1.1rem 1.3rem;
  border-bottom: 1px solid var(--v6-line);
}
.v6lo-net-row:last-child { border-bottom: 0; }
.v6lo-net-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.v6lo-net-head h3 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--v6-ink);
}
.v6lo-net-row p {
  margin: 0.45rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--v6-muted);
}
.v6lo-tag {
  flex: none;
  padding: 0.18rem 0.55rem;
  border: 1px solid var(--v6-line);
  border-radius: 999px;
  font-family: var(--v6-mono);
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6lo-tag.good { color: var(--v6-gold); border-color: var(--v6-line-strong); }

/* ── backup steps ── */
.v6lo-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.v6lo-step {
  display: flex;
  gap: 1rem;
  padding: 1.2rem 1.3rem;
  border: 1px solid var(--v6-line);
  border-radius: 16px;
  background: var(--v6-panel);
}
.v6lo-step-idx {
  flex: none;
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  color: var(--v6-gold);
  font-variant-numeric: tabular-nums;
}
.v6lo-step h3 {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--v6-ink);
}
.v6lo-step p {
  margin: 0.4rem 0 0;
  font-size: 0.86rem;
  line-height: 1.6;
  color: var(--v6-muted);
}

/* ── cta ── */
.v6lo-cta {
  text-align: center;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
}
.v6lo-cta-title {
  margin: 0;
  font-family: var(--v6-display);
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--v6-ink);
}
.v6lo-cta-sub {
  max-width: 30rem;
  margin: 1rem 0 0;
  color: var(--v6-muted);
}
.v6lo-cta-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1.2rem;
  margin-top: 2rem;
}

/* ── responsive ── */
@media (max-width: 900px) {
  .v6lo-hero,
  .v6lo-section { grid-template-columns: 1fr; }
  .v6lo-section.flip .v6lo-section-copy { order: 0; }
  .v6lo-facts { grid-template-columns: 1fr; }
}
</style>
