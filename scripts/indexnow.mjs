// Tells IndexNow (Bing, Yandex, Seznam, Naver …) which pages changed. Runs in CI
// after the deploy, so the live sitemap and the key file are already online.
// Google does not use IndexNow — it follows the sitemap.
//
//   node scripts/indexnow.mjs          URLs whose sitemap <lastmod> is today or yesterday
//   node scripts/indexnow.mjs --all    every URL in the sitemap
//
// The key is public by design: public/<key>.txt proves we own the host.

import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { ROOT, SITE_URL } from "./seo-routes.mjs"

const HOST = new URL(SITE_URL).host
const ENDPOINT = "https://api.indexnow.org/indexnow"
const submitAll = process.argv.includes("--all")

const keyFiles = readdirSync(join(ROOT, "public")).filter((name) => /^[0-9a-f]{32}\.txt$/.test(name))
if (keyFiles.length !== 1) throw new Error(`indexnow: expected exactly one public/<32 hex>.txt key file, found ${keyFiles.length}`)
const key = keyFiles[0].replace(".txt", "")
if (readFileSync(join(ROOT, "public", keyFiles[0]), "utf8").trim() !== key) {
  throw new Error(`indexnow: the content of public/${keyFiles[0]} must equal its file name`)
}

const sitemapResponse = await fetch(`${SITE_URL}/sitemap.xml`)
if (!sitemapResponse.ok) throw new Error(`indexnow: sitemap request failed with HTTP ${sitemapResponse.status}`)
const sitemap = await sitemapResponse.text()

const day = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)
const recent = new Set([day(0), day(1)])
const entries = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)]
  .map(([, loc, lastmod]) => ({ loc, lastmod }))
if (!entries.length) throw new Error("indexnow: no <url> entries found in the live sitemap")

const urlList = entries.filter((entry) => submitAll || recent.has(entry.lastmod)).map((entry) => entry.loc)
if (!urlList.length) {
  console.log("indexnow: no sitemap URL changed in the last two days — nothing to submit")
  process.exit(0)
}

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList }),
})
if (![200, 202].includes(response.status)) {
  throw new Error(`indexnow: submission rejected with HTTP ${response.status}: ${await response.text()}`)
}
console.log(`indexnow: submitted ${urlList.length} URL(s), HTTP ${response.status}`)
