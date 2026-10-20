<template>
  <div ref="skyEl" class="v6ns-sky" :class="{ ready }" :aria-label="t('studio.sky.aria')">
    <canvas ref="canvasEl" aria-hidden="true"></canvas>

    <p ref="nameEl" class="v6ns-name v6-mono" aria-hidden="true">{{ t('studio.sky.constellation') }}</p>

    <RouterLink
      v-for="(p, i) in PRODUCTS"
      :key="p.key"
      :ref="(el) => (systemEls[i] = el?.$el || el)"
      class="v6ns-sys"
      :class="{ on: active === p.key }"
      :to="`/${lang}${p.path}`"
      :style="{ '--ac': p.accent.dark[0], '--ac-hi': p.accent.dark[1] }"
      @mouseenter="focus(p.key)"
      @mouseleave="focus(null)"
      @focus="focus(p.key)"
      @blur="focus(null)"
    >
      <span class="v6ns-star" aria-hidden="true"><b></b></span>
      <span class="v6ns-lab">
        <span class="v6-mono">KAT-0{{ i + 1 }} · {{ t(`studio.platform.${p.platform}`) }}</span>
        <strong>{{ t(`products.${p.key}.name`) }}</strong>
        <em>{{ t(`products.${p.key}.tagline`) }}</em>
        <span class="v6ns-more">{{ t(`products.${p.key}.desc`) }}<u>{{ t('studio.sky.open') }} →</u></span>
      </span>
    </RouterLink>

    <p class="v6ns-read v6-mono" :class="{ on: active }" :style="readStyle" aria-hidden="true">{{ readout }}</p>
    <p class="v6ns-hint v6-mono" aria-hidden="true">{{ t('studio.sky.hint') }}</p>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"
import { normalizeLocale } from "../utils/routes.js"
import { CONSTELLATION_LINES, GHOST_STARS, PRODUCTS, productByKey } from "../utils/products.js"

const { t } = useI18n()
const route = useRoute()
const lang = computed(() => {
  const raw = Array.isArray(route.params.locale) ? route.params.locale[0] : route.params.locale
  return normalizeLocale(raw)
})

const skyEl = ref(null)
const canvasEl = ref(null)
const nameEl = ref(null)
const systemEls = []
const ready = ref(false)
const active = ref(null)
const liveReadout = ref("")
const readout = computed(() => (active.value ? liveReadout.value : t("studio.sky.readout")))
const readStyle = computed(() => {
  const p = PRODUCTS.find((x) => x.key === active.value)
  return p ? { "--rc": p.accent.dark[1] } : {}
})
const focus = (key) => { active.value = key }

/* ── noise (for the Milky Way) ─────────────────────────────── */
const hash = (x, y) => {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}
const vnoise = (x, y) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}
const fbm = (x, y, oct) => {
  let sum = 0, amp = 0.5, f = 1, norm = 0
  for (let i = 0; i < oct; i++) { sum += amp * vnoise(x * f, y * f); norm += amp; f *= 2.03; amp *= 0.5 }
  return sum / norm
}
const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k) }

let seed = 29
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

/* star colour classes (blue-white … orange-red), weights roughly as seen by eye */
const TEMPS = [[165, 195, 255], [205, 222, 255], [255, 250, 240], [255, 234, 190], [255, 196, 140], [255, 160, 115]]
const TEMP_CUM = [0.14, 0.34, 0.66, 0.86, 0.96, 1]
const pickTemp = () => { const u = rnd(); return TEMP_CUM.findIndex((c) => u <= c) }

let cleanup = () => {}

