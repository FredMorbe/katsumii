<template>
  <div class="gx">
    <section ref="skyEl" class="gx-sky" :aria-label="t('studio.galaxy.aria')">
      <canvas ref="canvasEl" aria-hidden="true"></canvas>

      <div class="gx-copy">
        <p class="v6-eyebrow"><i></i>{{ t('studio.galaxy.eyebrow') }}</p>
        <h1 class="v6-h1">{{ t('studio.galaxy.h1.pre') }} <em>{{ t('studio.galaxy.h1.em') }}</em><b class="v6-dot">.</b></h1>
        <p class="gx-sub">{{ t(noHover ? 'studio.galaxy.subTouch' : 'studio.galaxy.sub') }}</p>
      </div>

      <RouterLink
        v-for="(p, i) in PRODUCTS"
        :key="p.key"
        ref="sysEls"
        class="gx-sys"
        :class="p.page ? 'live' : 'soon'"
        :to="linkFor(p)"
        :data-k="p.key"
        :data-r="p.galaxy.r"
        :data-th="p.galaxy.th"
        :data-cat="`KAT-0${i + 1}`"
        :data-zoom="p.page ? '1' : null"
        :style="{ '--ac': p.accent.dark[0], '--ac-hi': p.accent.dark[1] }"
      >
        <span class="gx-star"><i class="gx-orbit o1"><i></i></i><i class="gx-orbit o2"><i></i></i><b></b></span>
        <span class="gx-lab">
          <span class="gx-mono">KAT-0{{ i + 1 }} · {{ t(`studio.platform.${p.platform}`) }}</span>
          <strong>{{ t(`products.${p.key}.name`) }}</strong>
          <em>{{ t(`products.${p.key}.tagline`) }}</em>
          <span class="gx-more">
            {{ t(`products.${p.key}.desc`) }}
            <span class="gx-meta"><i class="gx-chip">{{ t(p.page ? 'studio.galaxy.status.live' : 'studio.galaxy.status.soon') }}</i>{{ t(`studio.galaxy.price.${p.price}`) }}</span>
            <u class="gx-cta">{{ p.page ? t('studio.galaxy.open') + ' →' : t('studio.galaxy.soon') }}</u>
          </span>
        </span>
      </RouterLink>

      <!-- unexplored regions: systems that are not built yet, they lead to the contact page -->
      <RouterLink
        v-for="(v, i) in UNCHARTED"
        :key="v.key"
        ref="voidEls"
        class="gx-sys void"
        :to="`/${lang}/contact`"
        :data-k="v.key"
        :data-r="v.r"
        :data-th="v.th"
        :data-cat="`VOID-0${i + 1}`"
        style="--ac: #94a3b8; --ac-hi: #cbd5e1"
      >
        <span class="gx-star"><b></b></span>
        <span class="gx-lab">
          <span class="gx-mono">{{ t('studio.galaxy.void.label') }}</span>
          <span class="gx-more">
            {{ t('studio.galaxy.void.text') }}
            <u class="gx-cta">{{ t('studio.galaxy.void.cta') }} →</u>
          </span>
        </span>
      </RouterLink>

      <p ref="readEl" class="gx-read" aria-hidden="true"></p>
      <p class="gx-hint" aria-hidden="true">{{ t('studio.galaxy.hint') }}</p>
    </section>

    <nav class="gx-tabs" :aria-label="t('studio.galaxy.tabsAria')">
      <RouterLink
        v-for="(p, i) in PRODUCTS"
        :key="p.key"
        ref="tabEls"
        class="gx-tab"
        :to="linkFor(p)"
        :data-k="p.key"
        :style="accentStyle(p)"
      >
        <span class="gx-mono"><i class="gx-dot" :class="{ live: p.page }"></i>KAT-0{{ i + 1 }}</span>
        <b>{{ t(`products.${p.key}.name`) }}</b>
        <em class="gx-mono">{{ t(`studio.platform.${p.platform}`) }} · {{ t(`studio.galaxy.price.${p.price}`) }}</em>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"
