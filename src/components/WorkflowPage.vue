<template>
  <main ref="rootEl" class="v6-workflow">
    <!-- HERO -->
    <section class="v6wf-hero v6-band v6-band-snap">
      <div ref="heroCopyEl" class="v6wf-hero-copy v6-copy-glow">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('workflowPage.hero.eyebrow') }}</p>
        <h1 class="v6-h1 v6-reveal">{{ t('workflowPage.hero.titleA') }} <em>{{ t('workflowPage.hero.titleEmA') }}</em>{{ t('workflowPage.hero.titleB') }} <em>{{ t('workflowPage.hero.titleEmB') }}</em><b class="v6-dot">.</b></h1>
        <p class="v6wf-sub v6-reveal">{{ t('workflowPage.hero.sub') }}</p>
        <ul class="v6-card-chips v6wf-chips v6-reveal">
          <li v-for="c in heroChips" :key="c">{{ c }}</li>
        </ul>
        <div class="v6wf-actions v6-reveal">
          <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-magnetic">{{ t('common.cta.getKatsumii') }} <span aria-hidden="true">→</span></RouterLink>
          <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet v6-magnetic">{{ t('common.cta.allFeatures') }}</RouterLink>
        </div>
      </div>
      <figure class="v6wf-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/hero_d.webp' : 'Screenshots/opt/hero_l.webp')"
          :alt="t('workflowPage.hero.alt')"
          width="1600" height="1000"
          loading="eager" decoding="async"
        />
        <figcaption>{{ t('workflowPage.hero.caption') }}</figcaption>
      </figure>
    </section>

    <!-- SECTION 1 · IMPORTS & SYNC -->
    <section id="imports" class="v6wf-section v6-band v6-band-snap">
      <div class="v6wf-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('workflowPage.imports.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('workflowPage.imports.title') }}</h2>
        <p class="v6wf-section-sub v6-reveal">{{ t('workflowPage.imports.sub') }}</p>
        <div class="v6wf-rows v6-reveal">
          <div v-for="row in importRows" :key="row.name" class="v6wf-row plain">
            <div>
              <h3>{{ row.name }}</h3>
              <p>{{ row.copy }}</p>
            </div>
            <span class="v6wf-row-value">{{ row.value }}</span>
          </div>
        </div>
      </div>
      <div class="v6wf-panel v6-reveal">
        <p class="v6wf-panel-head">{{ t('workflowPage.imports.panelHead') }}</p>
        <ul class="v6wf-provider-list">
          <li v-for="p in providers" :key="p.name">
            <span class="v6wf-provider-name">{{ p.name }}</span>
            <span class="v6wf-provider-copy">{{ p.copy }}</span>
            <span class="v6wf-tag" :class="{ soon: p.soon }">{{ p.tag }}</span>
          </li>
        </ul>
        <!-- the six entries sit at two different tiers, so the list needs the split
             spelled out rather than reading as one uniform feature set -->
        <p class="v6wf-panel-foot">{{ t('workflowPage.imports.panelFoot') }}</p>
      </div>
    </section>

    <!-- SECTION 2 · DAILY WORKFLOW & JOURNAL -->
    <section id="journal" class="v6wf-section flip v6-band v6-band-snap">
      <div class="v6wf-section-copy">
        <p class="v6-eyebrow v6-reveal"><i></i>{{ t('workflowPage.journal.eyebrow') }}</p>
        <h2 class="v6-h2 v6-reveal">{{ t('workflowPage.journal.title') }}</h2>
        <p class="v6wf-section-sub v6-reveal">{{ t('workflowPage.journal.sub') }}</p>
        <div class="v6wf-rows v6-reveal">
          <div v-for="r in journalRows" :key="r.name" class="v6wf-row">
            <span class="v6wf-row-dot" aria-hidden="true"></span>
            <div>
              <h3>{{ r.name }}</h3>
              <p>{{ r.copy }}</p>
            </div>
          </div>
        </div>
      </div>
      <figure class="v6wf-shot v6-reveal">
        <img
          v-zoom
          :src="asset(isDark ? 'Screenshots/opt/calendar_f_d.webp' : 'Screenshots/opt/calendar_f_l.webp')"
          :alt="t('workflowPage.journal.alt')"
          width="1600" height="1000"
          loading="lazy" decoding="async"
        />
        <figcaption>{{ t('workflowPage.journal.caption') }}</figcaption>
      </figure>
    </section>

    <!-- SECTION 3 · TOOLS & REPORTS -->
    <section id="tools" class="v6wf-toolbox v6-band v6-band-snap">
      <div class="v6wf-toolbox-head">
        <div>
          <p class="v6-eyebrow v6-reveal"><i></i>{{ t('workflowPage.tools.eyebrow') }}</p>
          <h2 class="v6-h2 v6-reveal">{{ t('workflowPage.tools.title') }}</h2>
        </div>
        <div class="v6wf-toolbox-aside">
          <p class="v6wf-section-sub v6-reveal">{{ t('workflowPage.tools.sub') }}</p>
          <p class="v6wf-note v6-reveal">{{ t('workflowPage.tools.note') }}</p>
        </div>
      </div>
      <div class="v6wf-tools v6-reveal">
        <div v-for="tool in tools" :key="tool.name" class="v6wf-tool">
          <span class="v6wf-tool-kicker">{{ tool.kicker }}</span>
          <h3>{{ tool.name }}</h3>
          <p>{{ tool.copy }}</p>
        </div>
      </div>
    </section>

    <!-- SECTION 3b · TOOL SHOWCASE (tabbed) -->
    <section
      ref="showcaseEl" class="v6wf-showcase v6-band"
      :aria-label="t('workflowPage.showcase.aria')"
    >
      <div id="v6wf-frames" class="v6wf-frames v6-reveal" role="tabpanel" :aria-labelledby="`v6wf-tab-${toolShots[activeShot].key}`">
        <figure
          v-for="(s, i) in toolShots" :key="s.key"
          class="v6wf-shot v6wf-frame" :class="{ on: i === activeShot }"
          :inert="i !== activeShot"
        >
          <img
            v-zoom
            :src="shotSrc(s)"
            :alt="s.alt"
            width="1600" height="1000"
            loading="lazy" decoding="async"
          />
          <figcaption>{{ s.caption }}</figcaption>
        </figure>
      </div>
      <ol
        ref="tablistEl" class="v6wf-steps v6-reveal"
        role="tablist" :aria-label="t('workflowPage.showcase.ariaTablist')" aria-orientation="vertical"
        @keydown="onTabKey"
      >
        <li v-for="(s, i) in toolShots" :key="s.key">
          <button
            type="button" role="tab"
            :id="`v6wf-tab-${s.key}`"
            :class="{ on: i === activeShot }"
            :aria-selected="i === activeShot"
            :tabindex="i === activeShot ? 0 : -1"
            aria-controls="v6wf-frames"
            @click="selectShot(i)"
          >
            <span class="v6wf-step-n">{{ String(i + 1).padStart(2, "0") }}</span>
            <span class="v6wf-step-body">
              <span class="v6wf-step-name">{{ s.name }}</span>
              <span class="v6wf-step-copy">{{ s.copy }}</span>
            </span>
          </button>
        </li>
      </ol>
    </section>

    <!-- CTA -->
    <section class="v6wf-cta">
      <h2 class="v6wf-cta-title v6-reveal">{{ t('workflowPage.cta.title') }}<b class="v6-dot">.</b></h2>
      <p class="v6wf-cta-sub v6-reveal">{{ t('workflowPage.cta.sub') }}</p>
      <div class="v6wf-cta-actions v6-reveal">
        <RouterLink :to="`/${lang}/journal/pricing`" class="v6-btn v6-btn-lg v6-magnetic">{{ t('common.cta.seePricing') }} <span aria-hidden="true">→</span></RouterLink>
        <RouterLink :to="`/${lang}/journal/features`" class="v6-quiet">{{ t('common.cta.exploreAllFeatures') }} <span aria-hidden="true">→</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { initMagnetic, initV6Reveals } from "../v6/motion.js"