onMounted(() => {
  const panel = skyEl.value
  const cv = canvasEl.value
  const ctx = cv.getContext("2d")
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const sdpr = Math.min(dpr, 1.25)

  /* glow sprites, one per colour class */
  const sprites = TEMPS.map((c) => {
    const sc = document.createElement("canvas")
    sc.width = sc.height = 64
    const g = sc.getContext("2d")
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    gr.addColorStop(0, "rgba(255,255,255,1)")
    gr.addColorStop(0.12, `rgba(${c[0]},${c[1]},${c[2]},.95)`)
    gr.addColorStop(0.4, `rgba(${c[0]},${c[1]},${c[2]},.28)`)
    gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`)
    g.fillStyle = gr
    g.fillRect(0, 0, 64, 64)
    return sc
  })

  let W = 0, H = 0, narrow = false
  let px = 0, py = 0                       /* rotation pivot, far below the panel */
  let ox = 0, oy = 0, SW = 0, SH = 0       /* the pre-rendered sky covers [ox, ox+SW] × [oy, oy+SH] in panel px */
  let sky = null, dyn = [], pts = [], ghosts = []
  let angle = 0, tSec = 0, panX = 0, panY = 0, ptrX = 0, ptrY = 0
  let raf = 0, last = 0, visible = true, tabVisible = !document.hidden
  let buildToken = 0, resizeTimer = 0

  /* ── layout in panel coordinates ── */
  const layout = () => {
    const r = panel.getBoundingClientRect()
    W = r.width; H = r.height
    narrow = W < 900
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    px = W * 0.5; py = H * 1.35
    ox = -0.4 * W; oy = -0.35 * H; SW = 1.8 * W; SH = 1.7 * H

    const skyPos = (s) => narrow
      ? [(s.mx / 100) * W, (s.my / 100 * 0.86 + 0.05) * H]
      : [(s.x / 100) * W, (s.y / 100 * 0.84 + 0.06) * H]
    pts = PRODUCTS.map((p) => skyPos(p.star))
    ghosts = GHOST_STARS.map((g) => ({ pos: skyPos({ x: g.x, y: g.y, mx: g.mx, my: g.my }), from: PRODUCTS.findIndex((p) => p.key === g.from) }))
  }

  /* ── Milky Way band geometry (panel coordinates, angle 0) ── */
  const bandCos = Math.cos(-0.52), bandSin = Math.sin(-0.52)
  const bandAt = (X, Y, cheap) => {
    const Cx = W * 0.48, Cy = H * 0.4
    const dx = X - Cx, dy = Y - Cy
    const d = -dx * bandSin + dy * bandCos
    const u = dx * bandCos + dy * bandSin
    const warp = (fbm(X * 0.0035, Y * 0.0035, cheap ? 2 : 3) - 0.5) * 0.55 * H
    const dd = d + warp
    const width = 0.17 * H * (1 + 0.35 * Math.sin(u / (0.4 * W) + 1))
    return { dd, u, width, profile: Math.exp(-((dd / width) ** 2)) }
  }

  /* ── build the static sky (async in slices so the page never stalls) ── */
  const build = async () => {
    const token = ++buildToken
    const sc = document.createElement("canvas")
    sc.width = Math.round(SW * sdpr); sc.height = Math.round(SH * sdpr)
    const g = sc.getContext("2d")
    g.scale(sdpr, sdpr)
    g.translate(-ox, -oy)

    /* Milky Way as a soft low-res image */
    const SCALE = 4
    const mw = document.createElement("canvas")
    mw.width = Math.ceil(SW / SCALE); mw.height = Math.ceil(SH / SCALE)
    const mg = mw.getContext("2d")
    const img = mg.createImageData(mw.width, mw.height)
    const data = img.data
    for (let j = 0; j < mw.height; j++) {
      for (let i = 0; i < mw.width; i++) {
        const X = ox + i * SCALE, Y = oy + j * SCALE
        const { dd, u, width, profile } = bandAt(X, Y, false)
        if (profile < 0.02) continue
        const cloud = fbm(X * 0.006, Y * 0.006, 4)
        const core = Math.exp(-(((u - 0.22 * W) / (0.22 * W)) ** 2)) * Math.exp(-((dd / (width * 0.7)) ** 2))
        let light = profile * (0.28 + 1.2 * cloud) * (1 + 1.3 * core)
        /* the Great Rift: a dark lane along the band, plus dusty clumps */
        const lane = Math.exp(-(((dd + 0.04 * H) / (width * 0.2)) ** 2)) * smooth(0.32, 0.68, fbm(X * 0.01, Y * 0.01 + 7, 3))
        const clump = smooth(0.52, 0.74, fbm(X * 0.013, Y * 0.013 + 19, 4)) * Math.pow(profile, 0.7)
        light *= 1 - 0.9 * lane - 0.72 * clump
        const warm = Math.min(1, core * 0.9) * smooth(0.3, 0.7, cloud)
        const k = (j * mw.width + i) * 4
        /* deep-sky blue-teal like a long exposure; only the core leans warm */
        data[k] = 55 + 150 * warm
        data[k + 1] = 135 + 55 * warm
        data[k + 2] = 185 - 20 * warm
        data[k + 3] = Math.max(0, Math.min(0.66, light * 0.36)) * 255
      }
      if (j % 24 === 0) {
        await new Promise((r) => setTimeout(r, 0))
        if (token !== buildToken) return
      }
    }
    mg.putImageData(img, 0, 0)
    g.imageSmoothingEnabled = true
    g.imageSmoothingQuality = "high"
    g.drawImage(mw, ox, oy, SW, SH)

    /* stars. A real exposure: tens of thousands of pinpoints, only a handful bright;
       starlight too faint to resolve piles up inside the band as fine grain. */
    dyn = []
    g.globalCompositeOperation = "lighter"
    const area = Math.min(1, (SW * SH) / 2.7e6) /* star density per px stays the same on small panels */
    const candidates = Math.round(190000 * area)
    for (let n = 0; n < candidates; n++) {
      const X = ox + rnd() * SW, Y = oy + rnd() * SH
      const prof = bandAt(X, Y, true).profile
      /* unresolved grain inside the band */
      if (rnd() < 0.5 * prof * prof) {
        g.fillStyle = `rgba(170,215,245,${(0.05 + rnd() * 0.14).toFixed(2)})`
        g.fillRect(X, Y, 1, 1)
      }
      if (rnd() > 0.3 + 0.7 * prof) continue
      const u = rnd(), ti = pickTemp(), c = TEMPS[ti]
      if (u < 0.86) {
        g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(0.2 + rnd() * 0.5).toFixed(2)})`
        g.fillRect(X, Y, 1, 1)
      } else if (u < 0.965) {
        g.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${(0.55 + rnd() * 0.4).toFixed(2)})`
        g.fillRect(X - 0.25, Y - 0.25, 1.5, 1.5)
      } else if (u < 0.9965) {
        const s = 3 + rnd() * 2.5
        g.globalAlpha = 0.85
        g.drawImage(sprites[ti], X - s / 2, Y - s / 2, s, s)
        g.globalAlpha = 1
      } else {
        dyn.push({ x: X, y: Y, s: 6 + rnd() * 5, ti, ph: rnd() * 6.283, f: 0.6 + rnd() * 1.6 })
      }
    }
    g.globalCompositeOperation = "source-over"

    /* sensor grain over everything */
    const gn = document.createElement("canvas")
    gn.width = gn.height = 200
    const gg = gn.getContext("2d")
    const gi = gg.createImageData(200, 200)
    for (let k = 0; k < gi.data.length; k += 4) {
      gi.data[k] = gi.data[k + 1] = gi.data[k + 2] = 200
      gi.data[k + 3] = rnd() * 22
    }
    gg.putImageData(gi, 0, 0)
    g.fillStyle = g.createPattern(gn, "repeat")
    g.fillRect(ox, oy, SW, SH)
    if (token !== buildToken) return
    sky = sc
    ready.value = true
    draw()
    place()
  }

  /* ── drawing ── */
  const rot = (x, y) => {
    const c = Math.cos(angle), s = Math.sin(angle)
    return [px + (x - px) * c - (y - py) * s + panX, py + (x - px) * s + (y - py) * c + panY]
  }

  const draw = () => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    /* deep space: the sky is never pure black in a long exposure, it is a very dark blue */
    const bgG = ctx.createLinearGradient(0, 0, 0, H)
    bgG.addColorStop(0, "#020711"); bgG.addColorStop(0.5, "#041122"); bgG.addColorStop(1, "#061a2c")
    ctx.fillStyle = bgG
    ctx.fillRect(0, 0, W, H)

    if (sky) {
      ctx.save()
      ctx.translate(panX, panY)
      ctx.translate(px, py); ctx.rotate(angle); ctx.translate(-px, -py)
      ctx.drawImage(sky, ox, oy, SW, SH)

      /* constellation lines, in sky space */
      const hot = PRODUCTS.findIndex((p) => p.key === active.value)
      CONSTELLATION_LINES.forEach(([ka, kb]) => {
        const ia = PRODUCTS.findIndex((p) => p.key === ka), ib = PRODUCTS.findIndex((p) => p.key === kb)
        const [ax, ay] = pts[ia], [bx, by] = pts[ib]
        const len = Math.hypot(bx - ax, by - ay) || 1
        const ux = (bx - ax) / len, uy = (by - ay) / len, gap = 16
        ctx.strokeStyle = ia === hot || ib === hot ? "rgba(190,225,255,.8)" : "rgba(170,205,245,.46)"
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(ax + ux * gap, ay + uy * gap); ctx.lineTo(bx - ux * gap, by - uy * gap); ctx.stroke()
      })
      ghosts.forEach((gh) => {
        const [ax, ay] = pts[gh.from], [bx, by] = gh.pos
        ctx.strokeStyle = "rgba(170,205,245,.2)"; ctx.setLineDash([3, 6])
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([])
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = 0.7
        ctx.drawImage(sprites[2], bx - 6, by - 6, 12, 12)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
      })

      /* the few bright stars scintillate a little */
      ctx.globalCompositeOperation = "lighter"
      for (let i = 0; i < dyn.length; i++) {
        const d = dyn[i]
        const tw = reduced ? 1 : 0.85 + 0.15 * Math.sin(tSec * d.f * 2.2 + d.ph) * Math.sin(tSec * d.f * 0.7 + d.ph * 1.9)
        ctx.globalAlpha = Math.min(1, tw)
        ctx.drawImage(sprites[d.ti], d.x - d.s / 2, d.y - d.s / 2, d.s, d.s)
      }
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      ctx.restore()
    }
  }

  /* markers follow the sky */
  const place = () => {
    PRODUCTS.forEach((p, i) => {
      const el = systemEls[i]
      if (!el || !pts[i]) return
      const [x, y] = rot(pts[i][0], pts[i][1])
      const labelW = Math.max(el.offsetWidth, 140)
      const flip = x + labelW > W - 12 && x - labelW > 12
      el.classList.toggle("left", flip)
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)${flip ? " translateX(-100%)" : ""}`
      if (p.key === active.value) {
        const ra = (((x / W) * 24) % 24 + 24) % 24
        const dec = 62 - (y / H) * 80
        liveReadout.value = `KAT-0${i + 1} · RA ${ra | 0}h ${((ra % 1) * 60) | 0}m · DEC ${dec >= 0 ? "+" : ""}${dec.toFixed(1)}°`
      }
    })
    if (nameEl.value && pts.length) {
      const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length
      const cy = pts.reduce((s, q) => s + q[1], 0) / pts.length
      const [x, y] = rot(cx, cy)
      nameEl.value.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`
    }
  }

  const frame = (now) => {
    raf = 0
    if (!(visible && tabVisible)) { last = 0; return }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
    last = now
    tSec += dt
    /* a very slow drift around the celestial pole — swings back and forth so the stars never leave the frame */
    angle = 0.3 * Math.sin((tSec / 1800) * 6.283)
    panX += (ptrX * 10 - panX) * 0.05
    panY += (ptrY * 6 - panY) * 0.05

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

  layout()
  build().then(() => start())
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { layout(); sky = null; build().then(() => start()) }, 250)
  })
  ro.observe(panel)
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start() })
  io.observe(panel)
  panel.addEventListener("pointermove", onPointer)
  document.addEventListener("visibilitychange", onVisibility)

  cleanup = () => {
    buildToken++
    clearTimeout(resizeTimer)
    cancelAnimationFrame(raf)
    ro.disconnect(); io.disconnect()
    panel.removeEventListener("pointermove", onPointer)
    document.removeEventListener("visibilitychange", onVisibility)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<style scoped>
/* A window onto a real night sky — dark in both themes, so it carries its own tokens. */
.v6ns-sky {
  --v6-ink: #eef2f7;
  --v6-faint: #64748b;
  position: relative;
  width: 100%;
  height: clamp(540px, 74vh, 760px);
  border-radius: 22px;
  overflow: hidden;
  color: var(--v6-ink);
  background: #020711;
  border: 1px solid rgba(226, 232, 240, 0.1);
}
.v6ns-sky canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; opacity: 0; transition: opacity 1.2s; }
.v6ns-sky.ready canvas { opacity: 1; }
.v6ns-sky::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: radial-gradient(ellipse 80% 90% at 50% 48%, transparent 60%, rgba(0, 4, 12, 0.5) 100%);
}

.v6ns-name {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  margin: 0;
  padding-top: 4.6rem;
  color: rgba(190, 215, 250, 0.4);
  font-size: 0.7rem;
  letter-spacing: 0.5em;
  pointer-events: none;
  white-space: nowrap;
}
.v6ns-read, .v6ns-hint {
  position: absolute;
  bottom: 1.2rem;
  margin: 0;
  z-index: 6;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  pointer-events: none;
  text-shadow: 0 0 8px #01030a;
}
.v6ns-read { left: 1.6rem; color: #7d8ca3; transition: color 0.3s; }
.v6ns-read.on { color: var(--rc, #67e8f9); }
.v6ns-hint { right: 1.6rem; color: #64748b; }

/* the app stars */
.v6ns-sys {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: #eef2f7;
  text-decoration: none;
  will-change: transform;
  opacity: 0;
  transition: opacity 1s 0.4s;
}
.v6ns-sky.ready .v6ns-sys { opacity: 1; }
.v6ns-star {
  position: relative;
  width: 56px;
  height: 56px;
  flex: none;
  margin: -28px 0 -28px -28px;
  display: grid;
  place-items: center;
}
.v6ns-star b {
  position: relative;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 3px 1px #fff, 0 0 14px 4px color-mix(in srgb, var(--ac) 75%, transparent), 0 0 34px 10px color-mix(in srgb, var(--ac) 30%, transparent);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

.v6ns-lab {
  display: grid;
  gap: 0.1rem;
  max-width: 15rem;
  padding: 0.35rem 0.6rem;
  margin-left: -0.3rem;
  border-radius: 10px;
  border: 1px solid transparent;
  text-shadow: 0 0 14px #01030a, 0 0 6px #01030a, 0 1px 2px rgba(0, 0, 0, 0.9);
  transition: background 0.3s, border-color 0.3s;
}
.v6ns-lab .v6-mono { color: var(--ac); font-size: 0.64rem; letter-spacing: 0.16em; }
.v6ns-lab strong {
  font-family: var(--v6-display);
  font-weight: 700;
  font-size: 1.3rem;
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.v6ns-lab em { font-family: var(--v6-display); font-weight: 700; font-style: italic; font-size: 0.85rem; color: var(--ac-hi); }
.v6ns-more { display: none; margin-top: 0.5rem; color: #94a3b8; font-size: 0.82rem; line-height: 1.5; }
.v6ns-more u {
  display: block;
  margin-top: 0.4rem;
  text-decoration: none;
  color: var(--ac-hi);
  font-family: var(--v6-display);
  font-weight: 700;
}
.v6ns-sys.on { z-index: 8; }
.v6ns-sys.on .v6ns-lab {
  background: rgba(3, 8, 18, 0.9);
  backdrop-filter: blur(8px);
  border-color: color-mix(in srgb, var(--ac) 45%, transparent);
  text-shadow: none;
}
.v6ns-sys.on .v6ns-more { display: block; }
.v6ns-sys.on .v6ns-star b { transform: scale(1.4); }
.v6ns-sys.left { flex-direction: row-reverse; text-align: right; }
.v6ns-sys.left .v6ns-star { margin: -28px -28px -28px 0; }
.v6ns-sys.left .v6ns-lab { margin: 0 -0.3rem 0 0; }
.v6ns-sys:focus-visible { outline: none; }
.v6ns-sys:focus-visible .v6ns-lab { border-color: var(--ac-hi); }

@media (max-width: 900px) {
  .v6ns-sky { height: 72vh; min-height: 520px; }
  .v6ns-more, .v6ns-lab em, .v6ns-lab .v6-mono, .v6ns-hint { display: none !important; }
  .v6ns-lab strong { font-size: 1.05rem; }
  .v6ns-name { font-size: 0.6rem; letter-spacing: 0.35em; }
}
</style>
