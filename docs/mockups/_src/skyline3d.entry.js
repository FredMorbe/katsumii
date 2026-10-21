import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

(function () {
  const stage = document.querySelector('.s3-stage');
  const canvas = stage.querySelector('canvas');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = new URLSearchParams(location.search);
  const LOWQ = q.get('q') === 'low';

  /* ───────── renderer ───────── */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  let pr = Math.min(window.devicePixelRatio || 1, LOWQ ? 1 : 1.5);
  renderer.setPixelRatio(pr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03030a);
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 3000);

  const FOG = new THREE.Color(0.07, 0.036, 0.15);
  const U = { uTime: { value: 0 }, uFogColor: { value: FOG }, uFog: { value: 0.0019 } };

  /* ───────── helpers ───────── */
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const hdr = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
  const ACC = {
    journal: [0x22d3ee, 0x67e8f9], andromeda: [0x818cf8, 0xc4b5fd],
    tidii: [0x4ade80, 0xa7f3c0], cubamii: [0xfacc15, 0xfde68a],
  };

  /* ───────── sky ───────── */
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(2400, 32, 20),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { uTime: U.uTime },
      vertexShader: `varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `
        varying vec3 vD; uniform float uTime;
        float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
        float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
        float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=.5; } return s; }
        void main(){
          vec3 d = normalize(vD);
          float y = max(d.y, -0.2);
          vec3 zen = vec3(.006,.008,.03), mid = vec3(.05,.025,.12), hor = vec3(.42,.1,.42);
          vec3 col = mix(hor, mid, smoothstep(0., .22, y));
          col = mix(col, zen, smoothstep(.15, .85, y));
          col += vec3(.35,.12,.3) * exp(-abs(y)*14.) * .55;               // hot band at the horizon
          // stars
          vec2 sp = d.xz / (abs(d.y)+.35) * 260.;
          vec2 cell = floor(sp), f = fract(sp);
          float r = h21(cell);
          float st = step(.9935, r) * (1.-smoothstep(0.,.35,length(f-.5))) * (.5+.5*sin(uTime*(1.+r*3.)+r*40.));
          col += vec3(.85,.9,1.) * st * smoothstep(.12,.45,d.y) * 1.2;
          // clouds lit from below by the city
          vec2 cp = d.xz / (d.y + .22) * .55 + vec2(uTime*.004, 0.);
          float c = smoothstep(.45,.85, fbm(cp*1.6)) * smoothstep(0.,.18,d.y) * (1.-smoothstep(.35,.7,d.y));
          col = mix(col, vec3(.22,.08,.28) + vec3(.5,.14,.4)*exp(-d.y*4.), c*.7);
          // moon
          vec3 md = normalize(vec3(-.04,.34,-1.));
          float mdst = distance(d, md);
          float disc = 1.-smoothstep(.033,.036,mdst);
          float crater = vn((d.xy-md.xy)*180.)*.22;
          float maria = smoothstep(.45,.7, fbm((d.xy-md.xy)*38.)); float shade = .75 + .5*dot(normalize(d-md+vec3(.0,.0,.0001)), normalize(vec3(.4,.5,.2)));
          col += vec3(1.05,1.0,.92) * disc * (1.25 - crater - maria*.35) * clamp(shade,.55,1.1) * (1.-c*.85);
          col += vec3(.45,.5,.9) * exp(-mdst*13.) * .55;
          gl_FragColor = vec4(col,1.);
        }`,
    }));
  sky.renderOrder = -10;
  scene.add(sky);

  /* ───────── building shader ───────── */
  const BLD_VERT = `
    attribute float aSeed; varying vec3 vW; varying vec3 vN; varying float vSeed; varying vec3 vL;
    void main(){
      vec4 p = vec4(position,1.);
      #ifdef USE_INSTANCING
        p = instanceMatrix * p;
      #endif
      vL = p.xyz;
      vec4 wp = modelMatrix * p; vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); vSeed = aSeed;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }`;
  const BLD_FRAG = `
    varying vec3 vW; varying vec3 vN; varying float vSeed; varying vec3 vL;
    uniform float uTime, uFog, uFogK, uAccentMix, uGlow, uLit, uScanY, uScanOn, uRound, uRadius, uWinW, uWinH;
    uniform vec3 uFogColor, uAccent, uCenter;
    float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    void main(){
      vec3 n = normalize(vN);
      float sd = floor(vSeed*100. + .5) * .01;      // interpolated constants wobble in the last bits — snap them before hashing
      vec3 col = vec3(.011,.014,.04);
      float y = vW.y;
      col += vec3(.34,.1,.26) * .16 * exp(-y*.03);                         // street bounce
      col += vec3(.1,.12,.3) * .05 * smoothstep(0.,120.,y);
      bool roof = n.y > .6;
      if(!roof){
        vec2 uv;
        if(uRound > .5){ uv = vec2(atan(vW.z-uCenter.z, vW.x-uCenter.x) * uRadius, y); }
        else uv = abs(n.x) > abs(n.z) ? vec2(vW.z, y) : vec2(vW.x, y);
        vec2 cell = uv / vec2(uWinW, uWinH);
        vec2 id = floor(cell), f = fract(cell);
        float win = smoothstep(.12,.2,f.x) * (1.-smoothstep(.8,.88,f.x)) * smoothstep(.2,.28,f.y) * (1.-smoothstep(.76,.84,f.y));
        float aaf = clamp(1. - max(fwidth(cell.x), fwidth(cell.y)) * 4.5, 0., 1.);
        win = mix(.52, win, aaf);
        float face = abs(n.x) > abs(n.z) ? 3. : 0.;
        float r = h21(id + sd*17. + face);
        float slow = floor(uTime*.1 + r*30.);
        float r2 = h21(id*1.37 + slow*1.7 + sd*5.);
        float rowr = h21(vec2(id.y, sd*9. + face));
        float litP = clamp(uLit + uGlow*.12 + step(.86,rowr)*.22, 0., 1.);
        float lit = mix(litP, step(1. - litP, r2), aaf);
        float k = h21(id.yx + sd*3.);
        vec3 wc = k < .6 ? vec3(1.,.72,.42) : k < .88 ? vec3(.62,.84,1.) : k < .955 ? vec3(1.,.45,.75) : uAccent*1.1;
        wc = mix(wc, uAccent*1.15, uAccentMix * step(.72, h21(id+7.1)));
        float flick = .8 + .2*sin(uTime*(2.+r*5.)+r*40.);
        col += wc * win * lit * (1.25 + uGlow*.5 + step(.97,r)*1.1) * mix(1., flick, step(.93,r));
        col += vec3(.05,.05,.1) * (1.-win) * step(f.y,.12) * .6;           // floor ledges
        col += vec3(.012,.02,.05) * win * (1.-lit);                         // dark glass
      } else {
        col += vec3(.012,.012,.03);
      }
      col += uAccent * uAccentMix * (.03 + .05*uGlow) * (.4 + .6*smoothstep(0.,60.,y));
      float s = exp(-pow((y-uScanY)*.5,2.)) * uScanOn;
      col += uAccent * s * 2.6 * (roof ? 0. : 1.);
      float d = length(vW - cameraPosition);
      float fg = 1. - exp(-d * uFog * uFogK);
      fg = clamp(fg + .25*exp(-y*.05)*fg, 0., 1.);
      col = mix(col, uFogColor, fg);
      gl_FragColor = vec4(col, 1.);
    }`;
  function bldMat(o) {
    o = o || {};
    return new THREE.ShaderMaterial({
      vertexShader: BLD_VERT, fragmentShader: BLD_FRAG,
      uniforms: {
        uTime: U.uTime, uFogColor: U.uFogColor, uFog: U.uFog, uFogK: { value: o.fogK || 1 },
        uAccentMix: { value: o.mix || 0 }, uAccent: { value: new THREE.Color(o.accent || 0x000000) },
        uGlow: { value: 0 }, uLit: { value: o.lit != null ? o.lit : .3 },
        uScanY: { value: -999 }, uScanOn: { value: 0 }, uRound: { value: o.round ? 1 : 0 }, uRadius: { value: o.radius || 1 },
        uCenter: { value: new THREE.Vector3() }, uWinW: { value: o.ww || 3 }, uWinH: { value: o.wh || 3.7 },
      },
    });
  }
  function seedAttr(geo, v) {
    const n = geo.attributes.position.count, a = new Float32Array(n).fill(v);
    geo.setAttribute('aSeed', new THREE.BufferAttribute(a, 1));
    return geo;
  }

  /* ───────── hero towers ───────── */
  const HERO = [
    { k: 'cubamii', x: -42, z: 4, top: 46 },
    { k: 'tidii', x: -2, z: -36, top: 60 },
    { k: 'journal', x: 42, z: -14, top: 80 },
    { k: 'andromeda', x: 98, z: -48, top: 100 },
  ];
  const heroBy = {}; HERO.forEach(h => { heroBy[h.k] = h; h.group = new THREE.Group(); h.group.position.set(h.x, 0, h.z); scene.add(h.group); h.glow = 0; h.edgeMats = []; h.mats = []; h.hit = []; });
  const edge = (geo, h, k) => {
    const m = new THREE.LineBasicMaterial({ color: hdr(ACC[h.k][0], k || 2.2), toneMapped: false }); h.edgeMats.push([m, k || 2.2]);
    return new THREE.LineSegments(new THREE.EdgesGeometry(geo), m);
  };
  const addHit = (h, w, hh, d, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), new THREE.MeshBasicMaterial({ visible: false }));
    m.position.y = y; m.userData.hero = h.k; h.group.add(m); h.hit.push(m);
  };
  const track = (h, mat) => { h.mats.push(mat); return mat; };

  /* Journal — stepped ziggurat with a crown */
  (function () {
    const h = heroBy.journal, g = h.group, a = ACC.journal[0];
    const tiers = [[30, 28, 46, 0], [23, 21, 24, 46], [15, 14, 14, 70]];
    tiers.forEach(([w, d, hh, y0], i) => {
      const geo = seedAttr(new THREE.BoxGeometry(w, hh, d), i + 1.3).translate(0, y0 + hh / 2, 0);
      const m = new THREE.Mesh(geo, track(h, bldMat({ accent: a, mix: .55, lit: .4, fogK: .45, ww: 1.9, wh: 2.7 })));
      g.add(m);
      const e = edge(new THREE.BoxGeometry(w, hh, d), h); e.position.y = y0 + hh / 2; g.add(e);
      // glowing band at the tier top
      const band = new THREE.Mesh(new THREE.BoxGeometry(w + .6, .7, d + .6), new THREE.MeshBasicMaterial({ color: hdr(a, 2.6), toneMapped: false }));
      band.position.y = y0 + hh; g.add(band); h.edgeMats.push([band.material, 2.6]);
    });
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.18, .5, 16, 8), new THREE.MeshBasicMaterial({ color: hdr(a, 2) , toneMapped: false })); ant.position.y = 92; g.add(ant);
    addHit(h, 30, 90, 28, 45);
    h.blink = new THREE.Vector3(h.x, 100.3, h.z);
    // holographic equity curve floating next to the tower
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const holo = new THREE.Mesh(new THREE.PlaneGeometry(26, 13), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }));
    holo.position.set(27, 54, 6); holo.rotation.y = -.28; g.add(holo); h.holo = { cx, tex, cv, mesh: holo };
    const pts = []; let v = .5; for (let i = 0; i < 40; i++) { v += (rnd() - .42) * .09; pts.push(Math.max(.08, Math.min(.95, v))); }
    h.holo.pts = pts;
  })();

  /* Andromeda — tapered spire, orbit rings, beacon */
  (function () {
    const h = heroBy.andromeda, g = h.group, a = ACC.andromeda[0];
    const geo = seedAttr(new CylinderGeometryAxis(4, 13, 6, 74), 2.2).translate(0, 37, 0);
    const mesh = new THREE.Mesh(geo, track(h, bldMat({ accent: a, mix: .6, lit: .4, fogK: .4, ww: 1.8, wh: 2.6 }))); g.add(mesh);
    const eg = new CylinderGeometryAxis(4, 13, 6, 74).translate(0, 37, 0); const e = edge(eg, h); g.add(e);
    // needle
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(.12, .7, 26, 8), new THREE.MeshBasicMaterial({ color: hdr(a, 2.4), toneMapped: false })); needle.position.y = 87; g.add(needle); h.edgeMats.push([needle.material, 2.4]);
    h.rings = [];
    [[16, 66, .4, 0], [12, 58, -.7, 1.1], [8.5, 50, .9, 2.2]].forEach(([r, y, sp, ph]) => {
      const rg = new THREE.Group(); rg.position.y = y;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, .22, 8, 96), new THREE.MeshBasicMaterial({ color: hdr(a, 2.2), toneMapped: false })); ring.rotation.x = Math.PI / 2; rg.add(ring);
      const sat = new THREE.Mesh(new THREE.SphereGeometry(.9, 12, 12), new THREE.MeshBasicMaterial({ color: hdr(0xffffff, 3), toneMapped: false })); rg.add(sat);
      g.add(rg); h.rings.push({ rg, ring, sat, r, sp, ph }); h.edgeMats.push([ring.material, 2.2]);
    });
    // beacon beam + rotating sweep
    const beamMat = (k) => new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uC: { value: hdr(a, k) }, uT: U.uTime },
      vertexShader: `varying float vY; varying vec3 vP; void main(){ vY = uv.y; vP = position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying float vY; uniform vec3 uC; uniform float uT; void main(){ float a = pow(1.-vY, 1.5) * (.8+.2*sin(uT*1.3)); gl_FragColor = vec4(uC, a*.55); }`,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, 9, 420, 24, 1, true), beamMat(.5)); beam.position.y = 100 + 210; beam.rotation.z = Math.PI; g.add(beam);
    const sweep = new THREE.Group(); sweep.position.y = 102;
    const sw = new THREE.Mesh(new THREE.CylinderGeometry(.4, 20, 260, 20, 1, true), beamMat(.55)); sw.position.set(130, 0, 0); sw.rotation.z = Math.PI / 2 + .12; sweep.add(sw); g.add(sweep); h.sweep = sweep;
    addHit(h, 26, 100, 26, 50);
    h.blink = new THREE.Vector3(h.x, 102, h.z);
  })();
  function CylinderGeometryAxis(sides, rb, rt, hh) { const g = new THREE.CylinderGeometry(rt, rb, hh, sides, 1, false); g.rotateY(Math.PI / 4); return g; }

  /* Tidii — cylinder tower with a scanning band and rising motes */
  (function () {
    const h = heroBy.tidii, g = h.group, a = ACC.tidii[0], R = 10, H = 58;
    const geo = seedAttr(new THREE.CylinderGeometry(R, R, H, 40, 1), 3.4).translate(0, H / 2, 0);
    const mat = track(h, bldMat({ accent: a, mix: .5, lit: .42, fogK: .45, round: true, radius: R, ww: 1.9, wh: 2.7 }));
    mat.uniforms.uCenter.value.set(h.x, 0, h.z); mat.uniforms.uScanOn.value = 1; h.scanMat = mat;
    g.add(new THREE.Mesh(geo, mat));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(R + .4, R + .4, .9, 40), new THREE.MeshBasicMaterial({ color: hdr(a, 2.6), toneMapped: false })); cap.position.y = H; g.add(cap); h.edgeMats.push([cap.material, 2.6]);
    for (let i = 1; i < 6; i++) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(R + .15, .16, 6, 64), new THREE.MeshBasicMaterial({ color: hdr(a, 1.9), toneMapped: false })); r.rotation.x = Math.PI / 2; r.position.y = i * (H / 6); g.add(r); h.edgeMats.push([r.material, 1.9]);
    }
    // dome + antenna
    const dome = new THREE.Mesh(new THREE.SphereGeometry(R * .55, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: hdr(a, 1.2), toneMapped: false, transparent: true, opacity: .8 })); dome.position.y = H + .4; g.add(dome); h.edgeMats.push([dome.material, 1.2]);
    // rising motes
    const N = 260, pos = new Float32Array(N * 3), ph = new Float32Array(N);
    for (let i = 0; i < N; i++) { pos[i * 3] = rnd() * 6.283; pos[i * 3 + 1] = rnd(); pos[i * 3 + 2] = R + 1 + rnd() * 9; ph[i] = rnd(); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('aPh', new THREE.BufferAttribute(ph, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uT: U.uTime, uC: { value: hdr(a, 2.2) }, uH: { value: H + 10 }, uPR: { value: pr } },
      vertexShader: `attribute float aPh; uniform float uT, uH, uPR; varying float vA;
        void main(){ float t = fract(position.y + uT*.045*(.6+aPh)); float ang = position.x + uT*.35*(.5+aPh) + t*6.; float rad = position.z * (1.-.45*t);
          vec3 p = vec3(cos(ang)*rad, t*uH, sin(ang)*rad); vA = sin(t*3.14159); vec4 mv = modelViewMatrix*vec4(p,1.);
          gl_PointSize = (2. + aPh*3.) * uPR * 90. / -mv.z; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `uniform vec3 uC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); float a = (1.-smoothstep(0.,.5,d)) * vA; gl_FragColor = vec4(uC, a); }`,
    });
    const pts = new THREE.Points(pg, pm); pts.frustumCulled = false; g.add(pts); h.motes = pm;
    addHit(h, 22, 60, 22, 30);
    h.blink = new THREE.Vector3(h.x, H + 6, h.z);
  })();

  /* Cubamii — phone-shaped tower with a live screen */
  (function () {
    const h = heroBy.cubamii, g = h.group, a = ACC.cubamii[0], W = 22, H = 46, D = 7.5;
    const pivot = new THREE.Group(); pivot.rotation.y = .3; pivot.position.y = H / 2; g.add(pivot);
    const glowShell = new THREE.Mesh(new RoundedBoxGeometry(W + 1.4, H + 1.4, D + 1.2, 4, 2.4), new THREE.MeshBasicMaterial({ color: hdr(a, 1.9), toneMapped: false })); pivot.add(glowShell); h.edgeMats.push([glowShell.material, 1.9]);
    const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D + 1.8, 4, 2), new THREE.MeshBasicMaterial({ color: 0x07080f })); pivot.add(body);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = 480; const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(W - 2.2, H - 3.4), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(1.5, 1.5, 1.5) })); screen.position.z = (D + 1.8) / 2 + .02; pivot.add(screen);
    const notch = new THREE.Mesh(new THREE.PlaneGeometry(5, .8), new THREE.MeshBasicMaterial({ color: 0x020308 })); notch.position.set(0, H / 2 - 1.55, (D + 1.8) / 2 + .05); pivot.add(notch);
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(W - 2.2, H - 3.4), new THREE.MeshBasicMaterial({ color: hdr(a, .8), toneMapped: false, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })); rim.position.z = screen.position.z + .02; pivot.add(rim); h.rim = rim;
    h.phone = { cx, tex, cv, W, H }; h.screen = screen;
    // antenna lines on top
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 9, 6), new THREE.MeshBasicMaterial({ color: hdr(a, 2.2), toneMapped: false })); ant.position.y = H + 4.5; g.add(ant); h.edgeMats.push([ant.material, 2.2]);
    addHit(h, 27, 48, 12, 24);
    h.blink = new THREE.Vector3(h.x, H + 9.5, h.z);
  })();

  /* ───────── city ───────── */
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0);
  const blocks = [];
  const footprints = HERO.map(h => ({ x: h.x, z: h.z, r: 22 }));
  const free = (x, z, r) => footprints.every(f => Math.hypot(x - f.x, z - f.z) > f.r + r * .7);
  function add(x, z, w, d, hh) { if (free(x, z, Math.max(w, d))) { blocks.push({ x, z, w, d, h: hh }); footprints.push({ x, z, r: Math.max(w, d) * .5 }); } }
  // the city sits behind an open plaza; hero towers are the landmarks, so the fabric stays lower than they are
  for (let i = 0; i < 4200 && blocks.length < 820; i++) {
    const z = -64 - Math.pow(rnd(), 1.1) * 520;
    const spread = 150 + (-z) * .9;
    const x = (rnd() - .5) * 2 * spread;
    const side = Math.min(1, Math.max(0, (Math.abs(x) - 100) / 170)), dist = (-z - 64) / 520;
    const w = 9 + rnd() * 17, d = 9 + rnd() * 17;
    add(x, z, w, d, 12 + Math.pow(rnd(), 1.9) * (34 + side * 100 + (1 - dist) * 18 + dist * 36));
  }
  // canyon walls to the left and right of the plaza
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 46; i++) add(s * (140 + rnd() * 130), 50 - rnd() * 240, 14 + rnd() * 14, 14 + rnd() * 14, 34 + rnd() * 120);
  const cityMat = bldMat({ lit: .2, ww: 2.2, wh: 3.0, fogK: .85 });
  const city = new THREE.InstancedMesh(boxGeo.clone(), cityMat, blocks.length);
  const seeds = new Float32Array(blocks.length), m4 = new THREE.Matrix4();
  blocks.forEach((b, i) => { m4.makeScale(b.w, b.h, b.d); m4.setPosition(b.x, 0, b.z); city.setMatrixAt(i, m4); seeds[i] = rnd() * 50; });
  city.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1)); city.frustumCulled = false;
  scene.add(city);
  // rooftop warning lights + antennas for the tall ones
  const glowPts = [];
  blocks.filter(b => b.h > 70).forEach(b => glowPts.push([b.x, b.h + 2, b.z, 1.4, rnd() * 6, [1, .25, .25]]));
  // street lamps
  for (let i = -9; i <= 9; i++) { glowPts.push([i * 30, 11, 96, 5, -1, [1, .78, .5]]); glowPts.push([i * 30 + 15, 11, 30, 4, -1, [.6, .8, 1]]); }
  // hero top lights
  HERO.forEach(h => glowPts.push([h.blink.x, h.blink.y, h.blink.z, 3.4, rnd() * 6, [1, .2, .2]]));
  (function () {
    const n = glowPts.length, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), sz = new Float32Array(n), ph = new Float32Array(n);
    glowPts.forEach((p, i) => { pos.set([p[0], p[1], p[2]], i * 3); col.set(p[5], i * 3); sz[i] = p[3]; ph[i] = p[4]; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(col, 3)); g.setAttribute('aS', new THREE.BufferAttribute(sz, 1)); g.setAttribute('aP', new THREE.BufferAttribute(ph, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: U.uTime, uPR: { value: pr } },
      vertexShader: `attribute vec3 aC; attribute float aS, aP; uniform float uT, uPR; varying vec3 vC; varying float vA;
        void main(){ vC = aC; vA = aP < 0. ? 1. : step(.0, sin(uT*2.2 + aP*7.)); vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = aS * uPR * 120. / -mv.z; gl_Position = projectionMatrix*mv; }`,
      fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord-.5); float a = pow(1.-smoothstep(0.,.5,d), 2.2) * vA; gl_FragColor = vec4(vC*2.4, a); }`,
    });
    const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); U.glowMat = m;
  })();

  /* ───────── skycars ───────── */
  const CARS = 150;
  const carGeo = new THREE.BoxGeometry(1, 1, 1);
  const headMat = new THREE.MeshBasicMaterial({ toneMapped: false }), trailMat = new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, opacity: .5, blending: THREE.AdditiveBlending, depthWrite: false });
  const heads = new THREE.InstancedMesh(carGeo, headMat, CARS), trails = new THREE.InstancedMesh(carGeo, trailMat, CARS);
  heads.frustumCulled = trails.frustumCulled = false;
  const car = [], PAL = [[1, .3, .62], [.3, .9, 1], [1, .8, .4], [.85, .85, 1], [.6, .5, 1]];
  for (let i = 0; i < CARS; i++) {
    const lane = i % 6, ground = lane === 5;
    const c = { z: ground ? 60 + rnd() * 50 : -20 - rnd() * 160, y: ground ? .7 : 22 + lane * 11 + rnd() * 5, v: (lane % 2 ? -1 : 1) * (10 + rnd() * 16) * (ground ? 1.8 : 1), x: (rnd() - .5) * 700, s: .8 + rnd() * .9, col: PAL[(rnd() * PAL.length) | 0] };
    car.push(c); const cc = new THREE.Color(c.col[0], c.col[1], c.col[2]).multiplyScalar(3); heads.setColorAt(i, cc); trails.setColorAt(i, cc.clone().multiplyScalar(.5));
  }
  scene.add(heads, trails);
  function moveCars(dt, t) {
    for (let i = 0; i < CARS; i++) {
      const c = car[i]; c.x += c.v * dt; if (c.x > 360) c.x = -360; if (c.x < -360) c.x = 360;
      const dir = Math.sign(c.v);
      m4.makeScale(1.8 * c.s, .26 * c.s, .38 * c.s); m4.setPosition(c.x, c.y + Math.sin(t * .6 + i) * .15, c.z); heads.setMatrixAt(i, m4);
      m4.makeScale(10 * c.s, .1 * c.s, .1 * c.s); m4.setPosition(c.x - dir * 6 * c.s, c.y, c.z); trails.setMatrixAt(i, m4);
    }
    heads.instanceMatrix.needsUpdate = trails.instanceMatrix.needsUpdate = true;
  }

  /* ───────── billboards ───────── */
  const boards = [];
  function neonBoard(text, color, x, y, z, w, hgt, ry) {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = Math.round(512 * hgt / w); const c = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.position.set(x, y, z); m.rotation.y = ry; scene.add(m); boards.push({ cv, c, tex, text, color, m, ph: rnd() * 10 });
  }
  neonBoard('勝', '#ff5fb0', -84, 62, 2, 16, 24, .3); neonBoard('OPEN 24H', '#35e0ff', 100, 46, -2, 24, 8, -.35);
  neonBoard('雨', '#a78bfa', -116, 90, -52, 14, 22, .25); neonBoard('KATSUMII', '#ffd36b', 118, 78, -60, 30, 8, -.3);
  function drawBoards(t) {
    boards.forEach(b => {
      const { c, cv } = b; c.clearRect(0, 0, cv.width, cv.height);
      const f = Math.sin(t * 9 + b.ph) > .985 ? .25 : 1;
      c.font = `700 ${Math.round(cv.height * .62)}px "DM Sans", "Yu Gothic", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = b.color; c.shadowBlur = 26; c.fillStyle = b.color; c.globalAlpha = f;
      c.strokeStyle = b.color; c.lineWidth = 6; c.strokeRect(10, 10, cv.width - 20, cv.height - 20);
      c.fillText(b.text, cv.width / 2, cv.height / 2 + 6); c.globalAlpha = 1; b.tex.needsUpdate = true;
    });
  }

  /* ───────── wet street (reflector with its own shader) ───────── */
  const WET = {
    name: 'WetStreet',
    uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uTime: U.uTime, uFogColor: U.uFogColor, uFog: U.uFog },
    vertexShader: `uniform mat4 textureMatrix; varying vec4 vUv; varying vec3 vW;
      void main(){ vUv = textureMatrix * vec4(position,1.); vec4 wp = modelMatrix * vec4(position,1.); vW = wp.xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime, uFog; uniform vec3 uFogColor; varying vec4 vUv; varying vec3 vW;
      float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      float vn(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y); }
      float fbm(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*vn(p); p*=2.1; a*=.5; } return s; }
      vec2 ripple(vec2 p, float sc, float sp){
        vec2 q = p*sc; vec2 id = floor(q), f = fract(q) - .5; vec2 acc = vec2(0.);
        for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
          vec2 o = vec2(float(i),float(j)); vec2 cid = id + o; float r = h21(cid); vec2 c = o + (vec2(h21(cid+3.1),h21(cid+7.7))-.5)*.7 - f - .5 + .5;
          vec2 dv = f - (o + (vec2(h21(cid+3.1),h21(cid+7.7))-.5)*.7); float t = fract(uTime*sp + r); float rad = t*.5; float dd = length(dv);
          float ring = (1.-smoothstep(0.,.06,abs(dd-rad))) * (1.-t) * (1.-t);
          acc += normalize(dv+1e-4) * ring;
        }
        return acc;
      }
      void main(){
        vec2 p = vW.xz;
        float pm = smoothstep(.36,.62, fbm(p*.03+3.1)*.7 + fbm(p*.11)*.3);
        vec2 rip = ripple(p, .55, .55) + ripple(p+19., .9, .8)*.6;
        vec2 grain = (vec2(vn(p*2.3+uTime*.05), vn(p*2.1+8.))-.5);
        vec2 dist = (rip*.012 + grain*.004*(1.-pm*.6));
        vec2 uv = vUv.xy / vUv.w + dist;
        float blurR = mix(.0045, .0016, pm) * (.7 + .5*length(vW.xz)*.0);
        vec3 acc = vec3(0.); float wsum = 0.;
        for(int i=0;i<9;i++){
          float a = float(i)*2.39996; float r = sqrt((float(i)+.5)/9.) * blurR * 2.4;
          acc += texture2D(tDiffuse, uv + vec2(cos(a),sin(a))*r*vec2(.6,1.)).rgb; wsum += 1.;
        }
        acc /= wsum;
        vec3 V = normalize(cameraPosition - vW);
        float fres = .22 + .78*pow(1.-max(V.y,0.), 3.);
        vec3 asphalt = vec3(.007,.009,.02) + vec3(.02,.01,.03) * fbm(p*.4);
        vec3 col = asphalt + acc * mix(.34, 1.25, pm) * fres;
        // lane markings
        float lane = smoothstep(.12,.0,abs(fract(vW.z/ 26. + .5)-.5)*26.-.0) * 0.;
        float d = length(vW - cameraPosition);
        float fg = 1. - exp(-d*uFog*1.15);
        col = mix(col, uFogColor, fg);
        gl_FragColor = vec4(col, 1.);
      }`,
  };
  const rw = () => Math.max(256, Math.round(stage.clientWidth * pr * .55)), rh = () => Math.max(256, Math.round(stage.clientHeight * pr * .55));
  const street = new Reflector(new THREE.PlaneGeometry(2600, 2600), { textureWidth: 1024, textureHeight: 512, shader: WET, clipBias: .003, multisample: LOWQ ? 0 : 2 });
  street.rotation.x = -Math.PI / 2; street.position.y = 0; scene.add(street);
  // painted lines (unlit, so they only pick up the reflection and fog by being dark-grey)
  (function () {
    const mat = new THREE.MeshBasicMaterial({ color: 0x14112a });
    for (let i = -14; i <= 14; i++) { const d = new THREE.Mesh(new THREE.PlaneGeometry(7, .45), mat); d.rotation.x = -Math.PI / 2; d.position.set(i * 22, .02, 72); scene.add(d); }
  })();

  /* neon light pools bleeding onto the wet street */
  HERO.forEach(h => {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uC: { value: hdr(ACC[h.k][0], 1) }, uG: { value: 0 }, uT: U.uTime },
      vertexShader: `varying vec2 vU; void main(){ vU = uv - .5; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
      fragmentShader: `varying vec2 vU; uniform vec3 uC; uniform float uG, uT; void main(){ float d = length(vU)*2.; float a = pow(max(1.-d,0.), 2.4) * (.5 + .5*uG) * (.9 + .1*sin(uT*1.3)); gl_FragColor = vec4(uC*1.6, a*.55); }`,
    });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(130, 130), m); p.rotation.x = -Math.PI / 2; p.position.set(h.x, .06, h.z + 14); scene.add(p); h.pool = m;
  });

  /* ───────── rain ───────── */
  (function () {
    const N = LOWQ ? 2000 : 5000, pos = new Float32Array(N * 2 * 3), fl = new Float32Array(N * 2), rd = new Float32Array(N * 2 * 2);
    for (let i = 0; i < N; i++) {
      const x = (rnd() - .5) * 260, y = rnd() * 130, z = 60 + rnd() * 160, sp = .8 + rnd() * .7, ln = 1.4 + rnd() * 2.2;
      for (let k = 0; k < 2; k++) { pos.set([x, y, z], (i * 2 + k) * 3); fl[i * 2 + k] = k; rd[(i * 2 + k) * 2] = sp; rd[(i * 2 + k) * 2 + 1] = ln; }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aF', new THREE.BufferAttribute(fl, 1)); g.setAttribute('aR', new THREE.BufferAttribute(rd, 2));
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: U.uTime, uCam: { value: new THREE.Vector3() } },
      vertexShader: `attribute float aF; attribute vec2 aR; uniform float uT; uniform vec3 uCam; varying float vA;
        void main(){ vec3 p = position; float h = 130.; p.y = mod(p.y - uT*95.*aR.x, h); p.x += (p.y)*.07; p.x = uCam.x + mod(p.x - uCam.x + 130., 260.) - 130.;
          p += aF * vec3(.1, 1., 0.) * aR.y; vA = .15 * (1.-aF*.7); gl_Position = projectionMatrix*viewMatrix*vec4(p,1.); }`,
      fragmentShader: `varying float vA; void main(){ gl_FragColor = vec4(.7,.8,1.2, vA); }`,
    });
    const rain = new THREE.LineSegments(g, m); rain.frustumCulled = false; scene.add(rain); U.rain = m;
  })();

  /* ───────── post ───────── */
  const size = new THREE.Vector2();
  const rt = () => new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: LOWQ ? 0 : 4 });
  const composer = new EffectComposer(renderer, rt());
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(512, 512), .55, .55, .92);
  composer.addPass(bloom);
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uT: U.uTime, uRes: { value: new THREE.Vector2(1, 1) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform sampler2D tDiffuse; uniform float uT; varying vec2 vUv;
      float h21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
      void main(){
        vec2 c = vUv - .5; float r2 = dot(c,c);
        vec2 off = c * r2 * .014;
        vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
        col *= 1. - smoothstep(.12,.62, r2) * .55;
        float gr = h21(vUv*vec2(1920.,1080.) + fract(uT)*40.) - .5; col *= 1. + gr * .1; col += gr * .0025;
        gl_FragColor = vec4(col, 1.);
      }`,
  });
  composer.addPass(grade);
  composer.addPass(new OutputPass());

  /* ───────── DOM signs ───────── */
  const signs = {}; stage.querySelectorAll('.s3-sign').forEach(e => { signs[e.dataset.k] = e; });
  let hov = null, hovMix = 0;
  const setHov = k => { hov = k; HERO.forEach(h => signs[h.k] && signs[h.k].classList.toggle('on', h.k === k)); };
  stage.querySelectorAll('.s3-sign').forEach(e => { ['mouseenter', 'focus'].forEach(ev => e.addEventListener(ev, () => setHov(e.dataset.k))); ['mouseleave', 'blur'].forEach(ev => e.addEventListener(ev, () => setHov(null))); });

  /* pointer: parallax + raycast hover */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let px = 0, py = 0, sx = 0, sy = 0, rayDirty = false, lastRay = 0;
  stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); px = ((e.clientX - r.left) / r.width) * 2 - 1; py = ((e.clientY - r.top) / r.height) * 2 - 1; ndc.set(px, -py); rayDirty = true; if (reduced) once(); });
  stage.addEventListener('pointerleave', () => { px = py = 0; if (!hovFromSign()) setHov(null); });
  const hovFromSign = () => !!stage.querySelector('.s3-sign:hover, .s3-sign:focus');
  function pick() {
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(HERO.flatMap(h => h.hit), false);
    const k = hits.length ? hits[0].object.userData.hero : null;
    if (k !== hov && !hovFromSign()) setHov(k);
    stage.style.cursor = (k || hovFromSign()) ? 'pointer' : '';
  }
  stage.addEventListener('click', e => { if (hov && !e.target.closest('.s3-sign')) { const a = signs[hov]; if (a) a.click(); } });

  /* ───────── hologram + phone canvases ───────── */
  function drawHolo(t) {
    const hl = heroBy.journal.holo, { cx, cv } = hl; cx.clearRect(0, 0, cv.width, cv.height);
    const c = '#67e8f9'; cx.strokeStyle = c; cx.shadowColor = c; cx.shadowBlur = 14; cx.lineWidth = 1.5; cx.globalAlpha = .5;
    cx.strokeRect(6, 6, cv.width - 12, cv.height - 12);
    for (let i = 1; i < 4; i++) { cx.beginPath(); cx.moveTo(14, 14 + i * 56); cx.lineTo(cv.width - 14, 14 + i * 56); cx.globalAlpha = .12; cx.stroke(); }
    cx.globalAlpha = 1;
    const n = hl.pts.length, prog = Math.min(1, (t % 9) / 5);
    // candles
    for (let i = 0; i < n * prog; i++) {
      const x = 24 + i * ((cv.width - 48) / n), v = hl.pts[i], o = hl.pts[Math.max(0, i - 1)], y = cv.height - 28 - v * (cv.height - 70), yo = cv.height - 28 - o * (cv.height - 70);
      const up = v >= o; cx.fillStyle = up ? '#4ade80' : '#fb4d6d'; cx.shadowColor = cx.fillStyle; cx.shadowBlur = 8;
      cx.fillRect(x - 3, Math.min(y, yo), 6, Math.max(3, Math.abs(y - yo) + 4)); cx.fillRect(x - .5, Math.min(y, yo) - 8, 1.2, Math.abs(y - yo) + 18);
    }
    // equity line
    cx.shadowColor = c; cx.shadowBlur = 18; cx.strokeStyle = '#a5f3fc'; cx.lineWidth = 3; cx.beginPath();
    let acc = .5; for (let i = 0; i < n * prog; i++) { const x = 24 + i * ((cv.width - 48) / n); acc += (hl.pts[i] - .5) * .02 + .006; const y = cv.height - 28 - (acc * .9 + .06) * (cv.height - 70); i ? cx.lineTo(x, y) : cx.moveTo(x, y); }
    cx.stroke();
    cx.shadowBlur = 0; cx.fillStyle = '#a5f3fc'; cx.font = '600 20px "DM Mono", monospace'; cx.fillText('EQUITY  +' + (12 + prog * 31).toFixed(1) + '%', 20, 30);
    hl.tex.needsUpdate = true;
  }
  const CARDS = [['#fde68a', 'Placeholder'], ['#facc15', 'Daily summary'], ['#fbbf24', 'Quick capture'], ['#fcd34d', 'Sync'], ['#fde047', 'Settings'], ['#f59e0b', 'Reminders']];
  function drawPhone(t) {
    const p = heroBy.cubamii.phone, c = p.cx, w = p.cv.width, hh = p.cv.height;
    const g = c.createLinearGradient(0, 0, 0, hh); g.addColorStop(0, '#4a3606'); g.addColorStop(1, '#1d1503'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#facc15'; c.font = '700 26px "DM Sans", sans-serif'; c.fillText('Cubamii', 22, 58);
    c.fillStyle = 'rgba(250,204,21,.5)'; c.font = '500 13px "DM Mono", monospace'; c.fillText(new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase(), 22, 78);
    const off = (t * 22) % 96;
    c.save(); c.beginPath(); c.rect(0, 92, w, hh - 92); c.clip();
    for (let i = -1; i < 7; i++) {
      const y = 100 + i * 96 - off, card = CARDS[((i + Math.floor(t * 22 / 96) + 12) % CARDS.length)];
      c.fillStyle = 'rgba(250,204,21,.17)'; c.beginPath(); c.roundRect(16, y, w - 32, 82, 16); c.fill();
      c.strokeStyle = 'rgba(250,204,21,.35)'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = card[0]; c.beginPath(); c.arc(46, y + 41, 16, 0, 6.283); c.fill();
      c.fillStyle = '#fff7d6'; c.font = '700 19px "DM Sans", sans-serif'; c.fillText(card[1], 76, y + 38);
      c.fillStyle = 'rgba(250,204,21,.45)'; c.fillRect(76, y + 52, 90 + ((i * 37) % 60 + 60) % 60, 7);
    }
    c.restore();
    c.fillStyle = 'rgba(250,204,21,.95)'; c.beginPath(); c.arc(w / 2, hh - 36, 22, 0, 6.283); c.fill(); c.fillStyle = '#1a1405'; c.fillRect(w / 2 - 9, hh - 38, 18, 4); c.fillRect(w / 2 - 2, hh - 45, 4, 18);
    p.tex.needsUpdate = true;
  }

  /* ───────── camera, sizing, loop ───────── */
  const BASE = new THREE.Vector3(14, 13, 196), LOOK = new THREE.Vector3(14, 48, -30);
  let zMul = 1; const tmp = new THREE.Vector3(), look = new THREE.Vector3(), v3 = new THREE.Vector3();
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return;
    renderer.setPixelRatio(pr); renderer.setSize(w, h, false); composer.setPixelRatio(pr); composer.setSize(w, h);
    camera.aspect = w / h; camera.fov = w / h < 1 ? 50 : 36; zMul = w / h < 1 ? 1.75 : 1; camera.updateProjectionMatrix();
    street.getRenderTarget().setSize(rw(), rh());
    bloom.resolution.set(w * pr * .5, h * pr * .5);
  }
  new ResizeObserver(() => { resize(); if (reduced) once(); }).observe(stage);

  const ease = t => 1 - Math.pow(1 - t, 3);
  let t0 = performance.now(), last = t0, tSec = +(q.get('t') || 0), vis = true, raf = 0, firstDone = false, frames = 0, acc = 0;
  function update(dt) {
    tSec += dt; U.uTime.value = tSec;
    const intro = reduced ? 1 : ease(Math.min(1, tSec / 3.2));
    hovMix += ((hov ? 1 : 0) - hovMix) * Math.min(1, dt * 3.5);
    sx += (px - sx) * Math.min(1, dt * 2.2); sy += (py - sy) * Math.min(1, dt * 2.2);
    // camera
    tmp.copy(BASE); tmp.z = BASE.z * zMul + (1 - intro) * 70; tmp.y += -(1 - intro) * 12;
    tmp.x += sx * 14 + (reduced ? 0 : Math.sin(tSec * .11) * 6); tmp.y += -sy * 3 + (reduced ? 0 : Math.sin(tSec * .17) * 1.2);
    look.copy(LOOK); look.x += sx * 6; look.y += -sy * 2;
    if (hov) { const h = heroBy[hov]; tmp.x += (h.x * .3 - tmp.x) * .16 * hovMix; tmp.z += -16 * hovMix; look.lerp(v3.set(h.x, h.top * .75, h.z), .22 * hovMix); }
    else if (hovMix > .001) { /* easing out handled by hovMix */ }
    camera.position.copy(tmp); camera.lookAt(look);
    if (U.rain) U.rain.uniforms.uCam.value.copy(camera.position);
    // hero state
    HERO.forEach(h => {
      const tg = h.k === hov ? 1 : 0; h.glow += (tg - h.glow) * Math.min(1, dt * 5);
      h.mats.forEach(m => { m.uniforms.uGlow.value = h.glow; }); if (h.pool) h.pool.uniforms.uG.value = h.glow;
      h.edgeMats.forEach(([m, k]) => { m.color.copy(new THREE.Color(ACC[h.k][0])).multiplyScalar(k * (1 + h.glow * .5)); });
    });
    const j = heroBy.andromeda; j.rings.forEach((r, i) => { r.rg.rotation.y = tSec * r.sp; r.rg.rotation.x = .38 * Math.sin(tSec * .3 + r.ph); r.rg.rotation.z = .3 * Math.cos(tSec * .22 + r.ph); r.sat.position.set(Math.cos(tSec * 1.4 * (i % 2 ? -1 : 1) + r.ph) * r.r, 0, Math.sin(tSec * 1.4 * (i % 2 ? -1 : 1) + r.ph) * r.r); });
    j.sweep.rotation.y = tSec * .45;
    const td = heroBy.tidii; td.scanMat.uniforms.uScanY.value = (Math.sin(tSec * .55) * .5 + .5) * 58; td.scanMat.uniforms.uScanOn.value = .55 + td.glow * .45;
    // canvases (throttled)
    if (frames % 3 === 0) { drawHolo(tSec); drawPhone(tSec); }
    if (frames % 4 === 0) drawBoards(tSec);
    moveCars(dt, tSec);
    sky.position.copy(camera.position);
    if (rayDirty && tSec - lastRay > .05) { rayDirty = false; lastRay = tSec; pick(); }
    // DOM signs
    HERO.forEach(h => { const el = signs[h.k]; if (!el) return; v3.set(h.x, h.top + 9, h.z).project(camera); const w = stage.clientWidth, hh = stage.clientHeight; el.style.transform = `translate3d(${((v3.x * .5 + .5) * w).toFixed(1)}px,${((-v3.y * .5 + .5) * hh).toFixed(1)}px,0)`; });
    bloom.strength = .55 + hovMix * .05;
  }
  function frame(now) {
    raf = 0; if (!(vis && !document.hidden)) { last = 0; return; }
    const dt = Math.min((now - last) / 1000 || 0, .06); last = now;
    update(dt); composer.render(dt); frames++;
    if (!firstDone) { firstDone = true; stage.classList.add('ready'); const ld = stage.querySelector('.s3-load'); if (ld) ld.remove(); }
    // adaptive quality: if the average frame is slow, drop the pixel ratio
    acc += dt; if (frames % 90 === 0) { const avg = acc / 90; acc = 0; if (avg > .034 && pr > .75) { pr = Math.max(.75, pr - .25); resize(); } }
    raf = requestAnimationFrame(frame);
  }
  function once() { update(0); composer.render(.016); stage.classList.add('ready'); const ld = stage.querySelector('.s3-load'); if (ld) ld.remove(); }
  function start() { if (!reduced && !raf && vis && !document.hidden) raf = requestAnimationFrame(frame); }
  const wait = (document.fonts && document.fonts.ready) || Promise.resolve();
  resize();
  wait.then(() => {
    if (reduced) { tSec = 4; once(); } else start();
  });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) { last = 0; start(); } }).observe(stage);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { last = 0; start(); } });
  window.__s3 = { renderer, scene, camera, once };
})();