import { normalizeLocale } from "../utils/routes.js"

const { t, tm, rt } = useI18n()
const list = (key) => (tm(key) || []).map(rt)
const listOf = (key, fields) =>
  (tm(key) || []).map((entry) => Object.fromEntries(
    fields.filter((f) => entry?.[f] !== undefined).map((f) => [f, rt(entry[f])])
  ))

const isDark = inject("isDark")

const baseUrl = import.meta.env.BASE_URL
const asset = (path) => `${baseUrl}${path}`

const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* Data blocks below carry only what is not translatable: provider names,
   tool kickers and the screenshot path pieces. Copy comes from workflowPage.* */

const heroChips = computed(() => list("workflowPage.hero.chips"))
const importRows = computed(() => listOf("workflowPage.imports.rows", ["name", "value", "copy"]))
const journalRows = computed(() => listOf("workflowPage.journal.rows", ["name", "copy"]))

const PROVIDER_NAMES = ["MetaTrader 5", "ProjectX / TopstepX", "Capital.com", "OANDA", "Generic CSV", "FXReplay"]
const providers = computed(() => {
  const copy = listOf("workflowPage.imports.providers", ["copy", "tag"])
  return PROVIDER_NAMES.map((name, i) => ({ name, ...copy[i] }))
})

const TOOL_KICKERS = ["T1", "T2", "T3", "T4", "T5", "T6", "R1", "R2", "R3"]
const tools = computed(() => {
  const copy = listOf("workflowPage.tools.items", ["name", "copy"])
  return TOOL_KICKERS.map((kicker, i) => ({ kicker, ...copy[i] }))
})

