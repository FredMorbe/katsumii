// Build-time SEO regression check — `npm run seo-audit` (also runs as part of
// `npm run build` via postbuild). Reads dist/ and exits non-zero on any error;
// warnings are printed but do not fail the build.

import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import {
  HREFLANG_BY_LOCALE,
  ROOT,
  SITE_URL,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  indexableRoutes,
  localeText,
  localizedRoutePath,
  routeUrl,
  staticRouteMeta,
} from "../scripts/seo-routes.mjs"

const DIST = join(ROOT, "dist")
const MIN_BODY_TEXT = 400
const TITLE_MAX = 65
// zh-TW glyphs are about twice as wide as Latin ones, so its snippet budget is in half the characters
const DESCRIPTION_RANGE = { en: [70, 165], de: [70, 165], zht: [25, 90] }

const errors = []
const warnings = []
const fail = (where, message) => errors.push(`${where}: ${message}`)
const warn = (where, message) => warnings.push(`${where}: ${message}`)

if (!existsSync(join(DIST, "sitemap.xml"))) {
  throw new Error("seo-audit: dist/ is missing — run `npm run build` first")
}

const read = (file) => readFileSync(join(DIST, file), "utf8")
const decode = (value) => value.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&lt;", "<").replaceAll("&gt;", ">")
const tagAttr = (tag, name) => decode(tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"))?.[1] ?? "")
const bodyOf = (html) => html.match(/<div id="app"[^>]*>([\s\S]*)<\/div>\s*<\/body>/)?.[1] ?? ""
const textOf = (fragment) => fragment.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()

const distFileForUrlPath = (path) => join(path.replace(/^\/+/, ""), "index.html")

const sitemap = read("sitemap.xml")
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))

for (const route of indexableRoutes) {
  for (const locale of SUPPORTED_LOCALES) {
    const path = localizedRoutePath(route, locale)
    const where = path
    const file = distFileForUrlPath(path)
    if (!existsSync(join(DIST, file))) {
      fail(where, `dist/${file} is missing`)
      continue
    }
    const html = read(file)
    const expected = routeUrl(route, locale)

    // rendered content without JavaScript
    const body = bodyOf(html)
    if (!body) fail(where, "empty <div id=\"app\"> — prerender did not run or found no content")
    else {
      if (!/<h1[\s>]/.test(body)) fail(where, "no <h1> in the static HTML body")
      const text = textOf(body)
      if (text.length < MIN_BODY_TEXT) fail(where, `static body text is only ${text.length} chars`)
      for (const img of body.match(/<img\b[^>]*>/g) ?? []) {
        if (!/\salt=/.test(img)) warn(where, `<img> without alt: ${img.slice(0, 80)}…`)
      }
    }

    // head signals
    const canonical = tagAttr(html.match(/<link\s+rel="canonical"[^>]*>/)?.[0] ?? "", "href")
    if (canonical !== expected) fail(where, `canonical is "${canonical}", expected "${expected}"`)
    if (/noindex/i.test(html.match(/<meta\s+name="robots"[^>]*>/)?.[0] ?? "")) fail(where, "indexable route carries noindex")
    if (tagAttr(html.match(/<meta\s+property="og:url"[^>]*>/)?.[0] ?? "", "content") !== expected) fail(where, "og:url differs from canonical")
    if (!html.includes(`<html lang="${HREFLANG_BY_LOCALE[locale]}">`)) fail(where, `<html lang> is not ${HREFLANG_BY_LOCALE[locale]}`)

    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "")
    const description = tagAttr(html.match(/<meta\s+name="description"[^>]*>/)?.[0] ?? "", "content")
    if (title.length > TITLE_MAX) warn(where, `title is ${title.length} chars (>${TITLE_MAX})`)
    const [descriptionMin, descriptionMax] = DESCRIPTION_RANGE[locale]
    if (description.length < descriptionMin || description.length > descriptionMax) {
      warn(where, `description is ${description.length} chars (want ${descriptionMin}–${descriptionMax})`)
    }
    if (title !== localeText(locale, route.titleKey)) fail(where, "title differs from the locale file")

    // hreflang: full set, self-referencing, x-default, all targets exist
    const alternates = [...html.matchAll(/<link\s+rel="alternate"[^>]*hreflang="[^"]*"[^>]*>/g)]
      .map((m) => [tagAttr(m[0], "hreflang"), tagAttr(m[0], "href")])
    const alternateMap = Object.fromEntries(alternates)
    for (const alt of SUPPORTED_LOCALES) {
      if (alternateMap[HREFLANG_BY_LOCALE[alt]] !== routeUrl(route, alt)) fail(where, `hreflang ${HREFLANG_BY_LOCALE[alt]} is not ${routeUrl(route, alt)}`)
    }
    if (alternateMap["x-default"] !== routeUrl(route, DEFAULT_LOCALE)) fail(where, "hreflang x-default is wrong")

    // structured data must parse
    const ld = html.match(/<script id="katsumii-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)
    if (!ld) fail(where, "JSON-LD block missing")
    else {
      try {
        const graph = JSON.parse(ld[1])["@graph"]
        if (!Array.isArray(graph) || !graph.length) fail(where, "JSON-LD @graph is empty")
        else {
          const software = graph.find((node) => node["@type"] === "SoftwareApplication")
          if (!software?.offers?.length) fail(where, "SoftwareApplication has no offers")
          const faq = graph.find((node) => node["@type"] === "FAQPage")
          if (route.path === "/faq" && !faq?.mainEntity?.length) fail(where, "FAQPage JSON-LD missing or empty")
          if (route.path !== "/faq" && faq) fail(where, "FAQPage JSON-LD on a page without the FAQ")
        }
      } catch (err) {
        fail(where, `JSON-LD does not parse: ${err.message}`)
      }
    }

    // sitemap
    if (!sitemapUrls.has(expected)) fail(where, "not listed in sitemap.xml")

    // internal links: canonical form (trailing slash) and existing target
    for (const [, href] of body.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)) {
      if (!href.startsWith("/") || href.startsWith("//")) continue
      const linkPath = href.split(/[#?]/)[0]
      if (!linkPath.endsWith("/")) fail(where, `internal link without trailing slash: ${href}`)
      else if (!existsSync(join(DIST, distFileForUrlPath(linkPath)))) fail(where, `broken internal link: ${href}`)
    }
  }
}

// sitemap must only contain indexable, existing pages
const knownUrls = new Set(indexableRoutes.flatMap((route) => SUPPORTED_LOCALES.map((locale) => routeUrl(route, locale))))
for (const url of sitemapUrls) {
  if (!knownUrls.has(url)) fail("sitemap.xml", `unexpected URL ${url}`)
  if (!url.startsWith(SITE_URL) || !url.endsWith("/")) fail("sitemap.xml", `URL not in canonical form: ${url}`)
}
if (sitemapUrls.size !== knownUrls.size) fail("sitemap.xml", `${sitemapUrls.size} URLs, expected ${knownUrls.size}`)
for (const [, lastmod] of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lastmod) || lastmod > new Date().toISOString().slice(0, 10)) fail("sitemap.xml", `invalid lastmod ${lastmod}`)
}

