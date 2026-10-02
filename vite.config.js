import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {
  DEFAULT_LOCALE,
  HREFLANG_BY_LOCALE,
  LEGACY_LOCALE_PREFIXES,
  LEGACY_PROTOTYPE_PATHS,
  SITE_URL,
  SOCIAL_IMAGE,
  SUPPORTED_LOCALES,
  localeText,
  localeValue,
  localizedRoutePath,
  routeUrl,
  sitemapXml,
  staticRouteMeta,
} from './scripts/seo-routes.mjs'
import { buildStructuredGraph } from './src/utils/structuredData.js'

const appRoutes = new Set([
  '/app',
  '/features',
  '/prop-firm-challenges',
  '/funded-accounts',
  '/personal-trading',
  '/backtesting',
  '/analytics-reviews',
  '/customization',
  '/workflow',
  '/local-offline',
  '/pricing',
  '/manual',
  '/faq',
  '/contact',
  '/bugreport',
  '/impressum',
  '/privacy',
  '/terms',
  '/security',
  '/welcome',
])

const localizedPreviewPath = (route, locale) => localizedRoutePath(route, locale).replace(/\/+$/, '')

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const upsertMetaTag = (html, matcher, tag) => {
  if (matcher.test(html)) return html.replace(matcher, tag)
  return html.replace('</head>', `  ${tag}\n</head>`)
}

const normalizePreviewPath = (pathname = '/') => pathname.replace(/\/+$/, '') || '/'

const staticPreviewPaths = new Set([
  ...staticRouteMeta.flatMap((route) => [
    route.path,
    ...SUPPORTED_LOCALES.map((locale) => localizedPreviewPath(route, locale)),
  ]),
  ...SUPPORTED_LOCALES.map((locale) => `/${locale}`),
])

const hasStaticPreviewPage = (pathname) => staticPreviewPaths.has(normalizePreviewPath(pathname))

const alternateTags = (route) => [
  ...SUPPORTED_LOCALES.map((locale) =>
    `<link rel="alternate" hreflang="${HREFLANG_BY_LOCALE[locale]}" href="${routeUrl(route, locale)}" data-katsumii-hreflang="true" />`
  ),
  `<link rel="alternate" hreflang="x-default" href="${routeUrl(route, 'en')}" data-katsumii-hreflang="true" />`,
].join('\n  ')

const stripAlternateTags = (html) =>
  html.replace(/\n\s*<link\s+rel="alternate"[^>]*data-katsumii-hreflang="true"[^>]*>/gi, '')

const structuredDataJson = (route, locale, title, description, canonical) => {
  const appRoute = staticRouteMeta.find((item) => item.path === '/app')
  const graph = buildStructuredGraph({
    siteUrl: SITE_URL,
    socialImage: SOCIAL_IMAGE,
    softwareUrl: routeUrl(appRoute, 'en'),
    canonicalUrl: canonical,
    lang: HREFLANG_BY_LOCALE[locale],
    title,
    description,
    appDescription: localeText(locale, 'common.pageDescriptions.app'),
    isHome: route.path === '/app',
    tiers: localeValue(locale, 'pricingPage.tiers'),
    faqItems: route.path === '/faq' ? localeValue(locale, 'faq.items') : null,
  })

  return JSON.stringify(graph, null, 2).replace(/</g, '\\u003c')
}

const upsertStructuredData = (html, payload) => {
  const json = payload.split('\n').map((line) => `    ${line}`).join('\n')
  const tag = `<script id="katsumii-structured-data" type="application/ld+json">\n${json}\n  </script>`
  const matcher = /<script\s+id="katsumii-structured-data"[^>]*>[\s\S]*?<\/script>/i
  if (matcher.test(html)) return html.replace(matcher, tag)
  return html.replace('</head>', `  ${tag}\n</head>`)
}

const routeHtml = (html, route, locale, options = {}) => {
  const canonical = options.canonical || routeUrl(route, locale)
  const rawTitle = localeText(locale, route.titleKey)
  const rawDescription = localeText(locale, route.descriptionKey)
  const title = escapeHtml(rawTitle)
  const description = escapeHtml(rawDescription)
  const robots = options.robots || route.robots || 'index, follow'
  const lang = HREFLANG_BY_LOCALE[locale]
  const alternates = alternateTags(route)
  const structuredData = structuredDataJson(route, locale, rawTitle, rawDescription, canonical)

  return [
    (value) => value.replace(/<html\s+lang="[^"]*">/i, `<html lang="${lang}">`),
    (value) => value.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`),
    (value) => upsertMetaTag(value, /<meta\s+name="description"[^>]*>/i, `<meta name="description" content="${description}" />`),
    (value) => upsertMetaTag(value, /<meta\s+name="robots"[^>]*>/i, `<meta name="robots" content="${robots}" />`),
    (value) => upsertMetaTag(value, /<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${canonical}" />`),
    (value) => upsertMetaTag(value, /<meta\s+property="og:title"[^>]*>/i, `<meta property="og:title" content="${title}" />`),
    (value) => upsertMetaTag(value, /<meta\s+property="og:description"[^>]*>/i, `<meta property="og:description" content="${description}" />`),
    (value) => upsertMetaTag(value, /<meta\s+property="og:url"[^>]*>/i, `<meta property="og:url" content="${canonical}" />`),
    (value) => upsertMetaTag(value, /<meta\s+property="og:image"[^>]*>/i, `<meta property="og:image" content="${SOCIAL_IMAGE}" />`),
    (value) => upsertMetaTag(value, /<meta\s+property="og:locale"[^>]*>/i, `<meta property="og:locale" content="${lang.replace('-', '_')}" />`),
    (value) => upsertMetaTag(value, /<meta\s+name="twitter:title"[^>]*>/i, `<meta name="twitter:title" content="${title}" />`),
    (value) => upsertMetaTag(value, /<meta\s+name="twitter:description"[^>]*>/i, `<meta name="twitter:description" content="${description}" />`),
    (value) => upsertMetaTag(value, /<meta\s+name="twitter:image"[^>]*>/i, `<meta name="twitter:image" content="${SOCIAL_IMAGE}" />`),
    (value) => stripAlternateTags(value).replace('</head>', `  ${alternates}\n</head>`),
    (value) => upsertStructuredData(value, structuredData),
  ].reduce((value, transform) => transform(value), html)
}

