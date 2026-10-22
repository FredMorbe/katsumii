/* Shared engineering mini-graphics (used by the Workspace and Stack pages).
   Every graphic reads CSS variables on its .vz wrapper:  --vc (accent)  --vi (ink)  --vl (hairlines)
   Add class "in" to the wrapper to start the draw-in animations. */
const VZ = (() => {
  const gearPath = (cx, cy, r, n, d, rot = 0) => { let s = ""; const st = Math.PI * 2 / n, P = (a, rad) => `${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`;
    for (let i = 0; i < n; i++) { const a = i * st + rot; s += `${i ? "L" : "M"}${P(a - st * .3, r)}L${P(a - st * .17, r + d)}L${P(a + st * .17, r + d)}L${P(a + st * .3, r)}`; } return s + "Z"; };
  const gears = () => { const rA = 50, nA = 15, rB = 36.7, nB = 11, d = 9, dist = rA + rB + d, cxA = 92, cxB = cxA + dist, cy = 100, stB = Math.PI * 2 / nB;
    return `<svg class="vz-gears" viewBox="0 0 300 200"><g class="a" style="transform-origin:${cxA}px ${cy}px"><path class="g" d="${gearPath(cxA, cy, rA, nA, d)}"/><circle class="h" cx="${cxA}" cy="${cy}" r="14"/><circle class="h" cx="${cxA}" cy="${cy}" r="30"/><path class="h" d="M${cxA - 30} ${cy}H${cxA + 30}M${cxA} ${cy - 30}V${cy + 30}"/></g><g class="b" style="transform-origin:${cxB}px ${cy}px"><path class="g" d="${gearPath(cxB, cy, rB, nB, d, Math.PI + stB / 2)}"/><circle class="h" cx="${cxB}" cy="${cy}" r="10"/><circle class="h" cx="${cxB}" cy="${cy}" r="22"/></g></svg>`; };
  const fatigue = () => { const pts = [[44, 36], [64, 41], [88, 52], [112, 64], [140, 78], [170, 88], [204, 96], [238, 100], [266, 101]];
    return `<svg class="vz-fat" viewBox="0 0 300 150"><path class="gr" d="M30 30H290M30 70H290M30 110H290"/><path class="ax" d="M30 10V125H290"/><text x="30" y="141">10³</text><text x="150" y="141">10⁵</text><text x="268" y="141">10⁷</text><text x="8" y="14">σ</text><path class="cv" pathLength="1" d="M30 26 C80 30 110 62 160 84 S250 102 290 104"/>${pts.map(([x, y], i) => `<circle cx="${x}" cy="${y + (i % 3 - 1) * 4}" r="3.2" style="--d:${.9 + i * .12}s"/>`).join("")}</svg>`; };
  const cmp = () => `<div class="vz-cmp">${[["Weight", 100, 78], ["Part count", 100, 84], ["Time to market", 100, 78]].map(([l, b, a], i) => `<div class="r"><span>${l}</span><div class="tr"><i class="b" style="--w:${b}%;--d:${i * .15}s"></i><i class="a" style="--w:${a}%;--d:${i * .15 + .25}s"></i></div></div>`).join("")}</div>`;
  const ring = () => `<div class="vz-ring"><svg viewBox="0 0 110 110"><circle class="t" cx="55" cy="55" r="46"/><circle class="v" cx="55" cy="55" r="46"/></svg><div><b>87 %</b><span>milestones on plan</span></div></div><div class="vz-rows"><div><span>Budget</span><em>€3.2 M · on plan</em></div><div><span>Team</span><em>12 people</em></div><div><span>Next gate</span><em>B-sample · 14 days</em></div></div>`;
  const mk = (title, body, cap) => ({ title, html: body, cap });
  return { by: {
    nordwerk: () => mk("gearbox · modular platform", gears(), "40+ variants · −18 % parts per gearbox"),
    aeron: () => mk("fatigue · FEM vs. test", fatigue(), "5 → 2 prototype iterations · model validated by test"),
    helixdrives: () => mk("drive unit · before / after", cmp(), "6-person team · −4 months to series release"),
    meridian: () => mk("drive platform · programme status", ring(), "12 people · €3.2 M budget · on plan")
  } };
})();
