/* ───────────────────────────────────────────────────────────────
   CV DATA — shared by all six concepts. Everything here is PLACEHOLDER.
   Replace this file (or paste the real data into it), run build.py,
   and all six mockups pick it up.
   ─────────────────────────────────────────────────────────────── */
const CV = {
  now: "2026-10",
  name: "Sam Keller",
  first: "Sam",
  initials: "SK",
  title: "Software engineer & product builder",
  tagline: "I build calm software for complicated work.",
  location: "Berlin · remote-friendly",
  summary: "Fourteen years of turning messy problems into dependable products — from checkout flows serving millions to desktop tools traders open every morning. Equally at home in a code review, a product workshop or a design critique.",
  email: "hello@example.com",
  site: "katsumii.com",
  linkedin: "linkedin.com/in/example",
  github: "github.com/example",
  availability: "Open to select projects from January",
  languages: [
    { name: "German", level: "Native", pct: 100 },
    { name: "English", level: "Fluent · C2", pct: 95 },
    { name: "Mandarin", level: "Conversational · B1", pct: 45 }
  ],
  stats: [
    { v: 14, suffix: "+", label: "years shipping software" },
    { v: 5, suffix: "", label: "teams led or founded" },
    { v: 4, suffix: "", label: "own products live" },
    { v: 2.4, suffix: "M", label: "people reached" }
  ],

  /* lvl = [scope of responsibility at start, at end] on a 0–10 scale */
  roles: [
    { id: "kappa", org: "Kappa Systems", role: "Working student, developer", from: "2012-10", to: "2014-08", place: "Hamburg", kind: "Employee", lvl: [1, 2.6],
      summary: "Internal tooling for a logistics scheduler — first production code, first on-call weekend.",
      bullets: ["Built the dispatcher UI used by 40 planners every day.", "Replaced a fragile spreadsheet import with a validated pipeline.", "Wrote the team's first automated test suite."],
      skills: ["JavaScript", "Python", "PostgreSQL"], metric: { v: "40", l: "daily users of the dispatcher UI" } },
    { id: "brightside", org: "Brightside Mobile", role: "Software engineer", from: "2014-09", to: "2017-03", place: "Berlin", kind: "Employee", lvl: [2.4, 4.6],
      summary: "Consumer apps at scale — small team, fast releases, real users from day one.",
      bullets: ["Shipped three consumer apps with 2.4 M downloads in total.", "Moved releases from monthly to weekly with an automated pipeline.", "Led the redesign of onboarding; day-7 retention +18 %."],
      skills: ["JavaScript", "Mobile apps", "CI/CD", "UX design"], metric: { v: "2.4M", l: "downloads across three apps" } },
    { id: "lumen", org: "Lumen Analytics", role: "Senior full-stack engineer", from: "2017-04", to: "2020-05", place: "Berlin", kind: "Employee", lvl: [4.3, 6.9],
      summary: "Self-serve analytics for non-technical teams — data-heavy UI on top of a growing service landscape.",
      bullets: ["Built the dashboards used by 12 000 analysts across 300 companies.", "Migrated a monolith to services without a single day of downtime.", "Mentored six engineers; three were promoted within two years."],
      skills: ["Vue", "Python", "PostgreSQL", "Node.js", "Mentoring", "UX design"], metric: { v: "12k", l: "analysts on the dashboards" } },
    { id: "helix", org: "Helix Payments", role: "Staff engineer, checkout", from: "2020-06", to: "2023-02", place: "Berlin · remote", kind: "Employee", lvl: [6.5, 8.7],
      summary: "Owned the technical direction of a checkout used by 40+ merchants. Led nine engineers across three squads.",
      bullets: ["Rebuilt the checkout: conversion +11 %, p95 load 3.1 s → 1.2 s.", "Introduced a design system and RFC process now used org-wide.", "Hired and onboarded seven engineers; ran the staff-level interview loop."],
      skills: ["Vue", "TypeScript", "Node.js", "PostgreSQL", "Design systems", "Technical leadership", "Mentoring", "CI/CD"], metric: { v: "+11%", l: "checkout conversion" } },
    { id: "katsumii", org: "Katsumii", role: "Founder & lead engineer", from: "2023-03", to: null, place: "Berlin", kind: "Own studio", lvl: [8.3, 9.7],
      summary: "An independent software studio. Four products, one person, no meetings that could have been a commit.",
      bullets: ["Designed, built and shipped four products end to end — desktop, mobile and web.", "Katsumii Journal: a local-first trading journal on Vue + FastAPI + SQLite.", "Own the full chain: product, UX, engineering, release and support."],
      skills: ["Vue", "TypeScript", "Python", "FastAPI", "SQLite", "Three.js", "CSS & motion", "Design systems", "Product strategy", "Mobile apps", "CI/CD", "UX design"], metric: { v: "4", l: "products shipped" } }
  ],

  milestones: [
    { at: "2014-08", text: "M.Sc. Computer Science" },
    { at: "2016-05", text: "First app passes 1 M downloads" },
    { at: "2018-09", text: "Promoted to senior" },
    { at: "2019-11", text: "Zero-downtime migration to services" },
    { at: "2021-03", text: "Checkout relaunch: +11 % conversion" },
    { at: "2022-06", text: "Promoted to staff engineer" },
    { at: "2023-03", text: "Founded Katsumii" },
    { at: "2024-05", text: "Katsumii Journal 1.0" },
    { at: "2025-09", text: "Tidii Cleaner released" }
  ],

  projects: [
    { id: "journal", n: "01", name: "Katsumii Journal", year: "2024", kind: "Desktop · paid", accent: "#22d3ee",
      desc: "A trading journal for funded, challenge and personal accounts. Local-first: your data never leaves your machine.", stack: ["Vue", "FastAPI", "SQLite"] },
    { id: "andromeda", n: "02", name: "Andromeda", year: "2025", kind: "Desktop · paid", accent: "#818cf8",
      desc: "A focused desktop app. One-line pitch goes here: what it does, in plain words.", stack: ["Vue", "Python"] },
    { id: "tidii", n: "03", name: "Tidii Cleaner", year: "2025", kind: "Desktop · free", accent: "#4ade80",
      desc: "Keeps a PC tidy — says exactly what it clears and what it never touches.", stack: ["Python", "CI/CD"] },
    { id: "cubamii", n: "04", name: "Cubamii", year: "2026", kind: "Mobile · free", accent: "#facc15",
      desc: "The Katsumii mobile app. One-line pitch goes here: the one thing it does best.", stack: ["Mobile apps", "Vue"] }
  ],

  education: [
    { id: "msc", org: "State University", role: "M.Sc. Computer Science", from: "2012", to: "2014", note: "Thesis: visual debugging of distributed systems" },
    { id: "bsc", org: "State University", role: "B.Sc. Computer Science", from: "2009", to: "2012", note: "Minor in interaction design" }
  ],

  quotes: [
    { text: "Sam is the rare engineer who makes the whole team calmer — and the product faster.", who: "Head of Product, Helix Payments" },
    { text: "Ask for a prototype on Monday and you'll get a working product with documentation on Friday.", who: "CTO, Lumen Analytics" }
  ],

  /* name → category + proficiency (1–5). years / roles are derived from `roles`. */
  skillMeta: {
    "Vue": ["Frontend", 5], "TypeScript": ["Frontend", 5], "JavaScript": ["Frontend", 5], "CSS & motion": ["Frontend", 4], "Three.js": ["Frontend", 3], "Design systems": ["Frontend", 5],
    "Python": ["Backend & data", 4], "FastAPI": ["Backend & data", 4], "Node.js": ["Backend & data", 4], "PostgreSQL": ["Backend & data", 4], "SQLite": ["Backend & data", 4],
    "Product strategy": ["Product & craft", 4], "UX design": ["Product & craft", 3], "Technical leadership": ["Product & craft", 5], "Mentoring": ["Product & craft", 5],
    "CI/CD": ["Delivery", 4], "Mobile apps": ["Delivery", 3]
  },
  categories: ["Frontend", "Backend & data", "Product & craft", "Delivery"],
  catColor: { "Frontend": "#22d3ee", "Backend & data": "#818cf8", "Product & craft": "#facc15", "Delivery": "#4ade80" }
};

