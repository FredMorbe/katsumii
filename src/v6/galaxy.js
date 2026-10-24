/* The Katsumii galaxy — a face-on spiral drawn on a 2D canvas, tilted into a chart.
   Ported 1:1 from docs/mockups/concept-e-galaxy.html; only the wiring around it
   (elements handed in, cleanup) differs. The model below is deliberately plain ES5-style
   code: it is a hot loop and a seeded generator, keep it as it is.

   Arms are trailing log spirals that turn rigidly at the pattern speed; disk light and dust
   lanes are baked once into textures, stars are dots on top. The star systems (product
   links) are DOM elements that ride the same projection and the same pattern speed, so they
   turn with the arms. Opening a product flies the camera
   into its system first (zoomTo), then hands over to `open(key)`. */

export function createGalaxy({ panel, canvas, systems, readout, open }) {
  var cv = canvas, ctx = cv.getContext("2d");
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(devicePixelRatio || 1, 1.5), W = 0, H = 0, cx = 0, cy = 0, R = 0, S0 = .54;
  /* a portrait panel gets a rounder (less tilted) disk so the galaxy fills it instead of lying flat */
  function size() { var r = panel.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx = W * (W < 900 ? .5 : .58); cy = H * (W < 900 ? .62 : .52); R = Math.min(W * (W < 900 ? .5 : .39), H * (W < 900 ? .5 : .84)); S0 = W < 900 ? .74 : .54 }
  size();
  var onResize = function () { size(); draw(); place() };
  addEventListener("resize", onResize);

  /* ── galaxy model, face-on units (r≈1 = disk edge). Arms are trailing log spirals that turn
        rigidly at the pattern speed; disk light + dust lanes are baked once into textures and
        drawn with the same affine projection, stars are dots on top. ── */
  var seed=11;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647}
  function nrm(){return Math.sqrt(-2*Math.log(rnd()||1e-9))*Math.cos(6.283*rnd())}   /* normal, σ=1 */
  var WP=.021;function w(){return WP}            /* rad/s — one turn in ~5 min */
  function sig(r){return .035+.06*r}             /* arm half-width, grows outward */
  function path(t0,rs,re,k,amp,wm){return{rs:rs,re:re,amp:amp,wm:wm,th:function(r){return t0-k*Math.log(r/rs)}}}
  var MAIN=[path(0,.1,1.05,3.1,1,1),path(Math.PI,.1,1.05,3.1,1,1)],PATHS=MAIN.slice();
  MAIN.forEach(function(m){PATHS.push(path(m.th(.34),.34,.97,4.4,.5,.8))});              /* branches, wind tighter */
  for(var i=0;i<12;i++){var m=MAIN[i%2],rs=.25+rnd()*.5;PATHS.push(path(m.th(rs),rs,rs*(1.22+rnd()*.25),1.2+rnd()*.8,.28,.5))}   /* spurs */
  function onPath(p){   /* random point on a path: denser inside, soft ends → [r, th, σ] */
    for(;;){var u=rnd(),r=p.rs+(p.re-p.rs)*u;if(rnd()<Math.min(1,u*10,(1-u)*3)*Math.exp(-(r-p.rs)*1.1))return[r,p.th(r),sig(r)*p.wm]}
  }

  /* baked textures: soft sprites stamped in face-on space */
  var EXT=1.3,TS=1024;
  function cnv(n){var c=document.createElement('canvas');c.width=c.height=n;return c}
  function sprite(rgb){var c=cnv(64),x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);
    [[0,1],[.2,.72],[.45,.28],[.7,.06],[1,0]].forEach(function(s){g.addColorStop(s[0],'rgba('+rgb+','+s[1]+')')});
    x.fillStyle=g;x.fillRect(0,0,64,64);return c}
  var SP={warm:sprite('255,214,170'),white:sprite('214,228,255'),blue:sprite('140,185,255'),teal:sprite('120,226,250'),pink:sprite('255,118,178'),dark:sprite('0,0,0')};
  function bake(fn){var c=cnv(TS),x=c.getContext('2d');x.translate(TS/2,TS/2);x.scale(TS/2/EXT,TS/2/EXT);fn(x);return c}
  function dab(x,img,r,th,sz,al){x.globalAlpha=al;x.drawImage(img,r*Math.cos(th)-sz,r*Math.sin(th)-sz,sz*2,sz*2)}
  var glow=bake(function(x){
    x.globalCompositeOperation='lighter';
    var g=x.createRadialGradient(0,0,0,0,0,1.15);   /* exponential disk */
    [[0,'255,222,184',.3],[.1,'246,224,206',.15],[.28,'178,202,255',.075],[.55,'140,180,255',.035],[.8,'120,160,255',.012],[1,'120,160,255',0]].forEach(function(s){g.addColorStop(s[0],'rgba('+s[1]+','+s[2]+')')});
    x.fillStyle=g;x.beginPath();x.arc(0,0,1.15,0,6.283);x.fill();
    PATHS.forEach(function(p){
      for(var n=0;n<1400*p.amp;n++){var q=onPath(p),s=q[2];dab(x,q[0]<.26?SP.warm:rnd()<.35?SP.teal:SP.blue,q[0]+nrm()*s*.5,q[1],s*2.2,.007*p.amp)}   /* faint arm light */
      for(n=0;n<220*p.amp;n++){q=onPath(p);s=q[2];var r0=q[0]+nrm()*s*.6,t0=q[1];   /* star clouds */
        for(var c=0;c<4;c++)dab(x,q[0]<.26?SP.warm:SP.white,r0+nrm()*s*.2,t0+nrm()*s*.2/r0,s*(.12+rnd()*.2),.03+rnd()*.05)}
    });
    for(var n=0;n<110;n++){var q=onPath(PATHS[n%4]);if(q[0]<.22)continue;   /* HII regions on the arms' outer edge */
      var r0=q[0]+q[2]*(.3+rnd()*.7),t0=q[1];
      for(var c=0;c<1+rnd()*3;c++)dab(x,SP.pink,r0+nrm()*.008,t0+nrm()*.008/r0,.008+rnd()*.014,.35+rnd()*.3);
      dab(x,SP.white,r0,t0,.005,.6)}
  });
  var dust=bake(function(x){
    PATHS.forEach(function(p){if(p.amp<.4)return;   /* lanes hug the arms' inner (concave) edge */
      var ph=rnd()*9;
      for(var n=0;n<2600*p.amp;n++){var q=onPath(p),r=q[0],s=q[2],u=(r-p.rs)/(p.re-p.rs);if(r<.13)continue;
        var e=.6+.4*Math.sin(u*17+ph)*Math.sin(u*41+ph*2);   /* patchy, but continuous */
        dab(x,SP.dark,r-s*1.05+nrm()*s*.18,q[1],s*(.35+rnd()*.3),(.05+rnd()*.06)*e)}
      for(n=0;n<900*p.amp;n++){q=onPath(p);r=q[0];s=q[2];u=(r-p.rs)/(p.re-p.rs);if(r<.13)continue;   /* fine streaks inside the arm */
        if(Math.sin(u*53+ph*3)<.2)continue;
        dab(x,SP.dark,r+nrm()*s*.6,q[1],s*(.1+rnd()*.12),.05+rnd()*.05)}
    });
    for(var n=0;n<70;n++){var r0=.18+rnd()*.75,t0=rnd()*6.283,len=.06+rnd()*.18;   /* thin inter-arm filaments */
      for(var j=0;j<30;j++){var r=r0*(1+len*j/30);dab(x,SP.dark,r,t0-3.1*Math.log(r/r0),.006+rnd()*.008,.05+rnd()*.05)}}
  });

  /* stars: [r, th, height above the plane, size, own angular speed] in colour × alpha buckets */
  var COL=['255,222,178','214,228,255','140,190,255','118,226,250','255,140,190'],AL=[.16,.4,.8],NB=COL.length*AL.length;
  var B=[];for(i=0;i<NB;i++)B.push({r:[],t:[],h:[],s:[],o:[]});
  function star(r,th,h,c,a,s,o){var b=B[c*AL.length+a];b.r.push(r);b.t.push(th);b.h.push(h);b.s.push(s);b.o.push(o)}
  function lum(){return rnd()<.2?2:rnd()<.55?1:0}
  var Q=reduced?.5:1;
  for(i=0;i<3200*Q;i++){var d=-Math.log(rnd()||1e-9)*.055,z=2*rnd()-1,a=rnd()*6.283;   /* bulge: a spheroid, not a disk */
    star(d*Math.sqrt(1-z*z),a,d*z*.85,0,rnd()<.25?2:rnd()<.6?1:0,rnd()<.04?2:1,WP*1.3)}
  PATHS.forEach(function(p){   /* arm stars, about half of them in tight clusters → knotty arms */
    for(var n=0,N=4600*p.amp*(p.re-p.rs)/.95*Q;n<N;){var q=onPath(p),r0=q[0]+nrm()*q[2]*.5,t0=q[1]+nrm()*.03,k=rnd()<.04?(10+rnd()*20)|0:1,cs=q[2]*(.06+rnd()*.1);
      for(var j=0;j<k;j++,n++){var r=k>1?r0+nrm()*cs:r0;if(r<.02)continue;
        star(r,k>1?t0+nrm()*cs/r0:t0,nrm()*.012,q[0]<.28?(rnd()<.6?0:1):r>.25&&rnd()<.03?4:rnd()<.5?1:rnd()<.35?3:2,lum(),rnd()<.05?2:1,WP)}}
  });
  for(i=0;i<4000*Q;i++){var r=Math.min(-Math.log(rnd()||1e-9)*.3,1.2);if(r<.04)continue;   /* disk field */
    star(r,rnd()*6.283,nrm()*.02,r<.3?0:1,rnd()<.15?1:0,1,WP)}   /* the disk turns as one body (WP, like arms and dust), so the star systems stay put in it */
  for(i=0;i<500*Q;i++){var d=.2+Math.abs(nrm())*.55,z=2*rnd()-1;   /* halo, gives the disk depth */
    star(d*Math.sqrt(1-z*z),rnd()*6.283,d*z*.7,1,0,1,WP*.6)}

  var t=0,speed=1,target=1,ptrX=0,ptrY=0,phi=-.3,S=S0,hover=null;
  /* camera: while a system is being opened the view zooms (zz) around a focus point (zf) that
     glides from the panel centre onto the system, so the system ends up in the middle */
  var zoomEl=null,zp=0,zz=1,zf=[0,0],opened=false,ZMAX=3;
  function cam(p){return zoomEl?[W/2+(p[0]-zf[0])*zz,H/2+(p[1]-zf[1])*zz]:p}
  function proj(r,th,h){
    var x=r*Math.cos(th),y=r*Math.sin(th)*S-(h||0)*.86;
    var cp=Math.cos(phi),sp=Math.sin(phi);
    return[cx+(x*cp-y*sp)*R,cy+(x*sp+y*cp)*R];
  }
  function draw(){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    if(zoomEl){ctx.translate(W/2,H/2);ctx.scale(zz,zz);ctx.translate(-zf[0],-zf[1])}
    var cp=Math.cos(phi),sp=Math.sin(phi),rot=WP*t;
    function disk(img){ctx.save();ctx.translate(cx,cy);ctx.rotate(phi);ctx.scale(R,R*S);ctx.rotate(rot);ctx.drawImage(img,-EXT,-EXT,EXT*2,EXT*2);ctx.restore()}
    function blob(rad,ry,stops){ctx.save();ctx.translate(cx,cy);ctx.rotate(phi);ctx.scale(1,ry);var g=ctx.createRadialGradient(0,0,0,0,0,rad);
      stops.forEach(function(s){g.addColorStop(s[0],s[1])});ctx.fillStyle=g;ctx.fillRect(-rad,-rad,rad*2,rad*2);ctx.restore()}
    ctx.globalCompositeOperation='lighter';
    blob(R*1.4,.6,[[0,'rgba(110,150,255,.06)'],[.45,'rgba(80,120,230,.025)'],[1,'rgba(60,90,200,0)']]);   /* stellar halo */
    disk(glow);
    for(var bi=0;bi<NB;bi++){
      var b=B[bi],rr=b.r,tt=b.t,hh=b.h,ss=b.s,oo=b.o;
      ctx.fillStyle='rgba('+COL[(bi/AL.length)|0]+','+AL[bi%AL.length]+')';
      for(var j=0;j<rr.length;j++){
        var r=rr[j],a=tt[j]+oo[j]*t,x=r*Math.cos(a),y=r*Math.sin(a)*S-hh[j]*.86,s=ss[j];
        ctx.fillRect(cx+(x*cp-y*sp)*R-s*.5,cy+(x*sp+y*cp)*R-s*.5,s,s);
      }
    }
    ctx.globalCompositeOperation='destination-out';disk(dust);
    ctx.globalCompositeOperation='lighter';
    var by=.55+.45*S;   /* the bulge is a spheroid → rounder than the tilted disk */
    blob(R*.34,by,[[0,'rgba(255,214,166,.2)'],[.4,'rgba(255,190,140,.06)'],[1,'rgba(255,180,120,0)']]);
    blob(R*.12,by,[[0,'rgba(255,240,214,.5)'],[.5,'rgba(255,220,180,.14)'],[1,'rgba(255,210,170,0)']]);
    blob(R*.025,by,[[0,'rgba(255,255,250,.85)'],[1,'rgba(255,245,230,0)']]);
    ctx.globalCompositeOperation='source-over';
    /* chart frame: range rings + bearing ticks (fixed to the map, not the galaxy) */
    ctx.strokeStyle='rgba(148,163,184,.14)';ctx.lineWidth=1;
    [.33,.66,1].forEach(function(k){ctx.beginPath();ctx.ellipse(cx,cy,R*k*1.04,R*k*1.04*S,phi,0,6.283);ctx.stroke()});
    ctx.fillStyle='rgba(148,163,184,.4)';ctx.font='10px "DM Mono",monospace';ctx.textAlign='center';ctx.textBaseline='middle';
    for(var d=0;d<360;d+=30){var a2=d*Math.PI/180,pp=proj(1.16,a2,0),p1=proj(1.07,a2,0),p2=proj(1.1,a2,0);
      ctx.beginPath();ctx.moveTo(p1[0],p1[1]);ctx.lineTo(p2[0],p2[1]);ctx.stroke();ctx.fillText(d+'°',pp[0],pp[1])}
    ctx.strokeStyle='rgba(148,163,184,.1)';ctx.beginPath();ctx.moveTo(cx-R*1.1,cy);ctx.lineTo(cx+R*1.1,cy);ctx.moveTo(cx,cy-R*.62);ctx.lineTo(cx,cy+R*.62);ctx.stroke();
  }

  /* ── star systems follow the galaxy ── */
  var sys = systems, read = readout, readDef = "";
  function place() {
    var items = sys.map(function (el) {
      var r = +el.dataset.r, th = +el.dataset.th + w(r) * t, p = cam(proj(r, th, 0));
      var ew = el.offsetWidth, lw = Math.max(ew, 140), flip = p[0] + lw > W - 12 && p[0] - lw > 12;
      el.classList.toggle("left", flip);
      el.style.transform = "translate3d(" + p[0].toFixed(1) + "px," + p[1].toFixed(1) + "px,0)" + (flip ? " translateX(-100%)" : "") + " translateY(-50%)";   /* the star, not the label's corner, sits on the point */
      if (el.dataset.k === hover) {
        var ra = ((((th % 6.283) + 6.283) % 6.283) / 6.283 * 24), dec = (1 - r) * 62 - 18;
        read.textContent = el.dataset.cat + " · RA " + (ra | 0) + "h " + (((ra % 1) * 60) | 0) + "m · DEC " + (dec >= 0 ? "+" : "") + dec.toFixed(1) + "°"
      }
      return {
        el: el, lab: el.querySelector(".gx-lab"), y: p[1], h: el.offsetHeight, dy: 0,
        x0: flip ? p[0] - ew : p[0], x1: flip ? p[0] : p[0] + ew,
        /* a label that fits on neither side slides back into the panel */
        ox: !flip && p[0] + ew > W - 8 ? W - 8 - p[0] - ew : 0
      };
    });
    /* labels that would sit on top of each other are pushed apart vertically (the focused one stays put) */
    items.sort(function (a, b) { return a.y - b.y });
    items.forEach(function (a, i) {
      if (a.el.dataset.k === hover) return;
      for (var j = 0; j < i; j++) {
        var b = items[j], gap = (a.h + b.h) / 2 + 2, d = a.y + a.dy - b.y - b.dy;
        if (a.x1 > b.x0 && a.x0 < b.x1 && d < gap) a.dy += gap - d
      }
    });
    items.forEach(function (a) {
      var dy = (a.el._dy || 0) + (a.dy - (a.el._dy || 0)) * (reduced ? 1 : .18);
      a.el._dy = dy;
      a.lab.style.transform = a.ox || dy > .05 ? "translate(" + a.ox.toFixed(1) + "px," + dy.toFixed(1) + "px)" : ""
    });
  }
  function focus(k) {
    if (zoomEl) return;   /* the camera is flying — leave the focus alone */
    hover = k; target = k ? .05 : 1;
    sys.forEach(function (e) { e.classList.toggle("on", e.dataset.k === k) });
    read.classList.toggle("on", !!k);
    if (k) { var e = sys.filter(function (s) { return s.dataset.k === k })[0]; read.style.setProperty("--rc", getComputedStyle(e).getPropertyValue("--ac")) }
    else read.textContent = readDef;
    place();   /* the loop is idle under reduced motion — the card still has to find its place */
  }
  var offs = [];
  function listen(el, ev, fn, opt) { el.addEventListener(ev, fn, opt); offs.push(function () { el.removeEventListener(ev, fn, opt) }) }
  sys.forEach(function (el) {
    ["mouseenter", "focus"].forEach(function (ev) { listen(el, ev, function () { focus(el.dataset.k) }) });
    ["mouseleave", "blur"].forEach(function (ev) { listen(el, ev, function () { focus(null) }) });
  });
  /* touch has no hover: the first tap focuses a system and shows its card, the second opens it.
     pointerdown comes before the emulated mouseenter, so it still sees the state from before the tap. */
  var fresh = false;
  sys.forEach(function (el) {
    listen(el, "pointerdown", function (e) { fresh = e.pointerType === "touch" && el.dataset.k !== hover });
    /* capture phase: preventDefault here keeps the router link from navigating */
    listen(el, "click", function (e) {
      var tapOnly = fresh; fresh = false;
      if (tapOnly) { e.preventDefault(); return }
      if (!el.dataset.zoom || reduced || !open || zoomEl || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault(); zoomTo(el)
    }, true);
  });
  function zoomTo(el) {
    zoomEl = el; zp = 0; opened = false; zz = 1; zf = [W / 2, H / 2];
    panel.classList.add("zooming"); kick()
  }
  function stepZoom(dt) {
    zp = Math.min(zp + dt / .9, 1);
    var e = zp < .5 ? 4 * zp * zp * zp : 1 - Math.pow(-2 * zp + 2, 3) / 2;   /* ease in-out */
    var r = +zoomEl.dataset.r, p = proj(r, +zoomEl.dataset.th + w(r) * t, 0);
    zf = [W / 2 + (p[0] - W / 2) * e, H / 2 + (p[1] - H / 2) * e]; zz = 1 + (ZMAX - 1) * e;
    if (zp >= 1 && !opened) { opened = true; Promise.resolve(open(zoomEl.dataset.k)).finally(unzoom) }
  }
  /* only reached when the navigation did not take this page away */
  function unzoom() {
    if (disposed) return;
    zoomEl = null; zz = 1; panel.classList.remove("zooming"); focus(null)
  }
  listen(panel, "pointerdown", function (e) { if (e.pointerType === "touch" && hover && !e.target.closest(".gx-sys")) focus(null) });
  listen(panel, "pointermove", function (e) { var r = panel.getBoundingClientRect(); ptrX = (e.clientX - r.left) / r.width * 2 - 1; ptrY = (e.clientY - r.top) / r.height * 2 - 1 });

  /* ── loop (paused offscreen / hidden tab / reduced motion) ── */
  var last = 0, run = true, vis = true, raf = 0, io = null, disposed = false;
  function frame(now) {
    raf = 0;
    if (disposed || !(run && vis)) { last = 0; return }
    var dt = last ? Math.min((now - last) / 1000, .1) : 0; last = now;
    speed += (target - speed) * Math.min(dt * 4, 1); t += dt * speed;
    S += ((S0 + ptrY * .05) - S) * .05; phi += ((-.3 + ptrX * .05) - phi) * .05;
    if (zoomEl) stepZoom(dt);
    draw(); place(); raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && !disposed) raf = requestAnimationFrame(frame) }
  draw(); place(); panel.classList.add("ready");
  if (!reduced) {
    io = new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis && run) kick() });
    io.observe(panel);
    var onVis = function () { run = !document.hidden; if (run) kick() };
    document.addEventListener("visibilitychange", onVis);
    offs.push(function () { document.removeEventListener("visibilitychange", onVis) });
    kick();
  }

  return {
    /* the idle readout line — set from the locale; a hovered system overrides it */
    setReadout: function (text) { readDef = text; if (hover === null) read.textContent = text },
    dispose: function () {
      disposed = true; if (raf) cancelAnimationFrame(raf);
      if (io) io.disconnect();
      removeEventListener("resize", onResize);
      offs.forEach(function (off) { off() });
    },
  };
}