/* Tabbed showcase: the four shots swap in place, driven by the step list.
   File names differ in shape (tools_l_1 vs. report_l), so each carries its own
   prefix/suffix around the theme letter. */
const SHOT_FILES = [
  { key: "tools1", pre: "tools", suf: "_1" },
  { key: "tools2", pre: "tools", suf: "_2" },
  { key: "report", pre: "report", suf: "" },
  { key: "backup", pre: "backup", suf: "" },
]
const toolShots = computed(() => {
  const copy = listOf("workflowPage.showcase.shots", ["name", "copy", "alt", "caption"])
  return SHOT_FILES.map((file, i) => ({ ...file, ...copy[i] }))
})

const shotSrc = (s) => asset(`Screenshots/opt/${s.pre}_${isDark.value ? "d" : "l"}${s.suf}.webp`)

const activeShot = ref(0)
const showcaseEl = ref(null)
const tablistEl = ref(null)

/* The section holds still while the scroll steps through the four shots, so the
   whole set is seen before the page moves on. Null on small screens and with
   reduced motion — there the steps are plain buttons. */
let showcasePin = null

/* Clicking a step means "take me to that shot": inside the pin that is a scroll
   position, outside it a plain state change. */
const selectShot = (i) => {
  if (!showcasePin) {
    activeShot.value = i
    return
  }
  const { start, end } = showcasePin
  const top = start + ((end - start) * i) / (toolShots.value.length - 1)
  window.scrollTo({ top, behavior: "smooth" })
}

const onTabKey = (event) => {
  const last = toolShots.value.length - 1
  let next = activeShot.value
  if (event.key === "ArrowDown" || event.key === "ArrowRight") next = next === last ? 0 : next + 1
  else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = next === 0 ? last : next - 1
  else if (event.key === "Home") next = 0
  else if (event.key === "End") next = last
  else return

  event.preventDefault()
  selectShot(next)
  nextTick(() => tablistEl.value?.querySelectorAll("button")[next]?.focus())
}