// noindex routes must not be in the sitemap
for (const route of staticRouteMeta.filter((r) => r.robots?.includes("noindex"))) {
  for (const locale of SUPPORTED_LOCALES) {
    if (sitemapUrls.has(routeUrl(route, locale))) fail("sitemap.xml", `noindex page ${route.path} is listed`)
  }
}

// 404: noindex, no canonical
const notFound = read("404.html")
if (!/name="robots"[^>]*noindex/i.test(notFound)) fail("404.html", "missing noindex")
if (/rel="canonical"/i.test(notFound)) fail("404.html", "must not carry a canonical")
if (/location\.replace|http-equiv="refresh"/i.test(notFound)) fail("404.html", "must not redirect — it has to stay a real 404")

// robots.txt must announce the sitemap; llms.txt and the IndexNow key must ship
if (!read("robots.txt").includes(`Sitemap: ${SITE_URL}/sitemap.xml`)) fail("robots.txt", "Sitemap line missing")
if (!existsSync(join(DIST, "llms.txt"))) fail("llms.txt", "missing")
const keyFiles = readdirSync(DIST).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name))
if (keyFiles.length !== 1) fail("indexnow", `expected one key file in dist, found ${keyFiles.length}`)

// domain root: readable content, canonical → landing
const root = read("index.html")
if (!bodyOf(root)) fail("/", "index.html has no prerendered content")
if (tagAttr(root.match(/<link\s+rel="canonical"[^>]*>/)?.[0] ?? "", "href") !== routeUrl({ path: "/app" }, DEFAULT_LOCALE)) fail("/", "root canonical is not the English landing page")

if (warnings.length) console.warn(`seo-audit: ${warnings.length} warning(s)\n  ${warnings.join("\n  ")}\n`)
if (errors.length) {
  console.error(`seo-audit: ${errors.length} error(s)\n  ${errors.join("\n  ")}`)
  process.exit(1)
}
console.log(`seo-audit ok — ${indexableRoutes.length * SUPPORTED_LOCALES.length} pages checked, ${warnings.length} warning(s)`)
