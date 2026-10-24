<template>
  <div ref="skyEl" class="v6ns-sky" :class="{ ready }" :aria-label="t('studio.sky.aria')">
    <canvas ref="canvasEl" aria-hidden="true"></canvas>
    <canvas ref="lensEl" class="v6ns-lens" aria-hidden="true"></canvas>

    <div ref="uiEl" class="v6ns-ui" :class="{ off: uiOff }">
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
const lensEl = ref(null)
const nameEl = ref(null)
const systemEls = []
const ready = ref(false)
const uiEl = ref(null)
const uiOff = ref(false)
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
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const sdpr = Math.min(dpr, 1.5)

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

  /* accent colours of the app stars as rgb triplets, for the canvas signals */
  const accRGB = PRODUCTS.map((p) => {
    const h = p.accent.dark[1].slice(1)
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  })

  /* ── gravitational lens at the pointer ──
     A point-mass lens: a ray that would land at distance r is pulled in so that the sky we see there is the sky at
     β = r − E²/r (E = Einstein radius). Stars near the ring are stretched into arcs, a bright Einstein ring forms at
     r = E, and inside it the picture is mirrored around a dark core. The deflection fades out towards the rim so the
     patch blends into the sky without a seam. The pixel map is built once; each frame only copies the small patch under
     the pointer from the sky canvas, remaps it and lays it back on top. */
  const LENS_R = 56 /* CSS px */
  const initLens = () => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return null
    const N = Math.round(LENS_R * 2 * dpr)
    const el = lensEl.value
    el.width = el.height = N
    el.style.width = el.style.height = `${LENS_R * 2}px`
    el.style.opacity = "0"
    const src = document.createElement("canvas")
    src.width = src.height = N
    const sctx = src.getContext("2d", { willReadFrequently: true })
    const lctx = el.getContext("2d")
    const out = lctx.createImageData(N, N)
    const R = N / 2, E = 0.25 * R
    const mx = new Float32Array(N * N), my = new Float32Array(N * N)
    const boost = new Float32Array(N * N), fade = new Float32Array(N * N), rim = new Float32Array(N * N)
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = y * N + x
        const dx = x + 0.5 - R, dy = y + 0.5 - R
        const r = Math.max(Math.hypot(dx, dy), 1e-3)
        const t = smooth(0.5 * R, R, r) /* 0 inside, 1 at the rim */
        const beta = r - ((E * E) / r) * (1 - t)
        mx[i] = R + (dx / r) * beta - 0.5 /* -0.5: pixel centres, so the identity at the rim hits pixels exactly */
        my[i] = R + (dy / r) * beta - 0.5
        /* point-lens magnification 1/|1 − (E/r)⁴|, tamed so the ring glows instead of blowing out */
        const mu = Math.min(1 / Math.max(Math.abs(1 - Math.pow(E / r, 4)), 0.01), 2.6)
        fade[i] = 1 - smooth(0.8 * R, R, Math.abs(beta)) * (1 - t) /* sky beyond the patch (the very centre) goes dark; the rim stays untouched */
        boost[i] = (mu - 1) * (1 - t) /* stars brighten where they are magnified; the faint haze keeps its brightness */
        rim[i] = 0.2 * Math.exp(-(((r - E) / (0.05 * R)) ** 2)) * (1 - t)
        out.data[i * 4 + 3] = r >= R ? 0 : Math.round(255 * (1 - smooth(0.94 * R, R, r)))
      }
    }
    return { el, sctx, lctx, out, N, R, mx, my, boost, fade, rim, x: 0, y: 0, alpha: 0 }
  }
  const lens = initLens()

  const drawLens = () => {
    if (!lens) return
    const on = ptrIn && !active.value && !covered
    if (!on && lens.alpha < 0.02) { /* idle: park the lens under the pointer so it appears in place */
      lens.alpha = 0; lens.el.style.opacity = "0"; lens.x = ptrPx; lens.y = ptrPy
      return
    }
    lens.alpha += ((on ? 1 : 0) - lens.alpha) * 0.18
    lens.x += (ptrPx - lens.x) * 0.3
    lens.y += (ptrPy - lens.y) * 0.3
    const { el, sctx, lctx, out, N, mx, my, boost, fade, rim } = lens
    el.style.opacity = lens.alpha.toFixed(3)
    /* snap to whole device pixels so the patch lines up with the sky underneath it exactly */
    const ox = Math.round((lens.x - LENS_R) * dpr), oy = Math.round((lens.y - LENS_R) * dpr)
    el.style.transform = `translate3d(${ox / dpr}px,${oy / dpr}px,0)`
    sctx.clearRect(0, 0, N, N)
    sctx.drawImage(canvasEl.value, ox, oy, N, N, 0, 0, N, N)
    const sd = sctx.getImageData(0, 0, N, N).data
    const od = out.data
    const last = N - 2
    for (let i = 0, n = N * N; i < n; i++) {
      if (od[i * 4 + 3] === 0) continue
      let sx = mx[i], sy = my[i]
      sx = sx < 0 ? 0 : sx > last ? last : sx
      sy = sy < 0 ? 0 : sy > last ? last : sy
      const x0 = sx | 0, y0 = sy | 0, fx = sx - x0, fy = sy - y0
      const a = (y0 * N + x0) * 4, b = a + 4, c = a + N * 4, d = c + 4
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy
      const bs = boost[i], fd = fade[i], rm = rim[i] * 255
      const k = i * 4
      let v = sd[a] * w00 + sd[b] * w10 + sd[c] * w01 + sd[d] * w11
      v = (v + (v > 70 ? bs * (v - 70) : 0)) * fd + rm * 0.8
      od[k] = v > 255 ? 255 : v
      v = sd[a + 1] * w00 + sd[b + 1] * w10 + sd[c + 1] * w01 + sd[d + 1] * w11
      v = (v + (v > 70 ? bs * (v - 70) : 0)) * fd + rm * 0.9
      od[k + 1] = v > 255 ? 255 : v
      v = sd[a + 2] * w00 + sd[b + 2] * w10 + sd[c + 2] * w01 + sd[d + 2] * w11
      v = (v + (v > 70 ? bs * (v - 70) : 0)) * fd + rm
      od[k + 2] = v > 255 ? 255 : v
    }
    lctx.putImageData(out, 0, 0)
  }

  let W = 0, H = 0
  let px = 0, py = 0                       /* rotation pivot, far below the panel */
  let ox = 0, oy = 0, SW = 0, SH = 0       /* the pre-rendered sky covers [ox, ox+SW] × [oy, oy+SH] in panel px */
  let sky = null, dyn = [], pts = [], ghosts = []
  let angle = 0, tSec = 0, panX = 0, panY = 0, ptrX = 0, ptrY = 0
  let ptrPx = 0, ptrPy = 0, ptrIn = false /* pointer in panel px, for the lens */
  let meteors = [], pulses = [], pings = [], nextMeteor = 2.2
  let lineNext = CONSTELLATION_LINES.map(() => 0.8 + rnd() * 3.5)
  let raf = 0, last = 0, visible = true, tabVisible = !document.hidden
  let buildToken = 0, resizeTimer = 0
  let uiFade = 1, covered = false /* scroll: app stars fade out, then the page covers the sky and we stop drawing */

  /* ── layout in panel coordinates ── */
  const layout = () => {
    const r = panel.getBoundingClientRect()
    W = r.width; H = r.height
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
    px = W * 0.5; py = H * 1.35
    ox = -0.4 * W; oy = -0.35 * H; SW = 1.8 * W; SH = 1.7 * H

    /* the hero copy owns the top of the stage; the constellation lives below it */
    const skyPos = (s) => [(s.x / 100) * W, (0.4 + (s.y / 100) * 0.46) * H]
    pts = PRODUCTS.map((p) => skyPos(p.star))
    ghosts = GHOST_STARS.map((g) => ({ pos: skyPos({ x: g.x, y: g.y }), from: PRODUCTS.findIndex((p) => p.key === g.from) }))
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
        data[k + 3] = Math.max(0, Math.min(0.6, light * 0.31)) * 255
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
    const area = Math.min(1.7, (SW * SH) / 2.7e6) /* star density per px stays the same whatever the stage size */
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
        if (rnd() < 0.14) {
          dyn.push({ x: X, y: Y, s, ti, ph: rnd() * 6.283, f: 0.5 + rnd() * 1.8 })
          continue
        }
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
      gi.data[k + 3] = rnd() * 7
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

    /* deep space: black */
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, W, H)

    if (sky) {
      ctx.save()
      ctx.translate(panX, panY)
      ctx.translate(px, py); ctx.rotate(angle); ctx.translate(-px, -py)
      ctx.drawImage(sky, ox, oy, SW, SH)

      /* constellation lines, in sky space */
      ctx.globalAlpha = uiFade
      const hot = PRODUCTS.findIndex((p) => p.key === active.value)
      CONSTELLATION_LINES.forEach(([ka, kb]) => {
        const ia = PRODUCTS.findIndex((p) => p.key === ka), ib = PRODUCTS.findIndex((p) => p.key === kb)
        const [ax, ay] = pts[ia], [bx, by] = pts[ib]
        const len = Math.hypot(bx - ax, by - ay) || 1
        const ux = (bx - ax) / len, uy = (by - ay) / len, gap = 9 /* stops at the star's glow, pointing straight at its centre */
        ctx.strokeStyle = ia === hot || ib === hot ? "rgba(200,230,255,.9)" : "rgba(180,210,245,.55)"
        ctx.lineWidth = 0.6
        ctx.beginPath(); ctx.moveTo(ax + ux * gap, ay + uy * gap); ctx.lineTo(bx - ux * gap, by - uy * gap); ctx.stroke()
      })
      ghosts.forEach((gh) => {
        const [ax, ay] = pts[gh.from], [bx, by] = gh.pos
        ctx.strokeStyle = "rgba(170,205,245,.3)"; ctx.lineWidth = 0.6; ctx.setLineDash([2, 5])
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke(); ctx.setLineDash([])
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = (0.45 + 0.3 * Math.sin(tSec * 0.9 + bx * 0.05)) * uiFade
        ctx.drawImage(sprites[2], bx - 6, by - 6, 12, 12)
        ctx.globalAlpha = uiFade
        ctx.globalCompositeOperation = "source-over"
      })

      /* atmospheric scintillation: the brighter stars waver a little in brightness and
         drift between their own colour and the neighbouring one, never in size */
      ctx.globalCompositeOperation = "lighter"
      for (let i = 0; i < dyn.length; i++) {
        const d = dyn[i]
        const a = 0.78 + 0.14 * Math.sin(tSec * d.f * 3.1 + d.ph) + 0.08 * Math.sin(tSec * d.f * 7.3 + d.ph * 2.7)
        const m = 0.45 * (0.5 + 0.5 * Math.sin(tSec * d.f * 1.3 + d.ph * 1.7)) /* share of the neighbouring colour */
        const alt = d.ti === 0 ? 1 : d.ti === TEMPS.length - 1 ? d.ti - 1 : d.ph > 3.14 ? d.ti + 1 : d.ti - 1
        const x = d.x - d.s / 2, y = d.y - d.s / 2
        ctx.globalAlpha = a * (1 - m)
        ctx.drawImage(sprites[d.ti], x, y, d.s, d.s)
        ctx.globalAlpha = a * m
        ctx.drawImage(sprites[alt], x, y, d.s, d.s)
      }
      ctx.globalAlpha = 1

      /* signals travelling the constellation lines, and the ping when one arrives */
      const ease = (p) => p * p * (3 - 2 * p)
      ctx.globalAlpha = uiFade
      if (uiFade > 0.02) pulses.forEach((pl) => {
        const k = Math.min(1, (tSec - pl.t0) / pl.dur)
        const [ax, ay] = pts[pl.a], [bx, by] = pts[pl.b]
        const hk = ease(k), tk = ease(Math.max(0, k - 0.14))
        const hx = ax + (bx - ax) * hk, hy = ay + (by - ay) * hk
        const tx = ax + (bx - ax) * tk, ty = ay + (by - ay) * tk
        const [r, g, b] = accRGB[pl.b]
        const fade = Math.sin(k * Math.PI)
        const tail = ctx.createLinearGradient(tx, ty, hx, hy)
        tail.addColorStop(0, `rgba(${r},${g},${b},0)`)
        tail.addColorStop(1, `rgba(${r},${g},${b},${(0.9 * fade).toFixed(2)})`)
        ctx.strokeStyle = tail; ctx.lineWidth = 1.6; ctx.lineCap = "round"
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke()
        const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, 9)
        glow.addColorStop(0, `rgba(255,255,255,${(0.95 * fade).toFixed(2)})`)
        glow.addColorStop(0.3, `rgba(${r},${g},${b},${(0.6 * fade).toFixed(2)})`)
        glow.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = glow; ctx.fillRect(hx - 9, hy - 9, 18, 18)
      })
      if (uiFade > 0.02) pings.forEach((pg) => {
        const k = (tSec - pg.t0) / 1.4
        const [x, y] = pts[pg.i], [r, g, b] = accRGB[pg.i]
        ctx.strokeStyle = `rgba(${r},${g},${b},${(0.7 * (1 - k) * (1 - k)).toFixed(2)})`
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(x, y, 6 + 32 * (1 - (1 - k) * (1 - k)), 0, 6.283); ctx.stroke()
      })
      ctx.lineCap = "butt"
      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = "source-over"
      ctx.restore()

      /* shooting stars cross the panel in screen space */
      ctx.globalCompositeOperation = "lighter"
      ctx.lineCap = "round"
      meteors.forEach((m) => {
        const el = tSec - m.t0
        const fade = Math.sin(Math.min(1, el / m.dur) * Math.PI)
        const hx = m.x + m.vx * el, hy = m.y + m.vy * el
        const sp = Math.hypot(m.vx, m.vy)
        const tx = hx - (m.vx / sp) * m.len * fade, ty = hy - (m.vy / sp) * m.len * fade
        const gr = ctx.createLinearGradient(tx, ty, hx, hy)
        gr.addColorStop(0, "rgba(190,225,255,0)")
        gr.addColorStop(1, `rgba(235,246,255,${(0.95 * fade).toFixed(2)})`)
        ctx.strokeStyle = gr; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(hx, hy); ctx.stroke()
        ctx.globalAlpha = fade
        ctx.drawImage(sprites[1], hx - 7, hy - 7, 14, 14)
        ctx.globalAlpha = 1
      })
      ctx.lineCap = "butt"
      ctx.globalCompositeOperation = "source-over"
    }
  }

  /* signs of life: meteors now and then, signals running along the constellation lines */
  const tick = () => {
    if (tSec > nextMeteor) {
      const dir = rnd() < 0.5 ? 1 : -1
      const ang = (22 + rnd() * 20) * (Math.PI / 180)
      const speed = 750 + rnd() * 450
      meteors.push({
        x: W * (dir > 0 ? 0.08 + rnd() * 0.45 : 0.47 + rnd() * 0.45), y: H * (0.22 + rnd() * 0.36),
        vx: Math.cos(ang) * speed * dir, vy: Math.sin(ang) * speed,
        len: 110 + rnd() * 110, dur: 0.7 + rnd() * 0.5, t0: tSec,
      })
      nextMeteor = tSec + 5 + rnd() * 7
    }
    meteors = meteors.filter((m) => tSec - m.t0 < m.dur)

    CONSTELLATION_LINES.forEach(([ka, kb], li) => {
      if (tSec < lineNext[li]) return
      const ia = PRODUCTS.findIndex((p) => p.key === ka), ib = PRODUCTS.findIndex((p) => p.key === kb)
      const rev = rnd() < 0.5
      pulses.push({ a: rev ? ib : ia, b: rev ? ia : ib, t0: tSec, dur: 1.8 + rnd() * 0.8 })
      lineNext[li] = tSec + 3.5 + rnd() * 5
    })
    pulses = pulses.filter((pl) => {
      if (tSec - pl.t0 < pl.dur) return true
      pings.push({ i: pl.b, t0: tSec })
      return false
    })
    pings = pings.filter((pg) => tSec - pg.t0 < 1.4)
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
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translateY(-50%)${flip ? " translateX(-100%)" : ""}`
      if (p.key === active.value) {
        const ra = (((x / W) * 24) % 24 + 24) % 24
        const dec = 62 - (y / H) * 80
        liveReadout.value = `KAT-0${i + 1} · RA ${ra | 0}h ${((ra % 1) * 60) | 0}m · DEC ${dec >= 0 ? "+" : ""}${dec.toFixed(1)}°`
      }
    })
    if (pts.length) {
      const cx = pts.reduce((s, q) => s + q[0], 0) / pts.length
      const cy = pts.reduce((s, q) => s + q[1], 0) / pts.length
      const [x, y] = rot(cx, cy)
      if (nameEl.value) nameEl.value.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`
    }
  }

  const frame = (now) => {
    raf = 0
    if (!(visible && tabVisible) || covered) { last = 0; return }
    const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
    last = now
    tSec += dt
    /* a very slow drift around the celestial pole — swings back and forth so the stars never leave the frame */
    angle = 0.3 * Math.sin((tSec / 1800) * 6.283)
    panX += (ptrX * 10 - panX) * 0.05
    panY += (ptrY * 6 - panY) * 0.05

    tick(); draw(); drawLens(); place()
    raf = requestAnimationFrame(frame)
  }
  const start = () => { if (!reduced && !raf && visible && tabVisible && !covered) raf = requestAnimationFrame(frame) }

  const onPointer = (e) => {
    const r = panel.getBoundingClientRect()
    ptrX = ((e.clientX - r.left) / r.width) * 2 - 1
    ptrY = ((e.clientY - r.top) / r.height) * 2 - 1
    ptrPx = e.clientX - r.left; ptrPy = e.clientY - r.top
    ptrIn = ptrPx >= 0 && ptrPx <= r.width && ptrPy >= 0 && ptrPy <= r.height
  }
  const onLeave = () => { ptrIn = false }
  const onScroll = () => {
    const vh = window.innerHeight, y = window.scrollY
    const k = Math.min(1, Math.max(0, y / (vh * 0.5)))
    uiFade = 1 - k * k * (3 - 2 * k)
    if (uiEl.value) uiEl.value.style.opacity = uiFade.toFixed(3)
    uiOff.value = uiFade < 0.02
    if (uiOff.value) active.value = null
    const wasCovered = covered
    covered = y >= vh
    if (wasCovered && !covered) start()
    if (!covered && !raf && sky) { draw(); place() } /* reduced motion: no loop, repaint on scroll */
  }
  const onVisibility = () => { tabVisible = !document.hidden; if (tabVisible) start() }

  layout()
  onScroll()
  build().then(() => start())
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => { layout(); sky = null; build().then(() => start()) }, 250)
  })
  ro.observe(panel)
  const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) start() })
  io.observe(panel)
  window.addEventListener("pointermove", onPointer, { passive: true })
  document.documentElement.addEventListener("mouseleave", onLeave)
  window.addEventListener("scroll", onScroll, { passive: true })
  document.addEventListener("visibilitychange", onVisibility)

  cleanup = () => {
    buildToken++
    clearTimeout(resizeTimer)
    cancelAnimationFrame(raf)
    ro.disconnect(); io.disconnect()
    window.removeEventListener("pointermove", onPointer)
    document.documentElement.removeEventListener("mouseleave", onLeave)
    window.removeEventListener("scroll", onScroll)
    document.removeEventListener("visibilitychange", onVisibility)
  }
})