const v6Quiet = inject("v6Quiet")
const rootEl = ref(null)
const heroCopyEl = ref(null)
let cleanups = []

onMounted(() => {
  cleanups.push(initV6Reveals(rootEl.value))
  cleanups.push(initMagnetic(rootEl.value))

  /* the particle river thins out behind the hero copy — see v6Quiet in V6Shell */
  v6Quiet?.set(heroCopyEl.value)
  cleanups.push(() => v6Quiet?.clear())

  /* Full-viewport sections snap while this page is mounted — see v6.css.
     The showcase deliberately carries no snap point of its own; the pin below
     owns the scroll there and the two would fight over it. */
  document.documentElement.classList.add("v6-snap")

  gsap.registerPlugin(ScrollTrigger)
  const mm = gsap.matchMedia()
  mm.add("(min-width: 901px) and (min-height: 640px) and (prefers-reduced-motion: no-preference)", () => {
    const steps = toolShots.value.length
    const st = ScrollTrigger.create({
      trigger: showcaseEl.value,
      start: "top top",
      /* one viewport of scroll per step after the first */
      end: () => `+=${window.innerHeight * (steps - 1)}`,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      /* rest on a shot instead of between two */
      snap: { snapTo: 1 / (steps - 1), duration: 0.25, delay: 0.04, ease: "power2.inOut" },
      onUpdate: (self) => {
        activeShot.value = Math.round(self.progress * (steps - 1))
      },
      onRefresh: (self) => {
        showcasePin = { start: self.start, end: self.end }
      },
    })
    showcasePin = { start: st.start, end: st.end }

    return () => {
      st.kill()
      showcasePin = null
      activeShot.value = 0
    }
  })
  cleanups.push(() => mm.revert())
})

onBeforeUnmount(() => {
  document.documentElement.classList.remove("v6-snap")
  cleanups.forEach((off) => off && off())
  cleanups = []
})
</script>

<style scoped>
/* Workflow page layout — shared tokens/chrome live in src/styles/v6.css */
.v6-workflow { position: relative; z-index: 1; }

/* Bands (.v6-band / .v6-band-snap) live in src/styles/v6.css. The showcase is a
   band without a snap point: it is pinned and steps through its shots on
   scroll, so it owns that stretch outright and a snap point would fight it. */

/* ── hero ── */
.v6wf-hero {
  position: relative;
  /* text column deliberately narrow — the screenshot carries the section */
  grid-template-columns: minmax(300px, 4fr) 8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6wf-hero .v6-h1 {
  font-size: clamp(2.1rem, 3.5vw, 3.3rem);
  margin: 1rem 0 1rem;
}
.v6wf-sub {
  max-width: 32rem;
  color: var(--v6-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
.v6wf-chips { margin-top: 1.2rem; }
.v6wf-chips li { font-size: 0.62rem; padding: 0.24rem 0.6rem; }
.v6wf-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin-top: 1.7rem;
}

/* ── shared screenshot frame ── */
.v6wf-shot {
  margin: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--v6-line-strong);
  background: var(--v6-bg-soft);
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8), 0 0 60px -20px var(--v6-line-strong);
}
.v6.light .v6wf-shot {
  box-shadow: 0 30px 70px -32px rgba(20, 60, 50, 0.45), 0 0 50px -24px var(--v6-line-strong);
}
.v6wf-shot img { display: block; width: 100%; height: auto; }
.v6wf-shot figcaption {
  padding: 0.7rem 1.1rem;
  border-top: 1px solid var(--v6-line);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}

