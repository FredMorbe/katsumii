/* The Katsumii product line — single source for the studio landing, the nav,
   the footer and the product pages. Copy lives in locales under products.<key>;
   this file only carries what is not text: route, accent, platform, price, screenshot.
   Optional `status`: the product is announced but not released ("dev") — it replaces the live/soon badge.
   Optional `download`: a direct file URL — when set, the app card shows a download button. */

export const PRODUCTS = [
  {
    key: "journal",
    path: "/journal",
    /* where the product page lives today — the others have none yet */
    page: "/app",
    platform: "desktop",
    price: "paid",
    accent: { dark: ["#22d3ee", "#67e8f9"], light: ["#0369a1", "#075985"] },
    /* file in /Screenshots/opt/ — light falls back to dark when the app has no light theme; none = placeholder */
    shot: { dark: "hero_d.webp", light: "hero_l.webp" },
    /* constellation position, % of the chart */
    star: { x: 63.7, y: 25 },
    /* galaxy position — radius 0..1 from the core, start angle in rad */
    galaxy: { r: 0.34, th: 3.95 },
  },
  {
    key: "andromeda",
    path: "/andromeda",
    platform: "desktop",
    price: "paid",
    accent: { dark: ["#818cf8", "#c4b5fd"], light: ["#6d28d9", "#5b21b6"] },
    shot: { dark: "andromeda_d.webp" },
    star: { x: 24.2, y: 34 },
    galaxy: { r: 0.82, th: 2.45 },
  },
  {
    key: "tidii",
    path: "/tidii-cleaner",
    platform: "desktop",
    price: "free",
    accent: { dark: ["#4ade80", "#a7f3c0"], light: ["#047857", "#065f46"] },
    shot: { dark: "tidii_d.webp" },
    star: { x: 41.9, y: 75 },
    galaxy: { r: 0.52, th: -0.55 },
  },
  {
    key: "cubamii",
    path: "/cubamii",
    page: "/cubamii",
    platform: "mobile",
    price: "free",
    accent: { dark: ["#facc15", "#fde68a"], light: ["#ab7503", "#8a5e02"] },
    shot: { dark: "cubamii_d.webp" },
    star: { x: 79, y: 70 },
    galaxy: { r: 0.74, th: 4.75 },
  },
  {
    key: "mediacenter",
    path: "/mediacenter",
    page: "/mediacenter",
    status: "dev",
    platform: "desktop",
    price: "tbd",
    accent: { dark: ["#5aa2ff", "#9cc6ff"], light: ["#1d4ed8", "#1e40af"] },
    star: { x: 55, y: 52 },
    galaxy: { r: 0.62, th: 3.2 },
  },
]

export const productByKey = (key) => PRODUCTS.find((p) => p.key === key)

/* the studio's chart: which stars are joined, plus the dim "next release" stars */
export const CONSTELLATION_LINES = [
  ["andromeda", "journal"],
  ["journal", "cubamii"],
  ["cubamii", "tidii"],
  ["tidii", "andromeda"],
]

export const GHOST_STARS = [
  { x: 91, y: 34, from: "journal" },
  { x: 51.6, y: 50, from: "journal" },
  { x: 13.7, y: 71, from: "tidii" },
]
