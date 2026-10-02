# Katsumii – SEO- & AI-Search-Plan (Stand 2026-09-30)

Legende: **[ICH]** = Claude setzt es im Repo um · **[DU]** = nur du kannst es (Accounts, Identität, Entscheidungen, Off-Site) · **[BEIDE]** = du entscheidest/lieferst, ich baue.

## 0. Grundprinzip für AI-Suche 2026

- Google AI Overviews / AI Mode ziehen aus dem **normalen Google-Index**. Es gibt kein eigenes „AI-Markup" und keine Extra-Anmeldung. Wer sauber indexiert ist, klar strukturierten Content und Vertrauenssignale hat, wird zitierfähig.
- ChatGPT Search, Copilot & Co. stützen sich stark auf den **Bing-Index** (Bing Webmaster Tools + IndexNow sind daher Pflicht, nicht optional).
- **Die meisten AI-Crawler (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot) führen kein JavaScript aus.** Katsumii ist eine Vue-SPA – das ist aktuell das größte Einzelproblem (siehe Phase 1).
- Zitiert wird, was **eine Frage direkt in 1–3 Sätzen beantwortet**, eindeutig einer Entität zuzuordnen ist (Katsumii = Offline-Trading-Journal) und von außen bestätigt wird (Erwähnungen, Reviews, Verzeichnisse).
- `llms.txt`: Google nutzt sie nachweislich nicht, Nutzen bei anderen Anbietern unbelegt. Billig (10 Min), aber niedrigste Priorität.
- Hinweis: Das ist mein Wissensstand; konkrete 2026er Algorithmus-Details (Updates, neue Reports in Search Console/Bing) bitte gegen die offiziellen Doku-Seiten prüfen, bevor wir Entscheidungen darauf stützen.

## 1. Ist-Stand (geprüft am 30.09.2026)