const routeFallbackPlugin = () => ({
  name: 'katsumii-route-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = new URL(req.url, 'http://localhost').pathname
      const acceptsHtml = req.headers.accept?.includes('text/html')
      if (acceptsHtml && (appRoutes.has(pathname) || (pathname !== '/' && !pathname.includes('.')))) {
        req.url = '/app.html'
      }
      next()
    })
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const pathname = new URL(req.url, 'http://localhost').pathname
      const acceptsHtml = req.headers.accept?.includes('text/html')
      if (acceptsHtml && pathname !== '/' && !pathname.includes('.') && !hasStaticPreviewPage(pathname)) {
        req.url = '/app.html'
      }
      next()
    })
  },
})

// GitHub Pages cannot send 301s, and its 404.html is a real 404 (status + noindex
// content). Retired URLs (/tw/…, /es/…, /v2–/v6 prototypes) therefore get a small
// static stub: meta refresh + canonical to the live page, which Google treats as
// a redirect. Anything not listed here correctly answers 404.
const redirectStubHtml = (target) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Redirecting…</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="${SITE_URL}${target}" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <script>window.location.replace(${JSON.stringify(target)} + window.location.search + window.location.hash)</script>
</head>
<body>
  <p><a href="${target}">Continue to Katsumii</a></p>
</body>
</html>
`

const writeLegacyRedirectStubs = async (outDir) => {
  const stubs = new Map()
  for (const [legacy, replacement] of Object.entries(LEGACY_LOCALE_PREFIXES)) {
    stubs.set(`/${legacy}/`, `/${replacement}/app/`)
    for (const route of staticRouteMeta) {
      stubs.set(`/${legacy}${route.path}/`, `/${replacement}${route.path}/`)
    }
  }
  for (const path of LEGACY_PROTOTYPE_PATHS) stubs.set(`${path}/`, `/${DEFAULT_LOCALE}/app/`)

  await Promise.all([...stubs].map(async ([stubPath, target]) => {
    const dir = resolve(outDir, stubPath.replace(/^\/+/, ''))
    await mkdir(dir, { recursive: true })
    await writeFile(resolve(dir, 'index.html'), redirectStubHtml(target))
  }))
}

const staticRoutePagesPlugin = () => {
  let outDir

  return {
    name: 'katsumii-static-route-pages',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    async closeBundle() {
      const appHtml = await readFile(resolve(outDir, 'app.html'), 'utf8')

      await Promise.all(staticRouteMeta.flatMap((route) => [
        ...SUPPORTED_LOCALES.map(async (locale) => {
          const routeDir = resolve(outDir, locale, route.path.replace(/^\/+/, ''))
          await mkdir(routeDir, { recursive: true })
          await writeFile(resolve(routeDir, 'index.html'), routeHtml(appHtml, route, locale))
        }),
        (async () => {
          const legacyDir = resolve(outDir, route.path.replace(/^\/+/, ''))
          await mkdir(legacyDir, { recursive: true })
          await writeFile(resolve(legacyDir, 'index.html'), routeHtml(appHtml, route, 'en', {
            canonical: routeUrl(route, 'en'),
            robots: 'noindex, follow',
          }))
        })(),
      ]))

      const appRoute = staticRouteMeta.find((route) => route.path === '/app')
      if (appRoute) {
        await Promise.all(SUPPORTED_LOCALES.map(async (locale) => {
          const localeRootDir = resolve(outDir, locale)
          await mkdir(localeRootDir, { recursive: true })
          await writeFile(resolve(localeRootDir, 'index.html'), routeHtml(appHtml, appRoute, locale, {
            canonical: routeUrl(appRoute, locale),
            robots: 'noindex, follow',
          }))
        }))
      }

      await writeLegacyRedirectStubs(outDir)
      await writeFile(resolve(outDir, 'sitemap.xml'), sitemapXml())
    },
  }
}

export default defineConfig({
  plugins: [routeFallbackPlugin(), vue(), staticRoutePagesPlugin()],
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
      },
    },
  },
})


