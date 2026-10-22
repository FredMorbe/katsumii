# CV concepts (mockups)

Résumé designs for the planned *Lab* section. All content is placeholder.

- **Modern** (`cv-r3-modern.html`) uses `_src/data.js`: mechanical engineer, 11 years, passion for AI-assisted software development.
- The six earlier concepts use `_src/data-sw-sample.js` (software-engineer sample profile).

| # | File | Idea |
|---|------|------|
| ★ 7 | `cv-r3-modern.html` | **Recommended.** No metaphor — modern product-style UX: floating glass cards, page tint follows the active role, per-role mini UIs, bento, light/dark |
| 1 | `cv-1-command.html` | Command palette (Ctrl/⌘+K) with live preview pane |
| 2 | `cv-2-elevation.html` | Career as a stage elevation profile, scrub / "Ride the route" |
| 3 | `cv-3-constellation.html` | Roles + skills as a force-laid-out star map |
| 4 | `cv-4-editorial.html` | Magazine layout, chapters per role, project carousel |
| 5 | `cv-5-datasheet.html` | Chip datasheet with Recruiter / Engineer / Founder mode switch |
| 6 | `cv-6-ask.html` | Scripted Q&A chat with rich answer cards (no AI) |

`index.html` is the comparison page (tabs, device toggle, rating matrix); screenshots live in `thumbs/`.

## Editing

- **Content:** `_src/data.js` (Modern) / `_src/data-sw-sample.js` (earlier concepts): name, roles, skills, projects, lab (AI side track), quotes. All values are placeholders.
- **Design:** `_src/N-name.html` templates. `/*@FONTS*/` and `/*@DATA*/` are replaced at build time.
- **Build:** `python3 docs/mockups/cv/_src/build.py` writes the standalone pages (fonts inlined as base64, no network needed).

Debug URL params: `cv-1-command.html?open=1&q=vue` · `cv-2-elevation.html?still=1` · `cv-3-constellation.html?pin=s:Vue` · `cv-5-datasheet.html?mode=engineer&markup=1` · `cv-6-ask.html?demo=path,stack`.