| Befund | Beleg | Prio |
|---|---|---|
| Prerender liefert nur `<head>`, Body ist `<div id="app"></div>` | `dist/en/pricing/index.html` | **P0** |
| Trailing-Slash-Konflikt: Live-URL `/en/pricing` → 301 → `/en/pricing/`, Canonical/Sitemap/Hreflang zeigen auf `/en/pricing` (ohne Slash) | `curl -I` + Canonical im Live-HTML | **P0** |
| Zwei Sitemap-Generatoren: `scripts/build-sitemap.mjs` (lastmod 2026-09-22) wird beim Build von `vite.config.js` (`closeBundle`) mit hartem `LASTMOD = 2026-07-05` überschrieben → Live-Sitemap trägt falsches lastmod | `dist/sitemap.xml` | **P0** |
| `404.html` leitet per JS über `app.html?path=…` – unnötig, da alle Routen als echte Ordner vorgerendert sind; Server liefert bereits echtes 404 | `curl` auf `/en/xyz/` → 404 | P1 |
| Kein FAQPage-/Offer-Schema; SoftwareApplication ohne `offers` | grep in `src/` | P1 |
| Deep-Dive-Seiten teils nicht vollständig lokalisiert (Audit Juli) | `SEO_audit.html` | P1 |
| Kein `llms.txt`, keine AI-Bot-Policy in `robots.txt` | `robots.txt` | P2 |
| Kein `tools/seo-audit.mjs` (im Juli-Audit empfohlen, `tools/` leer) | Repo | P1 |
| Titles/Descriptions vorhanden, aber generisch („Pricing - Katsumii"), teils zu lang | `en.json` `pageTitles` | P1 |
| Umami nur mit Consent → Zahlen unterschätzen Traffic | `useConsent.js` | Info |
| Keine `/download`-Route für ein Software-Produkt | `router.js` | P1 |

Bereits gut: lokalisierte Meta-Tags pro Route, Hreflang inkl. x-default, saubere noindex-Logik (welcome/bugreport/404), BreadcrumbList, Organization/WebSite/WebPage-JSON-LD, Alt-Texte, HTTPS, Apex→www-Redirect.

---

## PHASE 1 – Diese Woche: Crawlbarkeit (Blocker)

Ohne das bringt alles Weitere wenig.

1. **[ICH] Echtes statisches HTML für alle indexierbaren Routen × Locales.** Sichtbarer H1, Fließtext, interne Links, JSON-LD im ausgelieferten HTML. Umsetzung: Prerender-Schritt nach dem Vite-Build (Headless-Snapshot der gerenderten Seiten, CI-tauglich), da GSAP/three.js/Canvas-Hintergründe SSR-unfreundlich sind. Akzeptanzkriterium: `curl` zeigt H1 und Hauptcontent ohne JS.
2. **[BEIDE] URL-Policy festlegen.** Empfehlung: **mit Trailing Slash** (entspricht dem, was GitHub Pages ohnehin ausliefert). [DU] bestätigst, [ICH] vereinheitliche Canonical, Hreflang, Sitemap, JSON-LD, `og:url`, interne Links und Router-Redirects an einer Stelle.
3. **[ICH] Sitemap auf eine Quelle reduzieren.** Beide Generatoren zusammenlegen, `lastmod` aus dem Git-Datum der jeweiligen Seite/Locale-Datei, `priority`/`changefreq` entfernen (werden von Google ignoriert).
4. **[ICH] Statische 404** ohne JS-Redirect, `noindex`, ohne Canonical, mit Links zu App/Features/Pricing/Manual.
5. **[ICH] `tools/seo-audit.mjs`** als Build-Check: H1 vorhanden, Body nicht leer, Canonical = URL-Policy, Hreflang gegenseitig, keine noindex-URL in Sitemap, JSON-LD parsebar, Title/Description-Länge. Läuft in `deploy.yml` vor dem Deploy und bricht bei Fehlern ab.
6. **[DU] Google Search Console** einrichten (Domain-Property `katsumii.com` per DNS-TXT; alternativ URL-Prefix mit HTML-Tag, den ich einbaue). Sitemap `https://www.katsumii.com/sitemap.xml` einreichen.
7. **[DU] Bing Webmaster Tools** einrichten (Import aus GSC in 2 Klicks), Sitemap einreichen. Wichtig für ChatGPT-/Copilot-Sichtbarkeit.
8. **[ICH, danach DU] IndexNow:** Key-Datei in `public/`, CI-Schritt pingt geänderte URLs nach jedem Deploy. [DU] nur: Key in Bing Webmaster bestätigen, falls verlangt.

**Nach Phase 1 [DU]:** in GSC „URL-Prüfung → Live testen" für `/en/app/`, `/de/app/`, `/en/pricing/` – gerenderten HTML-Body prüfen, Indexierung anfordern.

## PHASE 2 – Woche 2–3: Snippets, Schema, AI-Lesbarkeit

9. **[ICH] Titles & Descriptions je Route auf Suchintention**, ca. 55/150 Zeichen. Beispiele: „Offline Trading Journal for Prop Firm Traders – Katsumii"; DE: „Trading-Tagebuch offline für Prop-Firm-Trader | Katsumii". Begriffe: *trading journal*, *offline trading journal*, *prop firm journal*, *funded account tracker*, *trading journal no subscription*, DE: *Trading Tagebuch*, *Tradingjournal Software*. **[DU]** gibst Keyword-Prioritäten frei.
10. **[ICH] Schema erweitern:** `SoftwareApplication` mit `offers` (Demo $0, bezahlte Tiers, Lifetime-Lizenz), `downloadUrl`, `softwareVersion` (aus `changelog.json`), `featureList`; `FAQPage` auf `/faq` (Google-Rich-Result dafür ist seit 2023 für die meisten Seiten weg, hilft aber der AI-Extraktion); `Organization.sameAs` sobald Profile existieren. **Keine** erfundenen Reviews/AggregateRating.
11. **[ICH] „Answer-first"-Umbau der Kernseiten:** unter dem H1 eine 40–60-Wörter-Definition/Antwort („Katsumii ist ein Offline-Trading-Journal für …"), danach Details. Überschriften als Fragen, wo Nutzer so suchen. Tabellen für Vergleiche/Tiers (AI-Systeme zitieren strukturierte Daten gern).
12. **[ICH] `robots.txt` erweitern:** explizite Allow-Regeln für Suchbots (OAI-SearchBot, PerplexityBot, Claude-SearchBot, Googlebot, Bingbot). **[DU] Entscheidung:** Trainings-Crawler (GPTBot, Google-Extended, CCBot) erlauben? Empfehlung für eine Marketing-Seite: erlauben. `Google-Extended` beeinflusst Google-Suche/AI Overviews nicht.
13. **[ICH] `llms.txt`** (kurze Produktbeschreibung + Links zu Kernseiten) – nur als günstiger Zusatz.
14. **[ICH] OG-Bilder pro Kernseite** statt einer globalen `og-image.png`; Alt-Text-Review.
15. **[ICH] Internal Linking:** Kontextlinks zwischen Mode-Seiten (Funded/Challenge/Personal/Backtesting), Features, Pricing, Manual; sichtbare Breadcrumbs (nicht nur JSON-LD); Footer-Links zu allen indexierbaren Seiten.

