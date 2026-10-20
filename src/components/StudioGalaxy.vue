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
   Modelled on the structure of a grand-design spiral (M81): a broad bulge,
   tightly wound arms, bright star-forming knots, dark dust lanes on the inner
   edge of the arms and a faint outer halo — in the site's own cyan / indigo. The smooth light (bulge + disc) is a
   gradient; arms, knots, dust and haze are particles in galaxy space (radius
   0..1, angle, height) projected through a tilted, rotated ellipse each frame.
   The star systems use the same projection, so they ride along with the arms. */
const COL = [
  [255, 236, 205], /* 0 hot core         */
  [150, 228, 255], /* 1 inner disc, cyan */
  [140, 235, 255], /* 2 cyan arms        */
  [150, 164, 255], /* 3 indigo arms      */
  [215, 248, 255], /* 4 bright knots     */
  [110, 118, 255], /* 5 outer haze       */
]
const AL = [0.34, 0.6, 0.92, 0.08] /* last alpha bucket = soft puffs */
const NB = COL.length * AL.length
const omega = (r) => 0.018 + 0.006 * (1 - r) /* rad/s — one turn in about five minutes */
const armAngle = (arm, r) => arm * Math.PI + Math.log(1 + r * 6) * 3.0

let seed = 11
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5

const buildGalaxy = (count) => {
  const buckets = Array.from({ length: NB }, () => ({ r: [], t: [], h: [], s: [] }))
  const add = (c, a, r, th, h, s) => {
    const b = buckets[c * AL.length + a]
    b.r.push(r); b.t.push(th); b.h.push(h); b.s.push(s)
  }
  const flat = (r) => gauss() * 0.04 * (1 - r * 0.6)

  /* bulge + inner disc: golden, round-ish */
  for (let i = 0; i < count * 0.12; i++) {
    const r = Math.abs(gauss()) * 0.26
    add(r < 0.1 ? 0 : 1, rnd() < 0.3 ? 2 : 1, r, rnd() * 6.283, gauss() * 0.06, 1)
  }
  /* golden disc grain between the arms */
  for (let i = 0; i < count * 0.12; i++) {
    const r = Math.pow(rnd(), 0.6) * 0.8
    add(1, rnd() < 0.4 ? 1 : 0, r, rnd() * 6.283, gauss() * 0.04, 1)
  }
  /* two main arms: warm near the core, blue-white outward, violet at the rim */
  for (let i = 0; i < count * 0.55; i++) {
    const arm = rnd() < 0.5 ? 0 : 1
    const r0 = Math.pow(rnd(), 0.85) * 0.98 + 0.02
    const r = Math.max(0.02, r0 + gauss() * 0.03)
    const th = armAngle(arm, r0) + gauss() * (0.2 + 0.28 * r0)
    const c = r0 > 0.8 && rnd() < 0.45 ? 3 : rnd() < 0.1 + 0.85 * r0 ? 2 : 1
    add(c, r0 > 0.7 && rnd() < 0.7 ? 0 : rnd() < 0.22 ? 2 : rnd() < 0.55 ? 1 : 0, r, th, flat(r), rnd() < 0.03 ? 2 : 1)
  }
  /* fainter feathers between the arms */
  for (let i = 0; i < count * 0.1; i++) {
    const arm = rnd() < 0.5 ? 0.5 : 1.5
    const r = Math.pow(rnd(), 0.9) * 0.9 + 0.1
    add(rnd() < 0.6 ? 2 : 3, 0, r, armAngle(arm, r) + gauss() * (0.2 + 0.14 * r), flat(r), 1)
  }
  /* soft blue puffs along the arms */
  for (let i = 0; i < count * 0.07; i++) {
    const arm = rnd() < 0.5 ? 0 : 1
    const r = Math.pow(rnd(), 0.85) * 0.95 + 0.05
    add(rnd() < 0.62 ? 2 : 3, 3, r, armAngle(arm, r) + gauss() * (0.15 + 0.2 * r), flat(r), 14 + rnd() * 14)
  }
  /* pink star-forming knots: tight clusters with a glow puff each */
  for (let i = 0; i < count * 0.007; i++) {
    const arm = rnd() < 0.5 ? 0 : 1
    const r = 0.24 + rnd() * 0.74
    const th0 = armAngle(arm, r) + gauss() * (0.1 + 0.12 * r)
    for (let k = 0; k < 4; k++) {
      add(4, rnd() < 0.6 ? 1 : 0, r + gauss() * 0.012, th0 + gauss() * 0.02, flat(r), 1.5 + rnd() * 1.5)
    }
    add(4, 3, r, th0, flat(r), 12 + rnd() * 6)
  }
  /* violet halo reaching past the last arm */
  for (let i = 0; i < count * 0.04; i++) {
    const arm = rnd() < 0.5 ? 0 : 1
    const r = 0.6 + rnd() * 0.55
    add(5, 3, r, armAngle(arm, Math.min(r, 1)) + gauss() * 0.34, flat(r), 10 + rnd() * 10)
  }
  const toTyped = (b) => ({ r: Float32Array.from(b.r), t: Float32Array.from(b.t), h: Float32Array.from(b.h), s: Float32Array.from(b.s) })

  /* dust lanes: dark specks on the inner edge of the arms */
  const dust = { r: [], t: [], h: [], s: [] }
  for (let i = 0; i < count * 0.14; i++) {
    const arm = rnd() < 0.5 ? 0 : 1
    const r = 0.16 + Math.pow(rnd(), 0.9) * 0.72
    dust.r.push(r); dust.t.push(armAngle(arm, r) - 0.17 - 0.07 * r + gauss() * 0.05); dust.h.push(0); dust.s.push(2 + rnd() * 2)
  }
  return { buckets: buckets.map(toTyped), dust: toTyped(dust) }
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
  const small = window.innerWidth < 700
  const { buckets, dust } = buildGalaxy(reduced || small ? 9000 : 20000)

  /* fixed background stars (they do not turn with the galaxy) */
  const bg = Array.from({ length: 90 }, () => ({ x: rnd(), y: rnd(), s: rnd() < 0.08 ? 2 : 1, c: rnd() < 0.5 ? "170,205,255" : "255,255,255", a: 0.25 + rnd() * 0.5 }))
  const bright = Array.from({ length: 5 }, () => ({ x: 0.08 + rnd() * 0.84, y: 0.1 + rnd() * 0.8 }))

  /* round, soft sprites for the puff bucket — fillRect puffs read as squares */
  const sprites = COL.map((c) => {
    const sc = document.createElement("canvas")
    sc.width = sc.height = 64
    const sctx = sc.getContext("2d")
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`)
    g.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},.4)`)
    g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
    sctx.fillStyle = g
    sctx.fillRect(0, 0, 64, 64)
    return sc
  })

  let W = 0, H = 0, cx = 0, cy = 0, R = 0
  let t = 0, speed = 1, ptrX = 0, ptrY = 0, phi = 0.38, phi0 = 0.38, S = 0.6, puffK = 1
  let raf = 0, last = 0, visible = true, tabVisible = !document.hidden
  let stride = 1, slowMs = 0 /* adaptive quality: thin the particles out when frames get slow */

  const size = () => {
    const r = panel.getBoundingClientRect()
    W = r.width; H = r.height
    cv.width = W * dpr; cv.height = H * dpr
    const narrow = W < 900
    cx = W * (narrow ? 0.5 : 0.56)
    cy = H * (narrow ? 0.5 : 0.52)
    R = Math.min(W * (narrow ? 0.62 : 0.37), H * (narrow ? 0.43 : 0.66))
    /* portrait panel: stand the galaxy up so it fills the height */
    phi0 = narrow ? 1.15 : 0.38
    puffK = Math.min(1.2, Math.max(0.45, R / 480))
  }

  const project = (r, th, h) => {
    const x = r * Math.cos(th), y = r * Math.sin(th) * S - (h || 0) * 0.86
    const cp = Math.cos(phi), sp = Math.sin(phi)
    return [cx + (x * cp - y * sp) * R, cy + (x * sp + y * cp) * R]
  }

  /* smooth light of the galaxy: elliptical gradients in the tilted disc plane */
  const glow = (radius, flatten, stops) => {
    ctx.save()
    ctx.translate(cx, cy); ctx.rotate(phi); ctx.scale(1, flatten)
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
    stops.forEach(([o, c]) => g.addColorStop(o, c))
    ctx.fillStyle = g
    ctx.fillRect(-radius, -radius, radius * 2, radius * 2)
    ctx.restore()
  }

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    /* background stars */
    bg.forEach((b) => { ctx.fillStyle = `rgba(${b.c},${b.a})`; ctx.fillRect(b.x * W, b.y * H, b.s, b.s) })
    ctx.strokeStyle = "rgba(215,235,255,.35)"; ctx.lineWidth = 1
    bright.forEach((b) => {
      const x = b.x * W, y = b.y * H
      ctx.fillStyle = "rgba(235,245,255,.9)"; ctx.fillRect(x - 1, y - 1, 2, 2)
      ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + 6, y); ctx.moveTo(x, y - 6); ctx.lineTo(x, y + 6); ctx.stroke()
    })

    ctx.globalCompositeOperation = "lighter"
    glow(R * 1.15, S, [[0, "rgba(110,118,255,.10)"], [0.6, "rgba(99,102,241,.05)"], [1, "rgba(99,102,241,0)"]])  /* indigo outer halo */
    glow(R * 0.82, S, [[0, "rgba(90,200,240,.30)"], [0.5, "rgba(60,170,235,.13)"], [1, "rgba(50,150,230,0)"]]) /* cyan disc */
    glow(R * 0.58, S, [[0, "rgba(120,215,255,.18)"], [1, "rgba(90,190,255,0)"]])
    glow(R * 0.34, (S + 1) / 2, [[0, "rgba(255,244,222,.8)"], [0.3, "rgba(200,235,255,.42)"], [1, "rgba(110,200,255,0)"]]) /* bulge */
    glow(R * 0.06, 1, [[0, "rgba(255,255,255,.95)"], [1, "rgba(255,240,210,0)"]]) /* core */

    const cp = Math.cos(phi), sp = Math.sin(phi)

    /* dust lanes sit on top of the glow, below the stars */
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = "rgba(4,10,24,.3)"
    for (let j = 0; j < dust.r.length; j += stride) {
      const r = dust.r[j], a = dust.t[j] + omega(r) * t, x = r * Math.cos(a), y = r * Math.sin(a) * S, s = dust.s[j]
      ctx.fillRect(cx + (x * cp - y * sp) * R - s * 0.5, cy + (x * sp + y * cp) * R - s * 0.5, s, s)
    }

    ctx.globalCompositeOperation = "lighter"
    for (let bi = 0; bi < NB; bi++) {
      const b = buckets[bi], col = COL[(bi / AL.length) | 0], al = AL[bi % AL.length]
      if (!b.r.length) continue
      const isPuff = bi % AL.length === AL.length - 1
      if (isPuff) {
        ctx.globalAlpha = al * 1.5
        const sprite = sprites[(bi / AL.length) | 0]
        for (let j = 0; j < b.r.length; j += stride) {
          const r = b.r[j], a = b.t[j] + omega(r) * t
          const x = r * Math.cos(a), y = r * Math.sin(a) * S - b.h[j] * 0.86, s = b.s[j] * puffK
          ctx.drawImage(sprite, cx + (x * cp - y * sp) * R - s, cy + (x * sp + y * cp) * R - s, s * 2, s * 2)
        }
        ctx.globalAlpha = 1
        continue
      }
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${al})`
      for (let j = 0; j < b.r.length; j += stride) {
        const r = b.r[j], a = b.t[j] + omega(r) * t
        const x = r * Math.cos(a), y = r * Math.sin(a) * S - b.h[j] * 0.86, s = b.s[j] * (stride > 1 ? 1.3 : 1)
        ctx.fillRect(cx + (x * cp - y * sp) * R - s * 0.5, cy + (x * sp + y * cp) * R - s * 0.5, s * 1.05, s * 1.05)
      }
    }
    ctx.globalCompositeOperation = "source-over"

    /* chart frame: range rings + bearing ticks, fixed to the map */
    ctx.strokeStyle = "rgba(148,163,184,.12)"; ctx.lineWidth = 1
    ;[0.33, 0.66, 1].forEach((k) => { ctx.beginPath(); ctx.ellipse(cx, cy, R * k * 1.04, R * k * 1.04 * S, phi, 0, 6.283); ctx.stroke() })
    ctx.fillStyle = "rgba(148,163,184,.4)"; ctx.font = '10px "DM Mono", monospace'; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    for (let d = 0; d < 360; d += 30) {
      const ang = (d * Math.PI) / 180
      const p1 = project(1.07, ang, 0), p2 = project(1.1, ang, 0), pp = project(1.16, ang, 0)
      ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke()
      ctx.fillText(`${d}°`, pp[0], pp[1])
    }
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
    if (dt > 0) {
      slowMs = dt > 0.034 ? slowMs + dt : Math.max(0, slowMs - dt)
      if (slowMs > 1.2 && stride < 3) { stride++; slowMs = 0 }
    }
    speed += (target - speed) * Math.min(dt * 4, 1)
    t += dt * speed
    S += (0.6 + ptrY * 0.05 - S) * 0.05
    phi += (phi0 + ptrX * 0.05 - phi) * 0.05
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

  size(); phi = phi0; draw(); place(); ready.value = true
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
  text-shadow: 0 0 14px #050b14, 0 0 6px #050b14, 0 1px 2px rgba(0, 0, 0, 0.9);
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
