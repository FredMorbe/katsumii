// Generate public/sitemap.xml from the canonical route list.
// Run via `node scripts/build-sitemap.mjs` — the prebuild hook does this
// automatically before `vite build`, so `npm run build` always ships a fresh file.

import { execFileSync } from "node:child_process"
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = resolve(__dirname, "..", "public", "sitemap.xml")

const SITE = "https://www.katsumii.com"

const LOCALES = [
  { locale: "en", hreflang: "en" },
  { locale: "de", hreflang: "de" },
  { locale: "zht", hreflang: "zh-TW" },
]
const DEFAULT_LOCALE = "en"

// Only pages that should be indexed. Excludes /journal/welcome, /journal/bugreport, 404.
// path "" is the studio landing (katsumii.com/en).
const PAGES = [
  { path: "",                              priority: "1.0", changefreq: "weekly" },
  { path: "/journal",                      priority: "1.0", changefreq: "weekly" },
  { path: "/journal/features",             priority: "0.9", changefreq: "monthly" },
  { path: "/journal/prop-firm-challenges", priority: "0.8", changefreq: "monthly" },
  { path: "/journal/funded-accounts",      priority: "0.8", changefreq: "monthly" },
  { path: "/journal/personal-trading",     priority: "0.8", changefreq: "monthly" },
  { path: "/journal/backtesting",          priority: "0.8", changefreq: "monthly" },
  { path: "/journal/analytics-reviews",    priority: "0.8", changefreq: "monthly" },
  { path: "/journal/customization",        priority: "0.8", changefreq: "monthly" },
  { path: "/journal/workflow",             priority: "0.8", changefreq: "monthly" },
  { path: "/journal/local-offline",        priority: "0.7", changefreq: "monthly" },
  { path: "/journal/pricing",              priority: "0.9", changefreq: "monthly" },
  { path: "/journal/manual",               priority: "0.7", changefreq: "monthly" },
  { path: "/journal/faq",                  priority: "0.7", changefreq: "monthly" },
  { path: "/andromeda",                    priority: "0.8", changefreq: "monthly" },
  { path: "/tidii-cleaner",                priority: "0.8", changefreq: "monthly" },
  { path: "/cubamii",                      priority: "0.8", changefreq: "monthly" },
  { path: "/contact",                      priority: "0.5", changefreq: "yearly" },
  { path: "/privacy",                      priority: "0.3", changefreq: "yearly" },
  { path: "/terms",                        priority: "0.3", changefreq: "yearly" },
  { path: "/impressum",                    priority: "0.3", changefreq: "yearly" },
  { path: "/security",                     priority: "0.3", changefreq: "yearly" },
]

// lastmod has to describe the last real change, not the moment of the build.
// Using `new Date()` restamped all 68 URLs on every build — including pages
// like /impressum that had not changed in months — which teaches crawlers to
// ignore the field. The HEAD commit date is stable across rebuilds and is
// available even in CI's shallow (depth=1) checkout.
const lastmod = (() => {
  try {
    return execFileSync("git", ["log", "-1", "--format=%cs"], {
      cwd: resolve(__dirname, ".."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim()
  } catch (err) {
    throw new Error(
      `sitemap: cannot read the HEAD commit date via git — ${err.message}\n` +
      `The sitemap needs it for <lastmod>; run the build inside the git checkout.`
    )
  }
})()

const urlFor = (locale, path) => `${SITE}/${locale}${path}`

const urls = []
for (const page of PAGES) {
  for (const { locale } of LOCALES) {
    const alternates = LOCALES
      .map(({ locale: l, hreflang }) =>
        `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${urlFor(l, page.path)}" />`
      )
      .join("\n")
    const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(DEFAULT_LOCALE, page.path)}" />`

    urls.push(
      `  <url>\n` +
      `    <loc>${urlFor(locale, page.path)}</loc>\n` +
      `    <lastmod>${lastmod}</lastmod>\n` +
      `    <changefreq>${page.changefreq}</changefreq>\n` +
      `    <priority>${page.priority}</priority>\n` +
      `${alternates}\n${xDefault}\n` +
      `  </url>`
    )
  }
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  urls.join("\n") + "\n" +
  `</urlset>\n`

mkdirSync(dirname(outPath), { recursive: true })
writeFileSync(outPath, xml, "utf8")
console.log(`sitemap.xml written: ${urls.length} URLs → ${outPath}`)