## PHASE 3 – Woche 3–6: Performance & Lokalisierung

16. **[ICH] Core Web Vitals:** PNG-Screenshots → AVIF/WebP mit `srcset` (`scripts/optimize-screenshots.mjs` ausbauen), LCP-Bild priorisieren, three.js/WebGL erst nach Idle/Interaktion laden, Bundle-Splitting prüfen. Messung per Lighthouse (lokal) und CrUX (nach Deploy).
17. **[ICH] Locale-Qualität:** Deep-Dive-Seiten in `de`/`zht` vollständig lokalisieren. Solange eine Seite nur englisch ist, aus Hreflang/Sitemap der Sprache nehmen. **[DU]** muttersprachlicher Blick auf `zht` (Ton/Vokabular) und `de`-Keywords; Entscheidung, welcher Markt primär wachsen soll.
18. **[BEIDE] Eigene `/download`-Seite:** „Download trading journal for Windows/macOS", Systemanforderungen, Version aus `latest.json`. [DU] bestätigst Plattformen/Distribution, [ICH] baue Seite + Schema.

## PHASE 4 – Monat 2–4: Content, der zitiert wird (der eigentliche AI-Hebel)

Technisch saubere Seiten werden nur zitiert, wenn es *Antworten* gibt. Neue Sektion `/guides/` (lokalisiert, vorgerendert, Schema `Article`):

19. **[ICH schreibt Entwürfe, DU prüfst fachlich]** Themen mit klarer Suchintention und Produktbezug:
    - Trading-Journal für Prop-Firm-Challenges führen (Drawdown-Regeln, Profit-Target-Tracking)
    - Funded-Account-Regeln tracken (Daily Loss, Max Drawdown, Consistency Rule)
    - Kennzahlen erklärt: Win Rate, R-Multiple, Expectancy, Profit Factor (Definition + Formel + Beispiel = Zitier-Magnet)
    - Offline vs. Cloud-Journal: Datenschutz und Kosten (Lifetime vs. Abo)
    - Trading-Journal-Vorlage: Excel vs. Software
    - Vergleichsseiten „Katsumii vs. TraderSync / Tradezella / Edgewonk / Tradervue" – faktenbasiert, fair, datiert. [DU] lieferst verlässliche Fakten und gibst frei (Wettbewerber-Aussagen sind rechtlich sensibel).
20. **[DU, nicht delegierbar] E-E-A-T:** Trading/Finanz ist YMYL-nah; Google und LLMs gewichten echte Personen. Nötig: `/about`-Seite mit echtem Gründernamen, Hintergrund, Trading-Erfahrung, Kontakt; Autor je Guide. Ich baue Seite + `Person`-Schema, du lieferst die Inhalte und entscheidest, wie viel Identität du preisgibst.
21. **[DU] Original-Content**, den KI nicht selbst generieren kann: eigene Auswertungen, Screenshots mit echten (anonymisierten) Daten, Changelog-Storys, Roadmap. AI-Systeme zitieren Primärquellen.
22. **[ICH]** Jede Guide-Seite bekommt einen „keine Anlageberatung"-Hinweis (Vertrauenssignal + rechtlich).

## PHASE 5 – Laufend: Off-Site & Reputation (nur du)

AI-Antworten basieren stark darauf, was *andere über dich schreiben*.

