/* ───────────────────────────────────────────────────────────────
   CV DATA — Modern page. Everything here is PLACEHOLDER: replace with
   the real résumé, then run build.py.
   Profile: mechanical engineer, 11 years of experience, passionate about
   AI-assisted software development (side projects = the Katsumii apps).
   ─────────────────────────────────────────────────────────────── */
const CV = {
  now: "2026-10",
  name: "Sam Keller",
  first: "Sam",
  initials: "SK",
  title: "Mechanical engineer · AI-assisted software builder",
  location: "Stuttgart · Germany",
  city: "Stuttgart",
  summary: "Eleven years of mechanical engineering — from first concept and simulation to series production. After hours I build software with AI: four apps shipped, many experiments, and the firm belief that engineers who can specify, verify and prompt will shape what comes next.",
  email: "hello@example.com",
  site: "katsumii.com",
  linkedin: "linkedin.com/in/example",
  github: "github.com/example",
  availability: "Open to new challenges from January",
  languages: [
    { name: "German", level: "Native", pct: 100 },
    { name: "English", level: "Fluent · C1", pct: 90 }
  ],
  stats: [
    { v: 11, suffix: "", label: "years in mechanical engineering" },
    { v: 40, suffix: "+", label: "product variants designed" },
    { v: 12, suffix: "", label: "engineers led at peak" },
    { v: 4, suffix: "", label: "AI-assisted apps shipped" }
  ],

  /* career — side:true marks the hobby/passion track */
  roles: [
    { id: "nordwerk", org: "Nordwerk Maschinenbau", role: "Design engineer, gearboxes", from: "2015-10", to: "2018-03", place: "Hannover", kind: "Employee", hue: 150,
      hook: "Forty gearbox variants from one modular platform — and 18 % fewer parts.",
      summary: "First job after the degree: industrial gearboxes from customer requirement to released drawing. Where the craft was learned.",
      bullets: ["Designed 40+ gearbox variants on a modular platform (SolidWorks).", "Cut part count by 18 % through standardised interfaces.", "Ran the first FEM checks (Ansys) on housings and shafts."],
      skills: ["CAD (SolidWorks)", "FEM (Ansys)", "GD&T", "Design for manufacturing"], metric: { v: "−18%", l: "part count per gearbox" } },
    { id: "aeron", org: "Aeron Systems", role: "Development engineer, simulation & testing", from: "2018-04", to: "2021-02", place: "Munich", kind: "Employee", hue: 215,
      hook: "Five prototype iterations became two — simulation first, test to confirm.",
      summary: "Moved to development and validation: simulation models, test rigs and the data that ties them together.",
      bullets: ["Built a fatigue test rig and validated the FEM models against it.", "Reduced prototype iterations from five to two.", "Wrote the first Python scripts to evaluate test data automatically."],
      skills: ["FEM (Ansys)", "Fatigue & materials", "Test engineering", "Python", "MATLAB", "Data analysis"], metric: { v: "5 → 2", l: "prototype iterations" } },
    { id: "helixdrives", org: "Helix Drives", role: "Senior engineer, product development", from: "2021-03", to: "2024-02", place: "Stuttgart", kind: "Employee", hue: 265,
      hook: "A compact drive unit, 22 % lighter — and on the market four months earlier.",
      summary: "Technical lead for a new compact drive unit: concept, design, supplier selection and industrialisation, with a team of six.",
      bullets: ["Led a six-person team from concept to series release.", "Reduced weight by 22 % with topology optimisation and a lighter housing.", "Cut time-to-market by four months through early supplier involvement and DFM reviews."],
      skills: ["CAD (SolidWorks)", "FEM (Ansys)", "Design for manufacturing", "Supplier management", "Project management", "Mentoring", "Automation scripting"], metric: { v: "−22%", l: "weight of the drive unit" } },
    { id: "meridian", org: "Meridian Industrial", role: "Lead engineer & technical project manager", from: "2024-03", to: null, place: "Stuttgart", kind: "Employee", hue: 190,
      hook: "A new drive platform, twelve people, one plan — and AI in the daily workflow.",
      summary: "Technical and budget responsibility for a new drive platform. Introduced AI-assisted workflows for documentation, test evaluation and design-of-experiments.",
      bullets: ["Lead a cross-functional team of twelve; budget of €3.2 M, on plan.", "Introduced AI-assisted reporting and test evaluation — hours saved every week.", "Own the roadmap between design, testing, purchasing and production."],
      skills: ["Project management", "Supplier management", "Cost engineering", "Mentoring", "Data analysis", "LLM prompting", "Automation scripting"], metric: { v: "12", l: "people, €3.2 M budget" } },
    { id: "lab", side: true, org: "Katsumii", role: "Independent software builder — AI-assisted", from: "2023-03", to: null, place: "After hours", kind: "Passion project", hue: 155,
      hook: "Four apps shipped, built with AI pair-programming — specified like an engineer.",
      summary: "A small studio on the side: desktop and mobile apps, planned in specs, built with AI assistance, verified by hand.",
      bullets: ["Four products live: Journal, Andromeda, Tidii Cleaner, Cubamii.", "Spec-first workflow: requirements, tests and review stay human.", "Local-first architecture: Vue + FastAPI + SQLite."],
      skills: ["AI-assisted coding", "LLM prompting", "Python", "Vue", "FastAPI", "Local-first apps", "Automation scripting"], metric: { v: "4", l: "apps shipped" } }
  ],

  milestones: [
    { at: "2015-09", text: "M.Sc. Mechanical Engineering" },
    { at: "2018-04", text: "Moved into development & testing" },
    { at: "2021-03", text: "Senior engineer, technical lead" },
    { at: "2023-03", text: "First AI pair-programming experiments" },
    { at: "2024-03", text: "Lead engineer & project manager" },
    { at: "2024-05", text: "Katsumii Journal 1.0" }
  ],

  /* the passion track */
  lab: {
    headline: "By day: machines. By night: models.",
    sub: "AI-assisted software development is my second craft. I treat it like engineering: write the spec, build in small loops, verify everything.",
    principles: [
      { t: "Specify like an engineer", d: "Clear requirements are the best prompt. If I can't write the spec, I don't ask the model." },
      { t: "Verify everything", d: "AI proposes, I decide. Tests, review and measurement stay human." },
      { t: "Small loops", d: "Short iterations, visible results, easy to roll back — the same as a good test campaign." },
      { t: "Automate the boring", d: "Reports, test evaluation, documentation: let the machine do the typing." }
    ],
    timeline: [
      { y: "2023", t: "First LLM pair-programming experiments" },
      { y: "2024", t: "Katsumii Journal 1.0 — built end to end with AI" },
      { y: "2025", t: "Tidii Cleaner released; AI writes tests & docs" },
      { y: "2026", t: "Cubamii on mobile; agents in the daily workflow" }
    ],
    tools: ["Claude Code", "LLM APIs", "Local models", "Eval & test harnesses", "Prompt libraries"],
    terminal: [
      { t: "cmd", s: "claude" },
      { t: "you", s: "Add offline sync to the Journal. Keep it local-first." },
      { t: "dim", s: "● Reading spec.md and the existing data layer…" },
      { t: "dim", s: "● Plan: 3 steps · 6 files · no new dependencies" },
      { t: "ok", s: "✓ Sync queue implemented" },
      { t: "ok", s: "✓ 24 tests passing" },
      { t: "ask", s: "? Review the diff before merging  [y/n]" }
    ]
  },

  projects: [
    { id: "journal", n: "01", name: "Katsumii Journal", year: "2024", kind: "Desktop · paid", accent: "#22d3ee",
      desc: "A trading journal for funded, challenge and personal accounts. Local-first: your data never leaves your machine.", stack: ["Vue", "FastAPI", "SQLite"] },
    { id: "andromeda", n: "02", name: "Andromeda", year: "2025", kind: "Desktop · paid", accent: "#818cf8",
      desc: "A focused desktop app. One-line pitch goes here: what it does, in plain words.", stack: ["Vue", "Python"] },
    { id: "tidii", n: "03", name: "Tidii Cleaner", year: "2025", kind: "Desktop · free", accent: "#4ade80",
      desc: "Keeps a PC tidy — says exactly what it clears and what it never touches.", stack: ["Python"] },
    { id: "cubamii", n: "04", name: "Cubamii", year: "2026", kind: "Mobile · free", accent: "#facc15",
      desc: "The Katsumii mobile app. One-line pitch goes here: the one thing it does best.", stack: ["Vue"] }
  ],

  education: [
    { id: "msc", org: "Technical University", role: "M.Sc. Mechanical Engineering", from: "2012", to: "2015", note: "Thesis: topology optimisation of lightweight drive housings" },
    { id: "bsc", org: "Technical University", role: "B.Sc. Mechanical Engineering", from: "2009", to: "2012", note: "Focus: machine elements & lightweight design" }
  ],

  quotes: [
    { text: "Sam brings an engineer's rigour to everything — including the code.", who: "Head of Development, Helix Drives" },
    { text: "Ask for a prototype on Monday and you'll get a validated one on Friday.", who: "CTO, Meridian Industrial" }
  ],

  /* name → category + proficiency (1–5). years / roles are derived from `roles`. */
  skillMeta: {
    "CAD (SolidWorks)": ["Engineering", 5], "FEM (Ansys)": ["Engineering", 5], "GD&T": ["Engineering", 4], "Design for manufacturing": ["Engineering", 5], "Fatigue & materials": ["Engineering", 4], "Test engineering": ["Engineering", 4],
    "Python": ["Data & automation", 4], "MATLAB": ["Data & automation", 4], "Data analysis": ["Data & automation", 4], "Automation scripting": ["Data & automation", 4],
    "Project management": ["Leadership", 5], "Supplier management": ["Leadership", 4], "Cost engineering": ["Leadership", 4], "Mentoring": ["Leadership", 4],
    "AI-assisted coding": ["AI & software", 5], "LLM prompting": ["AI & software", 5], "Vue": ["AI & software", 3], "FastAPI": ["AI & software", 3], "Local-first apps": ["AI & software", 3]
  },
  categories: ["Engineering", "Data & automation", "Leadership", "AI & software"],
  catColor: { "Engineering": "#22d3ee", "Data & automation": "#818cf8", "Leadership": "#facc15", "AI & software": "#4ade80" }
};