onBeforeUnmount(() => cleanup())
</script>

<style scoped>
/* The sky is the fixed page background: full-bleed and black; the page content scrolls over it. It carries its own tokens so it stays dark in both themes. */
.v6ns-sky {
  --v6-ink: #eef2f7;
  --v6-faint: #64748b;
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  color: var(--v6-ink);
  pointer-events: none;
}
/* everything that is not the sky itself: app stars, labels, readout. Fades out on scroll. */
.v6ns-ui { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
.v6ns-ui.off { visibility: hidden; }
.v6ns-sky canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 0;
  transition: opacity 1.4s;
}
.v6ns-sky.ready canvas { opacity: 1; }
/* the lens patch follows the pointer; opacity and position are set from script every frame */
.v6ns-sky .v6ns-lens {
  inset: auto;
  left: 0;
  top: 0;
  z-index: 1;
  width: auto;
  height: auto;
  transition: none;
  will-change: transform, opacity;
}
/* quiet zone: dims the starfield behind the hero copy and the nav so they stay readable */
.v6ns-sky::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.5) 24%, rgba(0, 0, 0, 0.18) 40%, transparent 52%);
}

.v6ns-name {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
  margin: 0;
  padding-top: 4rem;
  color: rgba(190, 215, 250, 0.4);
  font-size: 0.7rem;
  letter-spacing: 0.5em;
  pointer-events: none;
  white-space: nowrap;
}
.v6ns-read, .v6ns-hint {
  position: absolute;
  bottom: 14%;
  margin: 0;
  z-index: 6;
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  pointer-events: none;
  text-shadow: 0 0 8px #000;
}
.v6ns-read { left: var(--v6-gutter, 1.6rem); color: #7d8ca3; transition: color 0.3s; }
.v6ns-read.on { color: var(--rc, #67e8f9); }
.v6ns-hint { right: var(--v6-gutter, 1.6rem); color: #64748b; }

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
  pointer-events: auto;
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
.v6ns-star::before {
  content: "";
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--ac) 55%, transparent) 0%, transparent 70%);
  animation: v6ns-breathe 4.2s ease-in-out infinite;
}
.v6ns-sys:nth-of-type(2) .v6ns-star::before { animation-delay: -1.1s; }
.v6ns-sys:nth-of-type(3) .v6ns-star::before { animation-delay: -2.3s; }
.v6ns-sys:nth-of-type(4) .v6ns-star::before { animation-delay: -3.2s; }
@keyframes v6ns-breathe {
  0%, 100% { transform: scale(0.8); opacity: 0.45; }
  50% { transform: scale(1.5); opacity: 1; }
}
@media (prefers-reduced-motion: reduce) { .v6ns-star::before { animation: none; } }
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
  text-shadow: 0 0 14px #000, 0 0 6px #000, 0 1px 2px rgba(0, 0, 0, 0.9);
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
  background: rgba(2, 6, 14, 0.92);
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
</style>
