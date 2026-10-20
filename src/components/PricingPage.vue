<template>
  <main ref="rootEl" class="v6-pricing">
    <!-- HERO -->
    <section class="v6p-hero">
      <p class="v6-eyebrow v6-reveal"><i></i>{{ t('pricingPage.hero.label') }}</p>
      <h1 class="v6-h1 v6-reveal">
        {{ t('pricingPage.hero.headlineA') }}<br />
        <em>{{ pricingHeadlineB }}</em><b class="v6-dot">.</b>
      </h1>
      <p class="v6p-sub v6-reveal">{{ t('pricingPage.hero.description') }}</p>

      <!-- overview facts: what every license is built on -->
      <ul class="v6p-facts v6-reveal" aria-label="Included in every license">
        <li v-for="f in everyLicense" :key="f">{{ f }}</li>
      </ul>
    </section>

    <!-- CARDS -->
    <section class="v6p-cards" aria-label="license tiers">
      <article
        v-for="tier in tiers"
        :key="tier.key"
        class="v6p-card v6-reveal"
        :class="{ hot: tier.highlighted }"
      >
        <div v-if="tier.highlighted" class="v6p-pop">{{ t('pricingPage.popular') }}</div>

        <p class="v6p-tier-name">{{ tier.name }}</p>
        <p class="v6p-tier-desc">{{ tier.description }}</p>

        <div class="v6p-price">
          <span class="v6p-price-val">{{ tier.price }}</span>
          <span v-if="tier.priceNote" class="v6p-price-note">/ {{ tier.priceNote }}</span>
        </div>

        <span class="v6-btn-static" :class="tier.highlighted ? 'v6-btn' : 'v6p-ghost-btn'" aria-disabled="true">
          {{ tier.free ? t('pricingPage.launch.free') : t('pricingPage.launch.paid') }}
        </span>

        <div class="v6p-meta">
          <div>
            <b>{{ tier.seats }}</b>
            <span>{{ tier.seatsLabel }}</span>
          </div>
          <div>
            <b>{{ tier.entries }}</b>
            <span>{{ tier.entriesLabel }}</span>
          </div>
        </div>

        <p v-if="tier.inclusionLabel" class="v6p-incl"><i></i>{{ tier.inclusionLabel }}<i></i></p>

        <ul class="v6p-feats">
          <li v-for="feat in tier.displayFeatures" :key="feat">
            <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M2.2 7.4 5.4 10.6 11.8 3.6" />
            </svg>
            <span>{{ feat }}</span>
          </li>
        </ul>
      </article>
    </section>

    <p class="v6p-taxnote v6-reveal">{{ t('pricingPage.taxNote') }}</p>

    <!-- COMPARISON -->
    <section class="v6p-compare">
      <div class="v6p-compare-head">
        <div>
          <p class="v6-eyebrow v6-reveal"><i></i>{{ t('pricingPage.comparison.kicker') }}</p>
          <h2 class="v6-h2 v6-reveal">{{ t('pricingPage.comparison.headline') }}</h2>
        </div>
        <p class="v6p-compare-sub v6-reveal">{{ t('pricingPage.comparison.description') }}</p>
      </div>

      <!-- Phones show one plan column at a time — three plans plus the feature
           labels cannot fit, and scrolling them sideways hides the row names.
           The picker is mobile-only; from 641px up the full table is shown. -->
      <div class="v6p-plan-picker">
        <button
          v-for="(col, ci) in COMPARE_PLANS"
          :key="col"
          type="button"
          :class="{ active: activePlan === ci }"
          :aria-pressed="activePlan === ci"
          aria-controls="v6p-compare-table"
          @click="activePlan = ci"
        >
          {{ col }}
        </button>
      </div>

      <div class="v6p-table-wrap v6-reveal">
        <table id="v6p-compare-table" class="v6p-table" :data-plan="activePlan">
          <thead>
            <tr>
              <th scope="col">{{ t('pricingPage.comparison.feature') }}</th>
              <th v-for="(col, ci) in COMPARE_PLANS" :key="col" scope="col" :class="`v6p-col-${ci}`">{{ col }}</th>
            </tr>
          </thead>
          <tbody v-for="(group, gi) in comparisonGroups" :key="gi">
            <tr class="v6p-group">
              <!-- the span carries the sticky offset: the cell itself spans the full
                   table, so it has no overhang for position:sticky to work with -->
              <th scope="rowgroup" colspan="4"><span>{{ group.category }}</span></th>
            </tr>
            <tr v-for="(row, ri) in group.rows" :key="ri">
              <th scope="row">{{ row.label }}</th>
              <td v-for="(val, vi) in [row.demo, row.light, row.pro]" :key="vi" :class="`v6p-col-${vi}`">
                <svg v-if="val === true" class="v6p-check" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2.2 7.4 5.4 10.6 11.8 3.6" />
                </svg>
                <span v-else-if="val === false" class="v6p-no" aria-hidden="true">—</span>
                <span v-else class="v6p-val">{{ val }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- SYSTEM REQUIREMENTS (mirrors the landing page block) -->
    <section class="v6p-sysreq" :aria-label="t('sysreq.aria')">
      <div class="v6p-sysreq-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('sysreq.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('sysreq.headline') }}</h2>
        <p class="v6p-sysreq-sub v6-reveal">{{ t('sysreq.sub') }}</p>
      </div>
      <div class="v6p-sysreq-grid v6-reveal">
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

    <!-- GETTING STARTED -->
    <section class="v6p-getstart" :aria-label="t('pricingPage.onboarding.aria')">
      <div class="v6p-getstart-head">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('pricingPage.onboarding.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('pricingPage.onboarding.title') }}</h2>
        <p class="v6p-getstart-sub v6-reveal">{{ t('pricingPage.onboarding.sub') }}</p>
      </div>
      <ol class="v6p-steps v6-reveal">
        <li v-for="(step, i) in onboardingSteps" :key="step.title">
          <span class="v6p-step-idx">{{ String(i + 1).padStart(2, "0") }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <!-- the installer extensions render as <code>, so the copy carries
                 {exe}/{dmg} placeholders instead of literal markup -->
            <p>
              <template v-for="(part, j) in step.parts" :key="j">
                <code v-if="part.code">{{ part.text }}</code>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
          </div>
        </li>
      </ol>
      <p class="v6p-getstart-foot v6-reveal">
        {{ t('pricingPage.onboarding.footPre') }}
        <RouterLink :to="pagePath('contact')">{{ t('pricingPage.onboarding.footLink') }}</RouterLink>
        {{ t('pricingPage.onboarding.footPost') }}
      </p>
    </section>

    <!-- CTA -->
    <section class="v6p-cta">
      <p class="v6-eyebrow v6-reveal" style="justify-content: center"><i></i>{{ t('pricingPage.cta.label') }}</p>
      <h2 class="v6p-cta-title v6-reveal">{{ t('pricingPage.cta.headline') }}</h2>
      <p class="v6p-cta-sub v6-reveal">{{ t('pricingPage.cta.description') }}</p>
      <div class="v6p-cta-actions v6-reveal">
        <!-- buying is not live yet, so the primary action moves the reader deeper
             into the product rather than back to the start of the funnel -->
        <RouterLink :to="pagePath('journal/features')" class="v6-btn v6-btn-lg v6-magnetic">{{ t('pricingPage.cta.seeFeatures') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="pagePath('journal')" class="v6-quiet">{{ t('pricingPage.cta.backHome') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { pagePath } from "../utils/routes.js"

const { t, tm, rt } = useI18n()
const list = (key) => (tm(key) || []).map(rt)

const sysreqRunsOn = computed(() => list("sysreq.runsOn.items"))
const sysreqRequirements = computed(() => list("sysreq.requirements.items"))

/* {exe} / {dmg} mark the two spots that render as <code> inside the copy */
const CODE_TOKENS = { exe: ".exe", dmg: ".dmg" }
const onboardingSteps = computed(() =>
  (tm("pricingPage.onboarding.steps") || []).map((step) => ({
    title: rt(step.title),
    parts: rt(step.copy)
      .split(/(\{exe\}|\{dmg\})/)
      .filter(Boolean)
      .map((text) => {
        const token = text.match(/^\{(exe|dmg)\}$/)
        return token ? { code: true, text: CODE_TOKENS[token[1]] } : { code: false, text }
      }),
  }))
)

const stripTerminalDot = (value) => String(value ?? "").replace(/[.。]\s*$/, "")

/* comparison table columns, in table order — Professional is the default on mobile
   because it is the highlighted tier on the cards above */
const COMPARE_PLANS = ["Demo", "Lite", "Professional"]
const activePlan = ref(2)

/* product facts every license shares — see Katsumii_overview.md.
   Imports, sync and backups are tier-gated, so they belong in the table below,
   not here: these four have to hold for the Demo as well. */
const everyLicense = computed(() => list("pricingPage.everyLicense"))

const tiers = computed(() => {
  const demo = tm("pricingPage.tiers.demo")
  const light = tm("pricingPage.tiers.light")
  const pro = tm("pricingPage.tiers.professional")
  const shape = (tier, { highlighted = false, free = false, displayFeatures } = {}) => ({
    key: tier.name,
    name: tier.name,
    price: tier.price,
    priceNote: tier.priceNote || null,
    description: tier.description,
    displayFeatures: displayFeatures || tier.features,
    cta: tier.cta,
    highlighted,
    free,
    seats: tier.seats,
    seatsLabel: tier.seatsLabel,
    entries: tier.entries,
    entriesLabel: tier.entriesLabel,
    inclusionLabel: tier.inclusionLabel,
  })
  return [
    shape(demo, { free: true }),
    shape(pro, { highlighted: true, displayFeatures: pro.features.slice(1) }),
    shape(light),
  ]
})

const comparisonGroups = computed(() => tm("pricingPage.comparison.groups"))
const pricingHeadlineB = computed(() => stripTerminalDot(t("pricingPage.hero.headlineB")))

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
/* Pricing layout — shared tokens/chrome live in src/styles/v6.css */
.v6-pricing { position: relative; z-index: 1; }

/* ── hero ── */
.v6p-hero {
  max-width: 880px;
  margin: 0 auto;
  padding: var(--v6-page-hero-top) var(--v6-gutter) clamp(2rem, 5vh, 3.5rem);
  text-align: center;
}
.v6p-hero .v6-eyebrow { justify-content: center; }
.v6p-hero .v6-h1 { font-size: clamp(2.5rem, 5.4vw, 4.4rem); }
.v6p-sub {
  max-width: 36rem;
  margin: 0 auto;
  color: var(--v6-muted);
}
.v6p-facts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 0;
  list-style: none;
  margin: 2.4rem 0 0;
  padding: 0;
}
.v6p-facts li {
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--v6-faint);
  padding: 0 1.1rem;
}
.v6p-facts li + li { border-left: 1px solid var(--v6-line); }

/* ── cards ── */
.v6p-taxnote {
  max-width: var(--v6-container);
  margin: -1.6rem auto 0;
  padding: 0 clamp(1.1rem, 4vw, 3rem);
  text-align: center;
  font-size: 0.78rem;
  color: var(--v6-faint);
}
.v6p-cards {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: var(--v6-section-block-compact) var(--v6-gutter) var(--v6-page-hero-bottom);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem;
  align-items: start;
}
.v6p-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.8rem 1.6rem;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.v6.light .v6p-card {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6p-card:hover { border-color: var(--v6-line-strong); transform: translateY(-4px); }
.v6p-card.hot {
  border-color: var(--v6-line-strong);
  box-shadow: 0 30px 70px -35px rgba(0, 0, 0, 0.7), 0 0 50px -24px var(--v6-line-strong);
}
.v6.light .v6p-card.hot {
  box-shadow: 0 30px 60px -36px rgba(20, 60, 50, 0.4), 0 0 40px -26px var(--v6-line-strong);
}
@media (min-width: 1101px) {
  .v6p-card.hot { transform: scale(1.03); }
  .v6p-card.hot:hover { transform: scale(1.03) translateY(-4px); }
}
.v6p-pop {
  position: absolute;
  top: -0.7rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.3rem 0.9rem;
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  background: var(--v6-bg-soft, #0b1220);
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-gold);
  white-space: nowrap;
}
.v6.light .v6p-pop { background: #f4f8f6; }
.v6p-tier-name {
  margin: 0;
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.v6p-tier-desc {
  margin: 0.8rem 0 0;
  color: var(--v6-muted);
  font-size: 0.9rem;
  line-height: 1.55;
  min-height: 4.2em;
}
.v6p-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1.4rem 0 1.6rem;
}
.v6p-price-val {
  font-family: var(--v6-mono);
  font-size: 2.7rem;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--v6-ink);
}
.v6p-price-note {
  font-family: var(--v6-mono);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6p-card > a { justify-content: center; text-align: center; }
.v6p-ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.78rem 1.4rem;
  border: 1px solid var(--v6-line);
  border-radius: 999px;
  color: var(--v6-ink);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.v6p-ghost-btn:hover, .v6p-ghost-btn:focus-visible {
  border-color: var(--v6-line-strong);
  color: var(--v6-gold-hi);
}
.v6p-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 1.6rem;
  border-top: 1px solid var(--v6-line);
  border-bottom: 1px solid var(--v6-line);
}
.v6p-meta div {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.8rem 0.2rem;
}
.v6p-meta div + div { border-left: 1px solid var(--v6-line); padding-left: 1rem; }
.v6p-meta b {
  font-family: var(--v6-mono);
  font-weight: 500;
  font-size: 1rem;
  color: var(--v6-gold);
}
.v6p-meta span {
  font-family: var(--v6-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6p-incl {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin: 1.2rem 0 0;
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6p-incl i { flex: 1; height: 1px; background: var(--v6-line); }
.v6p-feats {
  list-style: none;
  margin: 1.2rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.v6p-feats li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  color: var(--v6-muted);
  font-size: 0.9rem;
  line-height: 1.5;
}
.v6p-feats svg {
  flex: none;
  width: 13px;
  height: 13px;
  margin-top: 0.28em;
  color: var(--v6-gold);
}

/* ── system requirements (mirrors LandingV6 block) ── */
.v6p-sysreq {
  position: relative;
  z-index: 1;
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(2rem, 6vh, 3.5rem) var(--v6-gutter) clamp(2.5rem, 7vh, 4rem);
}
.v6p-sysreq-head { max-width: 44rem; margin-bottom: 2.2rem; }
.v6p-sysreq-sub { color: var(--v6-muted); font-size: 0.94rem; margin: 1.2rem 0 0; }
.v6p-sysreq-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6p-sysreq-grid {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6p-sysreq-grid > div {
  padding: 1.4rem clamp(1.1rem, 2vw, 1.5rem);
  border-right: 1px solid var(--v6-line);
}
.v6p-sysreq-grid > div:last-child { border-right: 0; }
.v6p-sysreq-grid h3 {
  margin: 0 0 0.9rem;
  font-family: var(--v6-mono);
  font-size: 0.66rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-gold);
  font-weight: 500;
}
.v6p-sysreq-grid ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.v6p-sysreq-grid li {
  position: relative;
  padding-left: 1rem;
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.5;
}
.v6p-sysreq-grid li::before {
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
.v6p-sysreq-grid p {
  margin: 0;
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.6;
}
@media (max-width: 900px) {
  .v6p-sysreq-grid { grid-template-columns: 1fr; }
  .v6p-sysreq-grid > div { border-right: 0; border-bottom: 1px solid var(--v6-line); }
  .v6p-sysreq-grid > div:last-child { border-bottom: 0; }
}

/* ── getting started (from purchase to first trade) ── */
.v6p-getstart {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(2rem, 6vh, 3.5rem) var(--v6-gutter);
}
.v6p-getstart-head { max-width: 44rem; margin-bottom: 2rem; }
.v6p-getstart-sub { color: var(--v6-muted); font-size: 0.94rem; margin: 1.2rem 0 0; }
.v6p-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.v6p-steps > li {
  display: flex;
  gap: 1rem;
  padding: 1.3rem 1.3rem 1.4rem;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.v6.light .v6p-steps > li {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6p-steps > li:hover { border-color: var(--v6-line-strong); transform: translateY(-2px); }
.v6p-step-idx {
  flex: none;
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.16em;
  color: var(--v6-gold);
  padding-top: 0.15rem;
}
.v6p-steps h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
  margin: 0 0 0.4rem;
}
.v6p-steps p { margin: 0; color: var(--v6-muted); font-size: 0.88rem; line-height: 1.55; }
.v6p-steps code {
  font-family: var(--v6-mono);
  font-size: 0.82em;
  color: var(--v6-ink);
  background: var(--v6-panel);
  border: 1px solid var(--v6-line);
  border-radius: 4px;
  padding: 0 0.35em;
}
.v6p-getstart-foot {
  margin: 1.6rem 0 0;
  color: var(--v6-faint);
  font-size: 0.85rem;
}
.v6p-getstart-foot a { color: var(--v6-gold); text-decoration: none; }
.v6p-getstart-foot a:hover { color: var(--v6-gold-hi); }
@media (max-width: 900px) {
  .v6p-steps { grid-template-columns: 1fr; }
}

/* ── comparison ── */
.v6p-compare {
  max-width: var(--v6-container);
  margin: 0 auto;
  padding: clamp(2rem, 6vh, 4rem) var(--v6-gutter) var(--v6-page-hero-bottom);
}
.v6p-compare-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2.2rem;
}
.v6p-compare-sub { max-width: 26rem; color: var(--v6-muted); font-size: 0.92rem; margin: 0; }
.v6p-table-wrap {
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  -webkit-overflow-scrolling: touch;
}
.v6.light .v6p-table-wrap {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6p-plan-picker { display: none; }
.v6p-table {
  width: 100%;
  border-collapse: collapse;
}
/* the sideways-scrolling full table starts where two columns stop fitting */
@media (min-width: 641px) {
  .v6p-table { min-width: 720px; }
}
/* 641–819px is the only band that still scrolls sideways (the table fits from
   820px up) — pin the labels there so a scrolled row keeps its name. The opaque
   fill breaks the wrap gradient, hence the tight upper bound. */
@media (min-width: 641px) and (max-width: 819px) {
  .v6p-table thead th:first-child,
  .v6p-table tbody th[scope="row"] {
    position: sticky;
    left: 0;
    z-index: 2;
    background: var(--v6-bg-soft);
  }
  .v6p-group th span {
    position: sticky;
    left: 0;
    display: inline-block;
  }
}
.v6p-table th, .v6p-table td {
  padding: 0.85rem clamp(1.2rem, 2.4vw, 1.8rem);
  border-bottom: 1px solid var(--v6-line);
  text-align: left;
}
.v6p-table thead th {
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-faint);
  font-weight: 500;
}
.v6p-table th + th, .v6p-table td + td,
.v6p-table tbody th + td { border-left: 1px solid var(--v6-line); }
.v6p-table thead th:not(:first-child),
.v6p-table td { width: 150px; text-align: center; }
.v6p-group th {
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v6-gold);
  font-weight: 500;
  padding-top: 1.3rem;
}
.v6p-table tbody th[scope="row"] {
  font-weight: 400;
  color: var(--v6-muted);
  font-size: 0.9rem;
}
.v6p-table tbody tr:last-child th,
.v6p-table tbody:last-child tr:last-child td { border-bottom: 0; }
.v6p-check { width: 14px; height: 14px; color: var(--v6-gold); }
.v6p-no { color: var(--v6-faint); opacity: 0.55; }
.v6p-val {
  font-family: var(--v6-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  color: var(--v6-ink);
}

/* ── cta ── */
.v6p-cta {
  text-align: center;
  padding: clamp(3rem, 9vh, 6rem) var(--v6-gutter) var(--v6-page-bottom);
}
.v6p-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 1.4rem 0 1rem;
}
.v6p-cta-sub {
  color: var(--v6-muted);
  max-width: 32rem;
  margin: 0 auto 2.2rem;
}
.v6p-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 1100px) {
  .v6p-cards { grid-template-columns: 1fr; max-width: 640px; }
  .v6p-card.hot { order: -1; }
  .v6p-tier-desc { min-height: 0; }
}
@media (max-width: 640px) {
  .v6p-facts { flex-direction: column; gap: 0.7rem; }
  .v6p-facts li { border-left: 0 !important; padding: 0; }
  .v6p-card { padding: 1.5rem 1.2rem; }
  .v6p-card:hover { transform: none; }
  .v6p-table-wrap { border-radius: 14px; }
  .v6p-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6p-cta-actions .v6-quiet { justify-content: center; }

  /* ── one plan at a time ── */
  .v6p-plan-picker {
    position: sticky;
    top: 4.2rem;
    z-index: 3;
    display: flex;
    gap: 0.4rem;
    margin-bottom: 0.9rem;
    padding: 0.4rem;
    border: 1px solid var(--v6-line);
    border-radius: 999px;
    /* opaque: the table scrolls underneath this */
    background: var(--v6-bg-soft);
  }
  .v6p-plan-picker button {
    flex: 1;
    min-height: 44px;
    border: 1px solid transparent;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
    font-family: var(--v6-mono);
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--v6-muted);
    transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
  }
  .v6p-plan-picker button.active {
    border-color: var(--v6-line-strong);
    background: color-mix(in srgb, var(--v6-gold) 12%, transparent);
    color: var(--v6-gold);
  }

  .v6p-table-wrap { overflow-x: hidden; }
  .v6p-table[data-plan="0"] .v6p-col-1,
  .v6p-table[data-plan="0"] .v6p-col-2,
  .v6p-table[data-plan="1"] .v6p-col-0,
  .v6p-table[data-plan="1"] .v6p-col-2,
  .v6p-table[data-plan="2"] .v6p-col-0,
  .v6p-table[data-plan="2"] .v6p-col-1 { display: none; }
  .v6p-table th, .v6p-table td { padding: 0.8rem 0.9rem; }
  .v6p-table thead th:not(:first-child),
  .v6p-table td { width: 38%; }
}

@media (prefers-reduced-motion: reduce) {
  .v6p-plan-picker button { transition: none; }
}
</style>