/* ── sections ── */
.v6wf-section {
  grid-template-columns: minmax(300px, 5.2fr) 6.8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
.v6wf-section.flip > :first-child { order: 2; }
.v6wf-section.flip > :last-child { order: 1; }
.v6wf-section .v6-h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); }
.v6wf-section-sub {
  color: var(--v6-muted);
  margin: 0.9rem 0 0;
  max-width: 33rem;
  font-size: 0.92rem;
  line-height: 1.6;
}
.v6wf-note {
  margin: 1.2rem 0 0;
  padding: 0.8rem 1rem;
  border-left: 2px solid var(--v6-ember);
  color: var(--v6-muted);
  font-size: 0.86rem;
  line-height: 1.55;
  background: linear-gradient(90deg, var(--v6-panel), transparent 80%);
  border-radius: 0 10px 10px 0;
  max-width: 33rem;
}

/* ── setting rows (shared shape with Customization) ── */
.v6wf-rows {
  margin-top: 1.4rem;
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6wf-rows {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6wf-row {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.85rem clamp(1rem, 2vw, 1.4rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6wf-row:last-child { border-bottom: 0; }
.v6wf-row h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.94rem;
  letter-spacing: -0.01em;
  margin: 0;
}
.v6wf-row p { color: var(--v6-muted); font-size: 0.83rem; line-height: 1.5; margin: 0.3rem 0 0; }
.v6wf-row.plain { justify-content: space-between; align-items: center; }
.v6wf-row-value {
  flex: none;
  font-family: var(--v6-mono);
  font-size: 0.64rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--v6-gold);
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  white-space: nowrap;
}
.v6wf-row-dot {
  flex: none;
  margin-top: 0.55em;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--v6-gold);
  opacity: 0.85;
}

/* ── providers panel (imports) ── */
.v6wf-panel {
  border: 1px solid var(--v6-line);
  border-radius: 18px;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  overflow: hidden;
}
.v6.light .v6wf-panel {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6wf-panel-head,
.v6wf-panel-foot {
  margin: 0;
  padding: 0.85rem clamp(1.1rem, 2.2vw, 1.5rem);
  font-family: var(--v6-mono);
  font-size: 0.62rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-faint);
}
.v6wf-panel-head {
  border-bottom: 1px solid var(--v6-line);
  color: var(--v6-gold);
}
.v6wf-panel-foot {
  border-top: 1px solid var(--v6-line);
  text-transform: none;
  letter-spacing: 0;
  font-family: inherit;
  font-size: 0.82rem;
  color: var(--v6-muted);
}
.v6wf-provider-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.v6wf-provider-list li {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) 2fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem clamp(1rem, 2vw, 1.4rem);
  border-bottom: 1px solid var(--v6-line);
}
.v6wf-provider-list li:last-child { border-bottom: 0; }
.v6wf-provider-name {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: -0.01em;
  color: var(--v6-ink);
}
.v6wf-provider-copy { color: var(--v6-muted); font-size: 0.82rem; line-height: 1.45; }
.v6wf-tag {
  flex: none;
  font-family: var(--v6-mono);
  font-size: 0.58rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--v6-gold);
  border: 1px solid var(--v6-line-strong);
  border-radius: 999px;
  padding: 0.26rem 0.65rem;
  white-space: nowrap;
}
.v6wf-tag.soon { color: var(--v6-faint); }

/* ── tools ──
   Nine utilities read better as a full-width 3×3 index than as a tall column
   beside the copy, and it keeps the whole set inside one screen. */