/* ── helpers ── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const cvIdx = (ym) => { const [y, m] = ym.split("-").map(Number); return y * 12 + (m - 1); };
const cvEnd = (r) => r.to || CV.now;
const cvFmt = (ym) => { const [y, m] = ym.split("-"); return MONTHS[+m - 1] + " " + y; };
const cvRange = (r) => cvFmt(r.from) + " — " + (r.to ? cvFmt(r.to) : "Present");
const cvMonths = (r) => cvIdx(cvEnd(r)) - cvIdx(r.from) + 1;
const cvDur = (r) => { const m = cvMonths(r), y = Math.floor(m / 12), mo = m % 12; return (y ? y + " yr" + (y > 1 ? "s" : "") : "") + (y && mo ? " " : "") + (mo ? mo + " mo" : ""); };
const cvYear = (ym) => +ym.split("-")[0] + (+ym.split("-")[1] - 1) / 12;
const cvRole = (id) => CV.roles.find((r) => r.id === id);
const cvSkills = () => Object.entries(CV.skillMeta).map(([name, [cat, level]]) => {
  const roles = CV.roles.filter((r) => r.skills.includes(name));
  const months = roles.reduce((a, r) => a + cvMonths(r), 0);
  return { name, cat, level, roles: roles.map((r) => r.id), years: Math.max(1, Math.round(months / 12)) };
}).sort((a, b) => b.level - a.level || b.years - a.years);
const cvEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
if (window.top !== window) document.documentElement.classList.add("in-frame");