import { normalizeLocale } from "../utils/routes.js"
import { PRODUCTS } from "../utils/products.js"
import { createGalaxy } from "../v6/galaxy.js"

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const isDark = inject("isDark")

/* unexplored regions of the galaxy — same polar coordinates as the products (r from the core, th in rad) */
const UNCHARTED = [
  { key: "void1", r: 0.78, th: 0.6 },
  { key: "void2", r: 0.46, th: 1.6 },
  { key: "void3", r: 0.93, th: 4.3 },
]

const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

/* a system opens its product page; one without a page yet jumps to its card further down */
const linkFor = (p) => (p.page ? `/${lang.value}${p.page}` : { hash: `#apps-${p.key}` })

/* the sky itself is always dark; the tab row below follows the page theme */
const accentStyle = (p) => {
  const [ac, hi] = isDark.value ? p.accent.dark : p.accent.light
  return { "--ac": ac, "--ac-hi": hi }
}

const skyEl = ref(null)
const canvasEl = ref(null)
const readEl = ref(null)
const sysEls = ref([])
const voidEls = ref([])
const tabEls = ref([])
let galaxy = null

/* touch screens have no hover — the copy and the card behaviour say "tap" there */
const noHover = ref(false)

const elOf = (ref) => ref?.$el || ref

onMounted(() => {
  noHover.value = matchMedia("(hover: none)").matches
  galaxy = createGalaxy({
    panel: skyEl.value,
    canvas: canvasEl.value,
    systems: sysEls.value.concat(voidEls.value).map(elOf),
    tabs: tabEls.value.map(elOf),
    readout: readEl.value,
    /* the camera has flown into the system — now go to its page */
    open: (key) => router.push(linkFor(PRODUCTS.find((p) => p.key === key))),
  })
  galaxy.setReadout(t("studio.galaxy.readout"))
})

watch(locale, () => galaxy?.setReadout(t("studio.galaxy.readout")))

onBeforeUnmount(() => {
  galaxy?.dispose()
  galaxy = null
})
</script>

