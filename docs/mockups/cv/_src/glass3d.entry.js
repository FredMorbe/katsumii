/* Glass scene for cv-r6-glass.html — bundled with esbuild and inlined by build.py.
   window.initGlass({ canvas, anchors, mobile, reduce })  →  true if WebGL is available
     anchors(): [{ y: <document y of the section centre>, k: { x, y, z, s, ry, hue, core } }, …]   (re-read on resize)
   Debug params: ?q=low (DPR 1, no dispersion)  ·  ?hue=265 (fixed tint). */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const P = new URLSearchParams(location.search), LOW = P.get("q") === "low";
const lerp = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sm = (t) => t * t * (3 - 2 * t);

function gearGeometry(R, teeth, d, hole, spokes, depth) {
  const s = new THREE.Shape(), st = Math.PI * 2 / teeth, p = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];
  for (let i = 0; i < teeth; i++) { const a = i * st; [p(a - st * .3, R), p(a - st * .17, R + d), p(a + st * .17, R + d), p(a + st * .3, R)].forEach(([x, y], k) => (i === 0 && k === 0 ? s.moveTo(x, y) : s.lineTo(x, y))); }
  s.closePath();
  const h = new THREE.Path(); h.absarc(0, 0, hole, 0, Math.PI * 2, true); s.holes.push(h);
  for (let i = 0; i < spokes; i++) { const a = i * Math.PI * 2 / spokes, c = new THREE.Path(); c.absarc(Math.cos(a) * R * .64, Math.sin(a) * R * .64, R * .17, 0, Math.PI * 2, true); s.holes.push(c); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: .07, bevelSize: .06, bevelSegments: 4, curveSegments: 28 });
  g.translate(0, 0, -depth / 2); return g;
}
function glowTexture() { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(.25, "rgba(255,255,255,.45)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }

window.initGlass = function ({ canvas, anchors, mobile, reduce }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !LOW, powerPreference: "high-performance" }); } catch (e) { return false; }
  let DPR = Math.min(devicePixelRatio || 1, LOW ? 1 : 1.75);
  renderer.setPixelRatio(DPR); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(32, 1, .1, 100); cam.position.set(0, 0, 10);

  /* environment: dark studio with coloured soft boxes → rich reflections in the glass */
  const envS = new THREE.Scene(); envS.add(new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), new THREE.MeshBasicMaterial({ color: 0x05070f, side: THREE.BackSide })));
  const box = (w, h, x, y, z, c, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); envS.add(m); };
  box(14, 5, 0, 12, 4, 0xffffff, 7); box(5, 14, -12, 1, 4, 0x39d7ff, 6); box(5, 14, 12, 0, 2, 0x8a7bff, 6); box(12, 3, 0, -10, 6, 0xffb27a, 3.5); box(8, 8, 0, 2, -12, 0x6aa8ff, 3);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(envS, .035).texture; pm.dispose();

  /* backdrop: opaque full-screen shader (so the glass can refract it) */
  const bgU = { uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uC: { value: new THREE.Color() }, uPa: { value: new THREE.Vector2(.25, .7) }, uPb: { value: new THREE.Vector2(.8, .3) }, uPc: { value: new THREE.Vector2(.55, .95) }, uAsp: { value: 1 }, uT: { value: 0 } };
  const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: bgU, depthWrite: false, depthTest: false,
    vertexShader: "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}",
    fragmentShader: `varying vec2 vUv;uniform vec3 uA,uB,uC;uniform vec2 uPa,uPb,uPc;uniform float uAsp,uT;
      float blob(vec2 p,vec2 c,float r){vec2 d=(p-c)*vec2(uAsp,1.);return exp(-dot(d,d)/(r*r));}
      void main(){vec2 p=vUv;vec3 col=mix(vec3(.004,.006,.02),vec3(.012,.016,.045),p.y);
        col+=uA*blob(p,uPa+vec2(sin(uT*.2)*.03,cos(uT*.17)*.03),.34)*.85+uB*blob(p,uPb+vec2(cos(uT*.15)*.03,sin(uT*.21)*.03),.3)*.75+uC*blob(p,uPc,.4)*.6;
        col*=smoothstep(1.25,.25,length((p-.5)*vec2(uAsp*.8,1.)));
        col+=(fract(sin(dot(p*1000.,vec2(12.9898,78.233)))*43758.5453)-.5)*.012;
        gl_FragColor=vec4(col,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}` }));
  bg.frustumCulled = false; bg.renderOrder = -1000; scene.add(bg);

  /* glass */
  const mkGlass = (o = {}) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0xffffff, metalness: 0, roughness: .06, transmission: 1, thickness: 1.1, ior: 1.5, clearcoat: 1, clearcoatRoughness: .04, envMapIntensity: 1.5, attenuationColor: new THREE.Color(0x66d9ff), attenuationDistance: 2.2, specularIntensity: 1 }, LOW ? {} : { dispersion: .35 }, o));
  const glass = mkGlass(), rig = new THREE.Group(); scene.add(rig);
  const A = new THREE.Mesh(gearGeometry(1.5, 18, .2, .5, 6, .55), glass), B = new THREE.Mesh(gearGeometry(.92, 11, .2, .26, 0, .55), glass);
  const dist = 1.6 + 1.02; B.position.set(dist, -.15, 0); B.rotation.z = Math.PI / 11; rig.add(A, B);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35, .035, 20, 160), mkGlass({ thickness: .3 })); ring.rotation.x = Math.PI / 2.4; rig.add(ring);

  /* core: a glowing wire icosahedron inside the big gear */
  const core = new THREE.Group(); rig.add(core);
  const wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(.36, 1)), new THREE.LineBasicMaterial({ color: 0x7ff3ff, transparent: true, opacity: .95 }));
  const nuc = new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 0), new THREE.MeshBasicMaterial({ color: 0xbffaff }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: 0x59e6ff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: .9 })); glow.scale.set(2.4, 2.4, 1);
  core.add(wire, nuc, glow);
  const lamp = new THREE.PointLight(0x59e6ff, 8, 7, 2); core.add(lamp);

  /* small floating pieces for depth */
  const floaters = []; const geos = [new THREE.SphereGeometry(.3, 48, 32), new THREE.TorusKnotGeometry(.2, .07, 128, 16), new RoundedBoxGeometry(.5, .5, .5, 5, .12), new THREE.IcosahedronGeometry(.28, 1), new THREE.TorusGeometry(.26, .09, 24, 64), new THREE.CylinderGeometry(.2, .2, .5, 40)];
  const spots = [[-3.4, 2.1, -.5], [3.6, 2.5, -1.2], [-2.6, -2.5, 0], [3.1, -2.2, -.8], [-4.2, -.2, -2], [4.6, .3, -2.4]];
  geos.forEach((g, i) => { const m = new THREE.Mesh(g, mkGlass({ thickness: .6, attenuationColor: new THREE.Color().setHSL(.5 + i * .07, .8, .6) })); const f = { m, base: spots[i], ph: i * 1.7, d: .4 + i * .12 }; m.position.set(...spots[i]); m.scale.setScalar(1 + (i % 3) * .2); scene.add(m); floaters.push(f); });

  /* state */
  const cur = { x: 2, y: 0, z: 0, s: 1, ry: 0, hue: 200, core: 1 }, tgt = Object.assign({}, cur), ptr = { x: 0, y: 0, sx: 0, sy: 0 };
  let anc = anchors(), vw = 0, vh = 0, lastY = scrollY, spin = 0, running = true;
  const fixedHue = P.get("hue") ? +P.get("hue") : null;
  function pickTarget() {
    if (!anc.length) return; const c = scrollY + innerHeight * .5; let i = 0; while (i < anc.length - 1 && anc[i + 1].y <= c) i++;
    const a = anc[i], b = anc[Math.min(i + 1, anc.length - 1)], t = a === b ? 0 : sm(clamp((c - a.y) / (b.y - a.y)));
    for (const k in tgt) tgt[k] = k === "hue" ? lerp(a.k.hue, b.k.hue, t) : lerp(a.k[k], b.k[k], t);
    if (fixedHue != null) tgt.hue = fixedHue;
  }
  function resize() { vw = innerWidth; vh = innerHeight; renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.position.z = vw < vh ? 12.5 : 10; cam.updateProjectionMatrix(); bgU.uAsp.value = vw / vh; anc = anchors(); pickTarget(); }
  addEventListener("resize", resize); resize();
  addEventListener("pointermove", (e) => { ptr.x = e.clientX / vw - .5; ptr.y = e.clientY / vh - .5; }, { passive: true });
  addEventListener("scroll", () => { pickTarget(); if (reduce) draw(0); }, { passive: true });
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) loop(performance.now()); });

  const tint = new THREE.Color(), tmp = new THREE.Color();
  let t0 = performance.now(), slow = 0, frames = 0, prev = t0;
  function draw(dt) {
    const k = reduce ? 1 : 1 - Math.pow(.0009, dt); for (const key in cur) cur[key] += (tgt[key] - cur[key]) * (key === "hue" ? Math.min(1, k * .6) : k * .85);
    const dy = scrollY - lastY; lastY = scrollY; spin += dy * .0025;
    const time = performance.now() / 1000; bgU.uT.value = time;
    ptr.sx += (ptr.x - ptr.sx) * .06; ptr.sy += (ptr.y - ptr.sy) * .06;
    rig.position.set(cur.x + ptr.sx * .35, -cur.y * 0 + cur.y - ptr.sy * .25, cur.z); rig.scale.setScalar(cur.s);
    rig.rotation.y = cur.ry + ptr.sx * .55; rig.rotation.x = ptr.sy * .4 - .12;
    const sp = reduce ? 0 : dt * .32; A.rotation.z += sp + dy * .0016; B.rotation.z -= (sp + dy * .0016) * 18 / 11; ring.rotation.z += sp * .5; ring.rotation.y = Math.sin(time * .3) * .2;
    core.rotation.y += reduce ? 0 : dt * (.6 + cur.core * .6); core.rotation.x += reduce ? 0 : dt * .4; const pulse = 1 + (reduce ? 0 : Math.sin(time * 2.2) * .08);
    core.scale.setScalar((.8 + cur.core * .3) * pulse); glow.material.opacity = clamp(.35 + cur.core * .35, 0, 1); lamp.intensity = 3 + cur.core * 7;
    // tint by hue
    const h = cur.hue / 360; tint.setHSL(h, .9, .62); glow.material.color.copy(tint); lamp.color.copy(tint); wire.material.color.setHSL(h, .9, .78); nuc.material.color.setHSL(h, .8, .88);
    glass.attenuationColor.setHSL(h, .85, .62); ring.material.attenuationColor.setHSL(h, .85, .62);
    bgU.uA.value.setHSL(h, .85, .5).multiplyScalar(.42); bgU.uB.value.setHSL((h + .16) % 1, .8, .52).multiplyScalar(.36); bgU.uC.value.setHSL((h + .84) % 1, .8, .5).multiplyScalar(.34);
    const sx = anc.length && cur.x > 0 ? .78 : .2; bgU.uPa.value.set(sx, .62 + Math.sin(time * .2) * .02); bgU.uPb.value.set(1 - sx * .8, .3); bgU.uPc.value.set(.5, 1.0);
    floaters.forEach((f, i) => { const m = f.m; m.position.set(f.base[0] + Math.sin(time * .35 + f.ph) * .3 - ptr.sx * f.d, f.base[1] + Math.cos(time * .4 + f.ph) * .35 + ptr.sy * f.d * .6 - cur.y * .15, f.base[2] + cur.z * .3); m.rotation.x += reduce ? 0 : dt * (.25 + i * .05); m.rotation.y += reduce ? 0 : dt * (.3 - i * .03); m.material.attenuationColor.setHSL((h + i * .06) % 1, .8, .6); });
    renderer.render(scene, cam);
  }
  function loop(now) {
    if (!running) return; const dt = Math.min(.05, (now - prev) / 1000); prev = now; draw(dt);
    // adaptive quality: step the pixel ratio down when frames are slow
    frames++; if (dt > .034) slow++; if (frames === 40) { if (slow > 22 && DPR > 1) { DPR = Math.max(1, DPR - .4); renderer.setPixelRatio(DPR); renderer.setSize(vw, vh, false); glass.dispersion = 0; } frames = 0; slow = 0; }
    if (!reduce) requestAnimationFrame(loop);
  }
  document.documentElement.classList.add("gl-on");
  if (reduce) { draw(1 / 60); draw(1 / 60); } else requestAnimationFrame(loop);
  window.__glassRefresh = () => { anc = anchors(); pickTarget(); if (reduce) draw(0); };
  return true;
};
