<template>
  <div ref="skyEl" class="v6sg-sky" :class="{ ready }" :aria-label="t('studio.galaxy.aria')">
    <canvas ref="canvasEl" aria-hidden="true"></canvas>

    <RouterLink
      v-for="(p, i) in PRODUCTS"
      :key="p.key"
      :ref="(el) => (systemEls[i] = el?.$el || el)"
      class="v6sg-sys"
      :class="{ on: active === p.key }"
      :to="`/${lang}${p.path}`"
      :style="{ '--ac': p.accent.dark[0], '--ac-hi': p.accent.dark[1] }"
      @mouseenter="focus(p.key)"
      @mouseleave="focus(null)"
      @focus="focus(p.key)"
      @blur="focus(null)"
    >
      <span class="v6sg-star" aria-hidden="true">
        <i class="v6sg-orbit o1"><i></i></i><i class="v6sg-orbit o2"><i></i></i><b></b>
      </span>
      <span class="v6sg-lab">
        <span class="v6-mono">KAT-0{{ i + 1 }} · {{ t(`studio.platform.${p.platform}`) }}</span>
        <strong>{{ t(`products.${p.key}.name`) }}</strong>
        <em>{{ t(`products.${p.key}.tagline`) }}</em>
        <span class="v6sg-more">{{ t(`products.${p.key}.desc`) }}<u>{{ t('studio.galaxy.open') }} →</u></span>
      </span>
    </RouterLink>

    <p class="v6sg-read v6-mono" :class="{ on: active }" :style="readStyle" aria-hidden="true">{{ readout }}</p>
    <p class="v6sg-hint v6-mono" aria-hidden="true">{{ t('studio.galaxy.hint') }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { normalizeLocale } from "../utils/routes.js"
import { PRODUCTS } from "../utils/products.js"

const { t } = useI18n()
const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const skyEl = ref(null)
const canvasEl = ref(null)
const systemEls = []
const ready = ref(false)
const active = ref(null)
const liveReadout = ref("")
const readout = computed(() => (active.value ? liveReadout.value : t("studio.galaxy.readout")))
const readStyle = computed(() => {
  const p = PRODUCTS.find((x) => x.key === active.value)
  return p ? { "--rc": p.accent.dark[1] } : {}
})

/* ── galaxy model ─────────────────────────────────────────────
   Particles live in galaxy space (radius 0..1, angle, small height) and are
   projected through a tilted, rotated ellipse every frame. The star systems use
   the same projection, so they ride along with the arms. */
const COL = [[255, 222, 168], [140, 235, 255], [150, 164, 255]]
const AL = [0.32, 0.58, 0.9, 0.09] /* last bucket = soft nebula puffs */
const NB = COL.length * AL.length
const omega = (r) => 0.018 + 0.006 * (1 - r) /* rad/s — one turn in about five minutes */

let seed = 11
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5

const buildParticles = (count) => {
  const buckets = Array.from({ length: NB }, () => ({ r: [], t: [], h: [], s: [] }))
  for (let i = 0; i < count; i++) {
    const u = rnd()
    let r, th, c, a, s = 1
    if (u < 0.14) { r = Math.abs(gauss()) * 0.2; th = rnd() * 6.283; c = 0; a = rnd() < 0.3 ? 2 : 1 }
    else if (u < 0.7) {
      const arm = rnd() < 0.5 ? 0 : 1
      r = Math.pow(rnd(), 0.8) * 0.97 + 0.03
      th = arm * Math.PI + Math.log(1 + r * 4) * 3.1 + gauss() * (0.14 + 0.34 * r)
      c = r < 0.42 ? 1 : 2
      a = rnd() < 0.22 ? 2 : rnd() < 0.6 ? 1 : 0
    } else if (u < 0.78) {
      const arm = rnd() < 0.5 ? 0 : 1
      r = Math.pow(rnd(), 0.8) * 0.95 + 0.05
      th = arm * Math.PI + Math.log(1 + r * 4) * 3.1 + gauss() * (0.1 + 0.22 * r)
      c = r < 0.42 ? 1 : 2
      a = 3
      s = 3 + rnd() * 3
    } else { r = Math.pow(rnd(), 0.55); th = rnd() * 6.283; c = r < 0.5 ? 1 : 2; a = rnd() < 0.7 ? 0 : 1 }
    const h = gauss() * 0.05 * (1 - r * 0.6)
    if (a !== 3 && rnd() < 0.035) s = 2
    const b = buckets[c * AL.length + a]
    b.r.push(r); b.t.push(th); b.h.push(h); b.s.push(s)
  }
  return buckets.map((b) => ({ r: Float32Array.from(b.r), t: Float32Array.from(b.t), h: Float32Array.from(b.h), s: Float32Array.from(b.s) }))
}

let cleanup = () => {}
let target = 1 /* rotation speed factor — the galaxy slows down while a system is hovered */

const focus = (key) => {
  active.value = key
  target = key ? 0.05 : 1
}

onMounted(() => {
  const panel = skyEl.value
  const cv = canvasEl.value
  const ctx = cv.getContext("2d")
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const small = () => window.innerWidth < 700
  const particles = buildParticles(reduced || small() ? 7000 : 15000)

  let W = 0, H = 0, cx = 0, cy = 0, R = 0
  let t = 0, speed = 1, ptrX = 0, ptrY = 0, phi = -0.3, S = 0.54
  let raf = 0, last = 0, visible = true, tabVisible = !document.hidden

  const size = () => {
    const r = panel.getBoundingClientRect()
    W = r.width; H = r.height
    cv.width = W * dpr; cv.height = H * dpr
    const narrow = W < 900
    cx = W * (narrow ? 0.5 : 0.56)
    cy = H * (narrow ? 0.5 : 0.52)
    R = Math.min(W * (narrow ? 0.5 : 0.39), H * (narrow ? 0.5 : 0.84))
  }

  const project = (r, th, h) => {
    const x = r * Math.cos(th), y = r * Math.sin(th) * S - (h || 0) * 0.86
    const cp = Math.cos(phi), sp = Math.sin(phi)
    return [cx + (x * cp - y * sp) * R, cy + (x * sp + y * cp) * R]
  }

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.globalCompositeOperation = "lighter"
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.42)
    g.addColorStop(0, "rgba(255,214,160,.45)"); g.addColorStop(0.35, "rgba(120,190,255,.14)"); g.addColorStop(1, "rgba(0,0,0,0)")
    ctx.fillStyle = g
    ctx.fillRect(cx - R * 0.5, cy - R * 0.5, R, R)

    const cp = Math.cos(phi), sp = Math.sin(phi)
    for (let bi = 0; bi < NB; bi++) {
      const b = particles[bi], col = COL[(bi / AL.length) | 0], al = AL[bi % AL.length]
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`
      for (let j = 0; j < b.r.length; j++) {
        const r = b.r[j], a = b.t[j] + omega(r) * t
        const x = r * Math.cos(a), y = r * Math.sin(a) * S - b.h[j] * 0.86, s = b.s[j]
        ctx.fillRect(cx + (x * cp - y * sp) * R - s * 0.5, cy + (x * sp + y * cp) * R - s * 0.5, s * 1.05, s * 1.05)
      }
    }
    ctx.globalCompositeOperation = "source-over"

    /* chart frame: range rings + bearing ticks, fixed to the map */
    ctx.strokeStyle = "rgba(148,163,184,.14)"; ctx.lineWidth = 1
    ;[0.33, 0.66, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(cx, cy, R * k * 1.04, R * k * 1.04 * S, phi, 0, 6.283); ctx.stroke() })
    ctx.fillStyle = "rgba(148,163,184,.4)"; ctx.font = '10px "DM Mono", monospace'; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    for (let d = 0; d < 360; d += 30) {
      const ang = (d * Math.PI) / 180
      const p1 = project(1.07, ang, 0), p2 = project(1.1, ang, 0), pp = project(1.16, ang, 0)
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke()
      ctx.fillText(`${d}°`, pp[0], pp[1])
    }
    ctx.strokeStyle = "rgba(148,163,184,.1)"
    ctx.beginPath(); ctx.moveTo(cx - R * 1.1, cy); ctx.lineTo(cx + R * 1.1, cy); ctx.moveTo(cx, cy - R * 0.62); ctx.lineTo(cx, cy + R * 0.62); ctx.stroke()
  }

  const place = () => {
    PRODUCTS.forEach((p, i) => {
      const el = systemEls[i]
      if (!el) return
      const th = p.galaxy.th + omega(p.galaxy.r) * t
      const pos = project(p.galaxy.r, th, 0)
      /* flip the label to the left when it would leave the panel on the right;
         a flipped system anchors on its right edge so the star stays on its spot */
      const labelW = Math.max(el.offsetWidth, 140)
      const flip = pos[0] + labelW > W - 12 && pos[0] - labelW > 12
      el.classList.toggle("left", flip)
      el.style.transform = `translate3d(${pos[0].toFixed(1)}px,${pos[1].toFixed(1)}px,0)${flip ? " translateX(-100%)" : ""}`
      if (p.key === active.value) {
        const ra = ((((th % 6.283) + 6.283) % 6.283) / 6.283) * 24
        const dec = (1 - p.galaxy.r) * 62 - 18
        liveReadout.value = `KAT-0${i + 1} · RA ${ra | 0}h ${((ra % 1) * 60) | 0}m · DEC ${dec >= 0 ? "+" : ""}${dec.toFixed(1)}°`
      }
    })
  }

  const frame = (now) => {
    raf = 0
    if (!(visible && tabVisible)) { last = 0; return }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
    last = now
    speed += (target - speed) * Math.min(dt * 4, 1)
    t += dt * speed
    S += (0.54 + ptrY * 0.05 - S) * 0.05
    phi += (-0.3 + ptrX * 0.05 - phi) * 0.05
    draw(); place()
    raf = requestAnimationFrame(frame)
  }
  const start = () => { if (!reduced && !raf && visible && tabVisible) raf = requestAnimationFrame(frame) }

  const onPointer = (e) => {
    const r = panel.getBoundingClientRect()
    ptrX = ((e.clientX - r.left) / r.width) * 2 - 1
    ptrY = ((e.clientY - r.top) / r.height) * 2 - 1
  }
  const onVisibility = () => { tabVisible = !document.hidden; if (tabVisible) start() }

  size(); draw(); place(); ready.value = true
  const ro = new ResizeObserver(() => { size(); draw(); place() })
  ro.observe(panel)
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start() })
  io.observe(panel)
  panel.addEventListener("pointermove", onPointer)
  document.addEventListener("visibilitychange", onVisibility)
  start()

  cleanup = () => {
    cancelAnimationFrame(raf)
    ro.disconnect(); io.disconnect()
    panel.removeEventListener("pointermove", onPointer)
    document.removeEventListener("visibilitychange", onVisibility)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<style scoped>
/* The sky is a window into space: it stays dark in light mode too, so it carries
   its own tokens instead of inheriting the page theme. */
.v6sg-sky {
  --v6-ink: #eef2f7;
  --v6-faint: #64748b;
  position: relative;
  width: 100%;
  height: clamp(540px, 74vh, 760px);
  border-radius: 22px;
  overflow: hidden;
  color: var(--v6-ink);
  background: radial-gradient(ellipse 70% 80% at 56% 52%, #0b1730 0%, #060c18 55%, #04080f 100%);
  border: 1px solid rgba(226, 232, 240, 0.1);
}
.v6sg-sky canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.v6sg-sky::before, .v6sg-sky::after {
  content: "";
  position: absolute;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(103, 232, 249, 0.45);
  z-index: 3;
  pointer-events: none;
}
.v6sg-sky::before { left: 16px; top: 16px; border-right: 0; border-bottom: 0; }
.v6sg-sky::after { right: 16px; bottom: 16px; border-left: 0; border-top: 0; }

.v6sg-read, .v6sg-hint {
  position: absolute;
  bottom: 1.4rem;
  margin: 0;
  z-index: 4;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  pointer-events: none;
}
.v6sg-read { left: 1.6rem; color: #64748b; transition: color 0.3s; }
.v6sg-read.on { color: var(--rc, #67e8f9); }
.v6sg-hint { right: 1.6rem; color: #475569; }

/* star systems */
.v6sg-sys {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: #eef2f7;
  text-decoration: none;
  will-change: transform;
  opacity: 0;
  transition: opacity 0.8s;
}
.v6sg-sky.ready .v6sg-sys { opacity: 1; }
.v6sg-star {
  position: relative;
  width: 44px;
  height: 44px;
  flex: none;
  margin: -22px 0 -22px -22px;
  display: grid;
  place-items: center;
}
.v6sg-star b {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--ac);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--ac) 18%, transparent), 0 0 30px 8px color-mix(in srgb, var(--ac) 60%, transparent);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.v6sg-orbit {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 1px solid color-mix(in srgb, var(--ac) 45%, transparent);
  border-radius: 50%;
  pointer-events: none;
}
.v6sg-orbit.o1 { width: 40px; height: 40px; margin: -20px; transform: rotateX(68deg) rotateZ(-20deg); }
.v6sg-orbit.o2 { width: 62px; height: 62px; margin: -31px; transform: rotateX(68deg) rotateZ(30deg); opacity: 0.55; }
.v6sg-orbit > i { position: absolute; inset: -1px; border-radius: 50%; animation: v6sg-spin 7s linear infinite; }
.v6sg-orbit.o2 > i { animation-duration: 12s; animation-direction: reverse; }
.v6sg-orbit > i::after {
  content: "";
  position: absolute;
  top: -2.5px;
  left: 50%;
  width: 5px;
  height: 5px;
  margin-left: -2.5px;
  border-radius: 50%;
  background: var(--ac-hi);
  box-shadow: 0 0 8px var(--ac-hi);
}
@keyframes v6sg-spin { to { transform: rotate(360deg); } }

.v6sg-lab {
  display: grid;
  gap: 0.1rem;
  max-width: 15rem;
  padding: 0.35rem 0.6rem;
  margin-left: 0.2rem;
  border-radius: 10px;
  border: 1px solid transparent;
  text-shadow: 0 0 10px #050b14, 0 0 3px #050b14;
  transition: background 0.3s, border-color 0.3s;
}
.v6sg-lab .v6-mono { color: var(--ac); font-size: 0.64rem; letter-spacing: 0.16em; }
.v6sg-lab strong {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.v6sg-lab em { font-family: var(--v6-display); font-weight: 700; font-style: italic; font-size: 0.85rem; color: var(--ac-hi); }
.v6sg-more { display: none; margin-top: 0.5rem; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }
.v6sg-more u {
  display: block;
  margin-top: 0.4rem;
  text-decoration: none;
  color: var(--ac-hi);
  font-family: var(--v6-display);
  font-weight: 700;
}
.v6sg-sys.on { z-index: 8; }
.v6sg-sys.on .v6sg-lab {
  background: rgba(6, 12, 24, 0.88);
  backdrop-filter: blur(8px);
  border-color: color-mix(in srgb, var(--ac) 45%, transparent);
  text-shadow: none;
}
.v6sg-sys.on .v6sg-more { display: block; }
.v6sg-sys.on .v6sg-star b { transform: scale(1.35); }
.v6sg-sys.left { flex-direction: row-reverse; text-align: right; }
.v6sg-sys.left .v6sg-star { margin: -22px -22px -22px 0; }
.v6sg-sys.left .v6sg-lab { margin: 0 0.2rem 0 0; }
.v6sg-sys:focus-visible { outline: none; }
.v6sg-sys:focus-visible .v6sg-lab { border-color: var(--ac-hi); }

@media (max-width: 900px) {
  .v6sg-sky { height: 72vh; min-height: 520px; }
  .v6sg-more, .v6sg-lab em, .v6sg-lab .v6-mono, .v6sg-hint { display: none !important; }
  .v6sg-lab strong { font-size: 1.05rem; }
}
@media (prefers-reduced-motion: reduce) {
  .v6sg-orbit > i { animation: none; }
}
</style>
