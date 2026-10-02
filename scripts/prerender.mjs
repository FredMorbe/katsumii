// Post-build prerender: opens every indexable route in headless Chrome, takes
// the rendered #app markup and writes it into the static HTML that
// vite.config.js already produced (dist/<locale>/<route>/index.html). The
// result is readable without JavaScript — AI crawlers (GPTBot, ClaudeBot,
// PerplexityBot …) and link-preview bots do not execute JS.
//
// Needs a Chrome/Chromium binary: CHROME_PATH, or a standard install
// (GitHub's ubuntu runners ship google-chrome). No browser download.

import { existsSync } from "node:fs"
import { readFile, stat, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"
import puppeteer from "puppeteer-core"
import { ROOT, SUPPORTED_LOCALES, indexableRoutes, localizedRoutePath } from "./seo-routes.mjs"

const DIST = resolve(ROOT, "dist")
const CONCURRENCY = 4
const MIN_TEXT_LENGTH = 400

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean)

const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate))
if (!chromePath) {
  throw new Error(`prerender: no Chrome/Chromium found. Set CHROME_PATH. Looked in:\n  ${CHROME_CANDIDATES.join("\n  ")}`)
}
if (!existsSync(join(DIST, "app.html"))) {
  throw new Error("prerender: dist/app.html is missing — run `vite build` first (npm run build does both).")
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=utf-8",
}

// Serves dist/ like GitHub Pages: folder → index.html, unknown → 404.html + 404.
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname)
    let file = normalize(join(DIST, pathname))
    if (!file.startsWith(DIST)) throw new Error("outside dist")
    const info = await stat(file).catch(() => null)
    if (info?.isDirectory()) file = join(file, "index.html")
    const body = await readFile(file).catch(() => null)
    if (body) {
      res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" })
      res.end(body)
      return
    }
    res.writeHead(404, { "Content-Type": MIME[".html"] })
    res.end(await readFile(join(DIST, "404.html")))
  } catch (err) {
    res.writeHead(500)
    res.end(String(err))
  }
})
await new Promise((done) => server.listen(0, "127.0.0.1", done))
const origin = `http://127.0.0.1:${server.address().port}`

// Internal links come out of vue-router without the canonical trailing slash.
const withTrailingSlash = (html) =>
  html.replace(/href="(\/(?:en|de|zht)\/[^"#?]*?)(?=[#?"])/g, (match, path) => (path.endsWith("/") ? match : `href="${path}/`))

const cleanSnapshot = (html) =>
  withTrailingSlash(html)
    .replace(/<canvas[\s\S]*?<\/canvas>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")

const snapshot = async (browser, url) => {
  const page = await browser.newPage()
  const errors = []
  page.on("pageerror", (err) => errors.push(err.message))
  try {
    await page.setViewport({ width: 1440, height: 900 })
    // Reduced motion → GSAP reveals and WebGL settle on their final, still state.
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem("katsumii-consent", "denied") // no banner, no analytics
      localStorage.setItem("katsumii-theme", "light")
    })
    const response = await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 })
    if (response.status() !== 200) throw new Error(`HTTP ${response.status()}`)
    await page.waitForSelector("#app h1", { timeout: 30000 })
    await page.waitForSelector("#app footer", { timeout: 30000 })
    await page.evaluate(() => document.fonts.ready)
    await new Promise((done) => setTimeout(done, 400))
    if (errors.length) throw new Error(`page errors: ${errors.join(" | ")}`)

    const { html, text } = await page.evaluate(() => {
      const app = document.getElementById("app")
      return { html: app.innerHTML, text: app.innerText }
    })
    if (text.trim().length < MIN_TEXT_LENGTH) throw new Error(`rendered text is only ${text.trim().length} chars`)
    return cleanSnapshot(html)
  } finally {
    await page.close()
  }
}

const inject = async (file, appHtml) => {
  const source = await readFile(file, "utf8")
  const matcher = /<div id="app"[^>]*>[\s\S]*<\/div>(\s*<\/body>)/
  if (!matcher.test(source)) throw new Error(`prerender: no #app container in ${file}`)
  await writeFile(file, source.replace(matcher, (_match, tail) => `<div id="app" data-prerendered>${appHtml}</div>${tail}`))
}

const jobs = indexableRoutes.flatMap((route) =>
  SUPPORTED_LOCALES.map((locale) => ({ route, locale, path: localizedRoutePath(route, locale) })),
)

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
})

const failures = []
let landingSnapshot = null
try {
  const queue = [...jobs]
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const job = queue.shift()
      try {
        const html = await snapshot(browser, `${origin}${job.path}`)
        await inject(join(DIST, job.path, "index.html"), html)
        if (job.locale === "en" && job.route.path === "/app") landingSnapshot = html
        console.log(`prerender ok  ${job.path}  (${(html.length / 1024).toFixed(0)} kB)`)
      } catch (err) {
        failures.push(`${job.path}: ${err.message}`)
      }
    }
  }))
} finally {
  await browser.close()
  server.close()
}

if (failures.length) {
  throw new Error(`prerender failed for ${failures.length} page(s):\n  ${failures.join("\n  ")}`)
}

// The domain root serves index.html (canonical → /en/app/): give it the same
// readable landing content instead of an empty shell.
await inject(join(DIST, "index.html"), landingSnapshot)
console.log(`prerender done: ${jobs.length} pages + /`)