.v6wf-toolbox { grid-template-rows: auto auto; }
.v6wf-toolbox-head {
  display: grid;
  grid-template-columns: minmax(300px, 5.2fr) 6.8fr;
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: start;
  margin-bottom: clamp(1.6rem, 3.5vh, 2.4rem);
}
.v6wf-toolbox-head .v6-h2 { font-size: clamp(1.6rem, 2.8vw, 2.4rem); }
.v6wf-toolbox-aside .v6wf-section-sub { margin-top: 0; }
.v6wf-tools {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.9rem;
}
.v6wf-tool {
  border: 1px solid var(--v6-line);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  background: linear-gradient(165deg, var(--v6-panel), rgba(12, 21, 18, 0.22));
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.v6.light .v6wf-tool {
  background: linear-gradient(165deg, rgba(255, 255, 255, 0.72), rgba(238, 244, 240, 0.4));
}
.v6wf-tool:hover { border-color: var(--v6-line-strong); transform: translateY(-2px); }
.v6wf-tool-kicker {
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--v6-gold);
}
.v6wf-tool h3 {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 0.96rem;
  letter-spacing: -0.01em;
  margin: 0.35rem 0 0.3rem;
}
.v6wf-tool p { margin: 0; color: var(--v6-muted); font-size: 0.82rem; line-height: 1.5; }

/* ── tool showcase ──
   The step list drives the shots directly, so the whole set is reachable
   without spending scroll distance on it. */
.v6wf-showcase {
  /* screenshot column deliberately dominant */
  grid-template-columns: 7fr minmax(280px, 4.4fr);
  gap: clamp(2rem, 4vw, 3.5rem);
  align-items: center;
}
/* frames are stacked; the first one in flow sets the height, the rest overlay it */
.v6wf-frames { position: relative; }
.v6wf-frame {
  transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: scale(1.015);
  pointer-events: none;
}
.v6wf-frame:first-child { position: relative; }
.v6wf-frame.on {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.v6wf-steps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.2rem;
}
.v6wf-steps button {
  width: 100%;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  padding: 0.8rem 1rem;
  border: 0;
  border-left: 2px solid var(--v6-line);
  border-radius: 0 10px 10px 0;
  background: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  opacity: 0.42;
  transition: opacity 0.4s ease, border-color 0.4s ease, background 0.4s ease;
}
.v6wf-steps button:hover { opacity: 0.75; }
.v6wf-steps button.on {
  opacity: 1;
  border-left-color: var(--v6-gold);
  background: linear-gradient(90deg, var(--v6-panel), transparent 85%);
}
.v6wf-step-n {
  font-family: var(--v6-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--v6-gold);
  padding-top: 0.3rem;
}
.v6wf-step-name {
  display: block;
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
}
.v6wf-step-copy {
  display: block;
  margin-top: 0.25rem;
  color: var(--v6-muted);
  font-size: 0.84rem;
  line-height: 1.5;
}

/* ── cta ── */
.v6wf-cta {
  text-align: center;
  padding: var(--v6-cta-top) var(--v6-gutter) var(--v6-page-bottom);
}
.v6wf-cta-title {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: clamp(2.2rem, 6vw, 4.4rem);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 1rem;
}
.v6wf-cta-sub { color: var(--v6-muted); margin: 0 0 2.2rem; }
.v6wf-cta-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.6rem;
}

/* ── responsive ── */
@media (max-width: 1200px) {
  .v6wf-tools { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .v6wf-hero { grid-template-columns: 1fr; }
  .v6wf-section { grid-template-columns: 1fr; gap: 1.6rem; }
  .v6wf-section.flip > :first-child { order: 1; }
  .v6wf-section.flip > :last-child { order: 2; }
  .v6wf-toolbox-head { grid-template-columns: 1fr; gap: 1.2rem; }
  .v6wf-tools { grid-template-columns: 1fr; }
  .v6wf-showcase { grid-template-columns: 1fr; gap: 1.6rem; }
  .v6wf-provider-list li { grid-template-columns: 1fr auto; }
  .v6wf-provider-copy { grid-column: 1 / -1; }
}
@media (max-width: 640px) {
  .v6wf-row.plain { flex-wrap: wrap; }
}
@media (max-width: 420px) {
  .v6wf-actions,
  .v6wf-cta-actions { display: grid; grid-template-columns: 1fr; gap: 0.45rem; }
  .v6wf-actions .v6-quiet,
  .v6wf-cta-actions .v6-quiet { justify-content: center; }
}
</style>
