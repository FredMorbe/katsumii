/* JSON-LD graph shared by the build (vite.config.js → static <head> for crawlers
   without JavaScript) and the runtime (AppShell.vue → kept in sync on SPA
   navigation). Pure data in, plain object out — no Vue, no import.meta. */

export const SOCIAL_PROFILES = ["https://instagram.com/katsumii.journal"]

/* "$49" → { price: "49", priceCurrency: "USD" }. Fails loudly on anything else so a
   changed price format cannot silently ship wrong structured data. */
const parsePrice = (label, tier) => {
  const match = /^\$(\d+(?:\.\d{1,2})?)$/.exec(String(label).trim())
  if (!match) throw new Error(`structuredData: cannot read price "${label}" of tier "${tier}" — expected "$<number>"`)
  return { price: match[1], priceCurrency: "USD" }
}

const offersFromTiers = (tiers) => {
  const entries = Object.entries(tiers || {})
  if (!entries.length) throw new Error("structuredData: pricingPage.tiers is empty")
  return entries.map(([key, tier]) => ({
    "@type": "Offer",
    name: tier.name,
    description: tier.description,
    ...parsePrice(tier.price, key),
    availability: "https://schema.org/InStock",
  }))
}

export const buildStructuredGraph = ({
  siteUrl,
  socialImage,
  softwareUrl,
  canonicalUrl,
  lang,
  title,
  description,
  appDescription,
  isHome,
  tiers,
  faqItems,
}) => {
  const graph = [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Katsumii",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      email: "info@katsumii.com",
      sameAs: SOCIAL_PROFILES,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Katsumii",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: lang,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${softwareUrl}#software`,
      name: "Katsumii",
      url: softwareUrl,
      description: appDescription,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Windows 10, Windows 11, macOS 12 or newer",
      image: socialImage,
      offers: offersFromTiers(tiers),
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: title,
      description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${softwareUrl}#software` },
      inLanguage: lang,
    },
  ]

  if (!isHome) {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Katsumii", item: softwareUrl },
        { "@type": "ListItem", position: 2, name: title.replace(/\s-\sKatsumii$/, ""), item: canonicalUrl },
      ],
    })
  }

  if (faqItems) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${canonicalUrl}#faq`,
      url: canonicalUrl,
      inLanguage: lang,
      isPartOf: { "@id": `${siteUrl}/#website` },
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    })
  }

  return { "@context": "https://schema.org", "@graph": graph }
}