/* ── helpers ── */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const cvIdx = (ym) => { const [y, m] = ym.split("-").map(Number); return y * 12 + (m - 1); };
const cvEnd = (r) => r.to || CV.now;
const cvFmt = (ym) => { const [y, m] = ym.split("-"); return MONTHS[+m - 1] + " " + y; };
const cvRange = (r) => cvFmt(r.from) + " — " + (r.to ? cvFmt(r.to) : "Present");
const cvMonths = (r) => cvIdx(cvEnd(r)) - cvIdx(r.from) + 1;
const cvDur = (r) => { const m = cvMonths(r), y = Math.floor(m / 12), mo = m % 12; return (y ? y + " yr" + (y > 1 ? "s" : "") : "") + (y && mo ? " " : "") + (mo ? mo + " mo" : ""); };
const cvRole = (id) => CV.roles.find((r) => r.id === id);
const cvSkills = () => Object.entries(CV.skillMeta).map(([name, [cat, level]]) => {
  const roles = CV.roles.filter((r) => r.skills.includes(name));
  const months = roles.reduce((a, r) => a + cvMonths(r), 0);
  return { name, cat, level, roles: roles.map((r) => r.id), years: Math.max(1, Math.round(months / 12)) };
}).sort((a, b) => b.level - a.level || b.years - a.years);
const cvEsc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
if (window.top !== window) document.documentElement.classList.add("in-frame");
