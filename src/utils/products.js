/* The Katsumii product line — single source for the studio landing, the nav,
   the footer and the product pages. Copy lives in locales under products.<key>;
   this file only carries what is not text: route, accent, platform, price. */

export const PRODUCTS = [
  {
    key: "journal",
    path: "/journal",
    platform: "desktop",
    price: "paid",
    accent: { dark: ["#22d3ee", "#67e8f9"], light: ["#0369a1", "#075985"] },
    /* constellation position, % of the chart — desktop / mobile */
    star: { x: 63.7, y: 25, mx: 14, my: 10 },
    /* galaxy position — radius 0..1 from the core, start angle in rad */
    galaxy: { r: 0.52, th: -0.55 },
  },
  {
    key: "andromeda",
    path: "/andromeda",
    platform: "desktop",
    price: "paid",
    accent: { dark: ["#818cf8", "#c4b5fd"], light: ["#6d28d9", "#5b21b6"] },
    star: { x: 24.2, y: 34, mx: 54, my: 30 },
    galaxy: { r: 0.82, th: 2.45 },
  },
  {
    key: "tidii",
    path: "/tidii-cleaner",
    platform: "desktop",
    price: "free",
    accent: { dark: ["#4ade80", "#a7f3c0"], light: ["#047857", "#065f46"] },
    star: { x: 41.9, y: 75, mx: 54, my: 62 },
    galaxy: { r: 0.34, th: 3.95 },
  },
  {
    key: "cubamii",
    path: "/cubamii",
    platform: "mobile",
    price: "free",
    accent: { dark: ["#facc15", "#fde68a"], light: ["#ab7503", "#8a5e02"] },
    star: { x: 79, y: 70, mx: 14, my: 84 },
    galaxy: { r: 0.68, th: 5.25 },
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
  { x: 91, y: 34, mx: 86, my: 14, from: "journal" },
  { x: 51.6, y: 50, mx: 30, my: 47, from: "journal" },
  { x: 13.7, y: 71, mx: 88, my: 76, from: "tidii" },
]