<style scoped>
/* Galaxy hero — styles ported 1:1 from docs/mockups/concept-e-galaxy.html */
.gx{max-width:var(--v6-container);margin:0 auto;padding:0 var(--v6-gutter)}
.gx-tab em{font-style:normal}
.gx-mono{font-family:var(--v6-mono);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase}
.gx-sub{color:#94a3b8;max-width:34rem;margin:0}
.gx-sky{--v6-ink:#eef2f7;--v6-muted:#94a3b8;--v6-faint:#64748b;--v6-gold:#22d3ee;--v6-gold-hi:#67e8f9;--v6-line:rgba(226,232,240,.1);--v6-line-strong:rgba(34,211,238,.3);
 position:relative;margin:5.5rem 0 0;height:clamp(600px,80vh,820px);border-radius:22px;overflow:hidden;color:var(--v6-ink);
 background:radial-gradient(ellipse 70% 80% at 58% 56%,#0b1730 0%,#060c18 55%,#04080f 100%);border:1px solid rgba(226,232,240,.1)}
.gx-sky canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.gx-sky::before,.gx-sky::after{content:"";position:absolute;width:26px;height:26px;border:1px solid rgba(103,232,249,.45);z-index:3;pointer-events:none}
.gx-sky::before{left:16px;top:16px;border-right:0;border-bottom:0}.gx-sky::after{right:16px;bottom:16px;border-left:0;border-top:0}
.gx-copy{position:absolute;left:clamp(1.4rem,3.5vw,3rem);top:clamp(1.6rem,4vw,3rem);z-index:4;display:grid;gap:1rem;max-width:30rem;pointer-events:none}
.gx-copy .v6-h1{font-size:clamp(2.4rem,5vw,4.2rem);margin:0}.gx-copy p{pointer-events:auto}
.gx-read{position:absolute;left:clamp(1.4rem,3.5vw,3rem);bottom:1.4rem;z-index:4;color:#64748b;font-family:var(--v6-mono);font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;transition:color .3s}
.gx-read.on{color:var(--rc,#67e8f9)}
.gx-hint{position:absolute;right:clamp(1.4rem,3.5vw,3rem);bottom:1.4rem;z-index:4;color:#475569;font-family:var(--v6-mono);font-size:.68rem;letter-spacing:.16em;text-transform:uppercase}
/* star systems */
.gx-sys{position:absolute;left:0;top:0;z-index:5;display:flex;align-items:center;gap:.8rem;color:#eef2f7;text-decoration:none;will-change:transform;opacity:0;transition:opacity .8s}
.gx-sky.ready .gx-sys{opacity:1}
.gx-star{position:relative;width:44px;height:44px;flex:none;margin:-22px 0 -22px -22px;display:grid;place-items:center}
.gx-star b{width:12px;height:12px;border-radius:50%;background:var(--ac);box-shadow:0 0 0 5px color-mix(in srgb,var(--ac) 18%,transparent),0 0 30px 8px color-mix(in srgb,var(--ac) 60%,transparent);transition:transform .35s cubic-bezier(.22,1,.36,1)}
.gx-orbit{position:absolute;left:50%;top:50%;border:1px solid color-mix(in srgb,var(--ac) 45%,transparent);border-radius:50%;pointer-events:none}
.gx-orbit.o1{width:40px;height:40px;margin:-20px;transform:rotateX(68deg) rotateZ(-20deg)}
.gx-orbit.o2{width:62px;height:62px;margin:-31px;transform:rotateX(68deg) rotateZ(30deg);opacity:.55}
.gx-orbit>i{position:absolute;inset:-1px;border-radius:50%;animation:gx-spin 7s linear infinite}
.gx-orbit.o2>i{animation-duration:12s;animation-direction:reverse}
.gx-orbit>i::after{content:"";position:absolute;top:-2.5px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--ac-hi);box-shadow:0 0 8px var(--ac-hi)}
@keyframes gx-spin{to{transform:rotate(360deg)}}
.gx-lab{text-shadow:0 0 10px #050b14,0 0 3px #050b14,0 0 22px rgba(5,11,20,.9);display:grid;gap:.1rem;max-width:15rem;padding:.35rem .6rem;margin-left:.2rem;border-radius:10px;border:1px solid transparent;transition:background .3s,border-color .3s}
.gx-lab .gx-mono{color:var(--ac);font-size:.64rem;letter-spacing:.16em}
.gx-lab strong{font-family:var(--v6-display);font-weight:700;font-size:1.3rem;letter-spacing:-.03em;line-height:1.1}
.gx-lab em{font-family:var(--v6-display);font-weight:700;font-style:italic;font-size:.85rem;color:var(--ac-hi)}
/* info card: the focused system's label opens into it */
.gx-more{display:none;margin-top:.5rem;color:#94a3b8;font-size:.82rem;line-height:1.5}
.gx-meta{display:flex;align-items:center;gap:.6rem;margin-top:.7rem;color:#64748b;font-family:var(--v6-mono);font-size:.64rem;letter-spacing:.14em;text-transform:uppercase}
.gx-chip{display:inline-flex;align-items:center;gap:.4rem;padding:.15rem .55rem;border-radius:999px;border:1px solid rgba(148,163,184,.35);color:#94a3b8;font-style:normal}
.gx-chip::before,.gx-dot{content:"";width:6px;height:6px;border-radius:50%;border:1px solid currentColor;flex:none}
.gx-sys.live .gx-chip{color:var(--ac-hi);border-color:color-mix(in srgb,var(--ac) 55%,transparent)}
.gx-sys.live .gx-chip::before{background:currentColor}
.gx-cta{display:block;width:fit-content;margin-top:.7rem;text-decoration:none;color:var(--ac-hi);font-family:var(--v6-display);font-weight:700}
.gx-sys.live .gx-cta{padding:.35rem .85rem;border-radius:999px;border:1px solid color-mix(in srgb,var(--ac) 55%,transparent)}
.gx-sys.on{z-index:8}
.gx-sys.on .gx-lab{max-width:17rem;text-shadow:none;background:rgba(6,12,24,.86);backdrop-filter:blur(8px);border-color:color-mix(in srgb,var(--ac) 45%,transparent)}
/* status: a live system sends out a slow ping, one that is not built yet is dimmed */
.gx-sys.live .gx-star::after{content:"";position:absolute;left:50%;top:50%;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;border:1px solid var(--ac);opacity:0;animation:gx-ping 3s ease-out infinite;pointer-events:none}
@keyframes gx-ping{from{transform:scale(1);opacity:.7}to{transform:scale(4.4);opacity:0}}
.gx-sys.soon .gx-star b{opacity:.5;box-shadow:0 0 0 4px color-mix(in srgb,var(--ac) 10%,transparent)}
.gx-sys.soon .gx-orbit{opacity:.3}.gx-sys.soon .gx-orbit.o2{display:none}
.gx-sys.soon:not(.on) .gx-lab{opacity:.85}
/* unexplored regions: a dashed ring instead of a star */
.gx-sys.void .gx-star b{background:transparent;border:1px dashed var(--ac);box-shadow:none;opacity:.7}
.gx-sys.void:not(.on) .gx-lab{opacity:.5}
.gx-sys.void .gx-lab .gx-mono{color:var(--ac)}
/* camera flight into a system: everything but the system itself fades out */
.gx-sky.zooming{pointer-events:none}
.gx-sky.zooming .gx-copy,.gx-sky.zooming .gx-read,.gx-sky.zooming .gx-hint{opacity:0;transition:opacity .4s}
.gx-sky.zooming .gx-sys:not(.on){opacity:0}
.gx-sky.zooming .gx-sys.on .gx-lab{opacity:0;transition:opacity .35s}
.gx-sys.on .gx-more{display:block}
.gx-sys.on .gx-star b{transform:scale(1.35)}
.gx-sys.left{flex-direction:row-reverse;text-align:right}.gx-sys.left .gx-star{margin:-22px -22px -22px 0}.gx-sys.left .gx-lab{margin:0 .2rem 0 0}
.gx-sys:focus-visible{outline:none}.gx-sys:focus-visible .gx-lab{border-color:var(--ac-hi)}
/* system list under the sky */
.gx-tabs{display:grid;grid-template-columns:repeat(4,1fr);margin:1.6rem 0 0}
.gx-tab{display:grid;gap:.1rem;padding:1.1rem 1.2rem 1.3rem 0;border-top:1px solid var(--v6-line);position:relative;transition:border-color .3s}
.gx-tab+.gx-tab{padding-left:1.2rem;border-left:0}
.gx-tab::before{content:"";position:absolute;left:0;right:0;top:-1px;height:2px;background:var(--ac);transform:scaleX(0);transform-origin:left;transition:transform .5s cubic-bezier(.22,1,.36,1)}
.gx-tab.on::before,.gx-tab:hover::before{transform:scaleX(1)}
.gx-tab .gx-mono{display:flex;align-items:center;gap:.5rem;color:var(--v6-faint)}.gx-tab.on .gx-mono{color:var(--ac)}
.gx-dot.live{background:var(--ac);border-color:var(--ac)}
.gx-tab b{font-family:var(--v6-display);font-size:1.25rem;letter-spacing:-.02em;transition:color .3s}.gx-tab.on b,.gx-tab:hover b{color:var(--ac-hi)}
/* narrow: the labels shrink to the name, the focused system opens its full card */
@media (max-width:900px){.gx-sky{height:78vh}.gx-copy{max-width:20rem}.gx-lab em,.gx-lab .gx-mono{display:none}.gx-sys.on .gx-lab em,.gx-sys.on .gx-lab .gx-mono{display:block}.gx-lab strong{font-size:1.05rem}.gx-tabs{grid-template-columns:1fr 1fr}.gx-tab:nth-child(odd){padding-left:0}.gx-hint{display:none}}
@media (prefers-reduced-motion:reduce){.gx-orbit>i,.gx-sys.live .gx-star::after{animation:none}}
</style>