23. **[DU] Profile anlegen** und mit `sameAs` verknüpfen (ich trage die URLs ein): X, LinkedIn, YouTube, GitHub, Reddit, Discord. Einheitlicher Name „Katsumii", identische Kurzbeschreibung überall.
24. **[DU] Verzeichnisse:** Product Hunt (Launch sorgfältig timen), AlternativeTo, SaaSHub, G2, Capterra, GetApp, Trustpilot. Jeweils Backlink + Entitätsbestätigung.
25. **[DU] Communities** (r/Daytrading, r/Forex, Prop-Firm-Discords/-Foren): hilfreich beitragen, nicht spammen.
26. **[DU] Echte Reviews/Testimonials sammeln** (Beta-User anschreiben). Sobald echte öffentliche Bewertungen existieren, baue ich `AggregateRating` ein – vorher nicht (Manual-Action-Risiko).
27. **[DU] YouTube-Demo/Tutorials** mit Transkript; ich binde sie mit `VideoObject` ein. Videos werden von AI-Systemen häufig zitiert.
28. **[DU] Gastbeiträge/Erwähnungen** bei Trading-Blogs, Prop-Firm-Reviewern, Newslettern. Wenige gute Links > viele schlechte.
29. **[DU] Optional: Cloudflare vor GitHub Pages** – HTTP-Header (Security/Caching), echte Redirects, AI-Crawler-Analytics. Entscheidung + DNS-Änderung liegen bei dir; ich stelle danach Regeln bereit.

## PHASE 6 – Messung & Zyklus (monatlich)

30. **[DU] GSC:** Indexierungsbericht („gefunden – nicht indexiert"?), Leistung (Queries, Klicks je Locale), Core Web Vitals. Bing Webmaster: Indexierung und – falls in deinem Account vorhanden – Copilot-/AI-Zitationsbericht.
31. **[DU] AI-Sichtbarkeit manuell prüfen** (1×/Monat, ca. 10 Prompts in ChatGPT, Perplexity, Gemini/AI Mode, Copilot): „best offline trading journal", „trading journal for prop firm challenges", „Trading Tagebuch Software offline", „TraderSync alternative offline". Notieren: Wird Katsumii genannt? Welche Quellen stattdessen? Ergebnisse an mich → ich leite Content-Lücken ab.
32. **[ICH]** Referrer-Auswertung in Umami (chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com) – nur mit Consent, daher Trend statt Absolutwerte.
33. **[ICH]** Bei jedem Release (`/ship`): SEO-Audit läuft in CI, `lastmod` aktualisiert sich automatisch, IndexNow pingt.

---

## Reihenfolge (Kurzfassung)

| Zeitraum | [ICH] | [DU] |
|---|---|---|
| Woche 1 | Prerender-Body, URL-Policy, Sitemap-Fix, 404, seo-audit, IndexNow | GSC + Bing Webmaster verifizieren, Sitemap einreichen, Slash-Entscheidung |
| Woche 2–3 | Titles/Descriptions, Schema (Offers/FAQ), Answer-first, robots/llms.txt, Linking | Keyword-Freigabe, Entscheidung Trainings-Crawler |
| Woche 3–6 | CWV/Bilder, Locale-Lücken, `/download` | Sprach-Review `zht`/`de`, Plattform-Fakten |
| Monat 2–4 | `/guides/`-Entwürfe, `/about`, Vergleichsseiten, Video-Schema | Fachprüfung, Gründer-Infos, Wettbewerber-Fakten, Original-Daten |
| Laufend | CI-Checks, Schema-Pflege, sameAs/Reviews eintragen | Profile, Verzeichnisse, Communities, Reviews, YouTube, monatlicher AI-Check |

## Realistische Erwartungen

- Crawl-/Indexierungs-Fixes wirken in Tagen bis ca. 3 Wochen; Rankings für Nischen-Keywords in 2–4 Monaten; AI-Zitationen folgen meist Off-Site-Erwähnungen (Phase 5) und sind nicht garantierbar.
- „Trading journal" ist stark umkämpft. Katsumiis Chance liegt in der Nische: offline/local-first, Lifetime-Lizenz statt Abo, Prop-Firm-Fokus, DE/zh-TW-Märkte.
