/*! leadle-hero-space v1.1.0 | the 3D point-space hero for leadlehq.com | built from leadle-hero-space-v2.html */
(function () {
  var PAGES = [
    [/^\/solutions\/(outbound-os|revops-as-a-service|founder-on-call)\/?$/, ".section_solutions-hero", ".solutions-hero-wrapper"],
    [/^\/(partnerships|clients)\/?$/, ".hero-section-partners", ".heading-div"],
    [/^\/blog\/?$/, ".hero-section-blog", ".heading-div"],
    [/^\/ai-agents\/?$/, ".hero-section-aiagents", ".heading-div"]
  ];
  var HERO_SEL = null, WRAP_SEL = null;
  for (var k = 0; k < PAGES.length; k++) if (PAGES[k][0].test(location.pathname)) { HERO_SEL = PAGES[k][1]; WRAP_SEL = PAGES[k][2]; break; }
  if (!HERO_SEL) return;
  var FALLBACK = "https://revops-leadle.github.io/leadle-hero-space/hero-fallback.v1.webp";
  var style = document.createElement("style"); style.id = "lh-hero-style";
  style.textContent = '%H%{position:relative;isolation:isolate;overflow:hidden;background-image:none!important;background-color:#0b0b0c!important}\n%H% .glass-bg{display:none!important}\n%H%>.padding-global{position:relative;z-index:1}\n%H% #lh-fx,%H% .fallback{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;object-fit:cover;pointer-events:none}\n%H% .fallback{display:none}\n%H%.static .fallback{display:block}\n%H%.static #lh-fx{display:none}\n%H%.static::before{content:"";position:absolute;left:50%;top:52%;width:1100px;height:520px;transform:translate(-50%,-50%);z-index:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.62) 45%,rgba(0,0,0,0) 72%)}\n%H% .text-color-black,%H% .heading-style-h1,%H% .body-text,%H% .body{color:#f3f5f7!important}\n%H% .big-pill{color:#fff!important;background:rgba(249,115,22,.18)!important}\n%H% .primary-button{background:#f3f5f7!important;color:#2c2f34!important;border-color:#f3f5f7!important}\n%H% .button-secondary{color:#f3f5f7!important;border-color:rgba(243,245,247,.85)!important}'.replace(/%H%/g, HERO_SEL);
  (document.head || document.documentElement).appendChild(style);   // before first paint: the old hero images are never requested
  function run() {
  // ============================== TUNING ==============================
  const CFG = {
    camera: {
      pos: [0.9, 0, 0],              // hall x spans -9 (far left wall) .. 4.5 (right wall); floor -1.5, ceiling +1.5 (camera mid-height)
      shift: [0.16, 0.16],           // lens shift (NDC): puts the vanishing point at (0.58, 0.42) of the frame
      fovY: 48,                      // degrees; horizontal ~75 deg at 16:9
      follow: [1.7, 0.8],            // world units of camera travel per full pointer swing (scene follows the pointer)
      followYaw: 6.0, followPitch: 2.6,  // degrees
      ease: 5.0,                     // 1/s; higher settles faster (~0.6 s to settle)
      sway: [0.22, 0.07, 0.6],       // autonomous drift: x amp, y amp, yaw amp (deg)
    },
    scene: { farZ: 46, doorZ: -10, doorX: 0, doorW: 1.2, doorH: 1.0, columnLum: 0.5 },
    render: {
      streak: 0.30,                  // base streak length, fraction of the distance to the focal point
      streakNoise: 1.0,              // how much noise varies the streak length (per fibre)
      taps: 30,
      streak2: 0.05,                 // second, short streak pass that softens the fibres
      massGain: 1.35, grainGain: 0.7, speckle: 0.75,
      exposure: 0.82, gamma: 1.0,
      scrim: 0.72, scrimFeather: 120,   // darkening behind the headline/copy block (readability), feather in CSS px
      flow: 0.045,                   // particle drift amplitude (world units), independent of the camera
      speedStreak: true,             // fast pointer sweeps briefly stretch the fibres
      speedGain: 0.9,                // stretch per hero-width-per-second of pointer speed
      speedMax: 0.8,                 // cap: streak length can grow by at most this fraction
      speedDecay: 3.5,               // 1/s; how fast the stretch fades once the pointer slows
      scrollWarp: true,              // scrolling glides the camera forward and stretches the fibres with scroll speed
      scrollGain: 0.0016,            // stretch per px/s of scroll speed
      scrollTravel: 0.012,           // world units of forward travel per px scrolled
      scrollTravelMax: 7,            // never glide past this (keeps the doorway ahead)
      palette: 1,
      warm: { dark: [.04,.035,.035], mid: [.48,.21,.08], hi: [.96,.60,.30], top: [1,.86,.70] },   // orange map, 'charcoal + ember' (chosen 2 Nov 2026)
    },
  };
  // ====================================================================

  const hero = document.querySelector(HERO_SEL), canvas = document.getElementById("lh-fx");
  let calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false });
  if (!gl) { hero.classList.add("static"); return; }
  const hasFloat = !!gl.getExtension("EXT_color_buffer_float");
  const mobile = Math.min(innerWidth, innerHeight) < 700;

  // ---------- deterministic noise ----------
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(1248), R = (a, b) => a + (b - a) * rnd(), G = () => (rnd() + rnd() + rnd() - 1.5) * 1.1;

  // ---------- point cloud: [x, y, z, size, lum, seed] ----------
  const mass = [], grain = [], speck = [];
  const push = (arr, x, y, z, s, l) => arr.push(x, y, z, s, l, rnd());
  const k = mobile ? 0.55 : 1;
  // a cluster = elongated gaussian blob of soft sprites (mass) + a sprinkling of sharp grain + some dark speckles
  function cluster(c, sp, n, lum, lumVar, size, grainFrac = 0.35, speckFrac = 0.25) {
    n = Math.round(n * k);
    for (let i = 0; i < n; i++) {
      const x = c[0] + G() * sp[0], y = c[1] + G() * sp[1], z = c[2] + G() * sp[2];
      if (z > -1.2) continue;                                          // nothing right against the lens
      const band = Math.sin((x - c[0]) * 19 + (y - c[1]) * 23 + i * 0.003) * 0.5 + 0.5;   // stripes across the bundle
      const l = Math.max(0.03, (lum + G() * lumVar) * (0.5 + 0.5 * band * band));
      push(mass, x, y, z, size * R(0.6, 1.5), l);
      if (rnd() < grainFrac) push(grain, x + G() * sp[0] * 0.3, y + G() * sp[1] * 0.3, z + G() * sp[2] * 0.3, R(1.0, 2.2), R(0.35, 1.0));
      if (rnd() < speckFrac) push(speck, x, y, z, R(1.2, 2.6), R(0.5, 1.0));
    }
  }
  const FLOOR = -1.5, CEIL = 1.5, RIGHT = 7.0, LEFT = -9, FAR = -CFG.scene.farZ, DOORX = CFG.camera.pos[0] + CFG.scene.doorX;
  // floor: left-biased bundles, elongated along z (these become the long floor streaks lower-left)
  for (let i = 0; i < 30; i++) cluster([R(-6.5, -0.6), FLOOR + R(0, 0.12), -R(4, 14)], [R(0.1, 0.4), 0.04, R(1.5, 6)], 360, R(0.16, 0.45), 0.14, 0.45, 0.3);
  for (let i = 0; i < 10; i++) cluster([R(-5, -0.6), FLOOR + R(0, 0.12), -R(14, 30)], [R(0.2, 0.6), 0.04, R(3, 8)], 260, R(0.08, 0.2), 0.08, 0.4, 0.3);   // far floor, dim
  for (let i = 0; i < 14; i++) cluster([R(-2.8, -0.3), FLOOR + R(0, 0.1), -R(2.2, 7)], [R(0.12, 0.4), 0.04, R(1, 3)], 300, R(0.18, 0.45), 0.14, 0.4, 0.3);   // foreground floor, runs off the bottom-left edge
  // floor right of the camera: a few near bright bundles (lower-right masses)
  for (let i = 0; i < 14; i++) cluster([R(1.7, 5.5), FLOOR + R(0, 0.1), -R(2.2, 12)], [R(0.12, 0.4), 0.04, R(1.5, 5)], 340, R(0.18, 0.45), 0.12, 0.4, 0.3);   // floor, lower-right
  for (let i = 0; i < 8; i++) cluster([R(1.4, 3.2), FLOOR + R(0, 0.1), -R(2.4, 4.5)], [R(0.2, 0.5), 0.04, R(0.8, 2)], 300, R(0.22, 0.5), 0.12, 0.4, 0.3);   // foreground floor, bottom-right corner
  for (let i = 0; i < 8; i++) cluster([R(-2.4, -0.6), FLOOR + R(0, 0.1), -R(2.4, 4.5)], [R(0.2, 0.5), 0.04, R(0.8, 2)], 300, R(0.22, 0.5), 0.12, 0.4, 0.3);   // foreground floor, bottom-left corner
  // ceiling: big soft masses upper-left, close to the camera
  for (let i = 0; i < 20; i++) cluster([R(-5.5, -0.2), CEIL + R(-0.3, 0.3), -R(4, 11)], [R(0.2, 0.7), R(0.1, 0.3), R(1.5, 4)], 380, R(0.18, 0.55), 0.16, 0.3, 0.35);
  for (let i = 0; i < 8; i++) cluster([R(-5, 0.5), CEIL + R(-0.3, 0.3), -R(11, 24)], [R(0.3, 0.8), 0.2, R(2, 6)], 260, R(0.08, 0.2), 0.08, 0.3, 0.3);   // far ceiling, dim
  for (let i = 0; i < 12; i++) cluster([R(-3.2, 0.6), CEIL + R(-0.3, 0.2), -R(3.4, 8)], [R(0.25, 0.7), R(0.1, 0.3), R(1, 2.5)], 280, R(0.2, 0.48), 0.14, 0.3, 0.35);   // foreground ceiling, runs off the top edge   // foreground ceiling, runs off the top edge
  for (let i = 0; i < 9; i++) cluster([R(0.5, 4.3), CEIL + R(-0.2, 0.2), -R(5, 20)], [R(0.4, 0.9), 0.2, R(1, 3)], 300, R(0.1, 0.26), 0.05, 0.3, 0.3);
  // right wall: close, mostly dark, faint texture; a brighter far band at mid height (the band on the right edge)
  for (let i = 0; i < 10; i++) cluster([RIGHT + R(-0.05, 0.05), R(-1.4, 1.4), -R(1.5, 16)], [0.05, R(0.3, 0.8), R(1, 4)], 260, R(0.05, 0.14), 0.05, 0.2, 0.2);
  for (let i = 0; i < 8; i++) cluster([RIGHT, R(-0.9, 0.2), -R(10, 18)], [0.05, R(0.15, 0.45), R(2, 5)], 360, R(0.2, 0.42), 0.1, 0.3, 0.3);
  for (let i = 0; i < 6; i++) cluster([RIGHT + R(-0.1, 0.1), R(0.1, 1.4), -R(7, 20)], [0.05, R(0.3, 0.6), R(2, 5)], 220, R(0.1, 0.2), 0.06, 0.3, 0.2);   // right wall, upper, faint
  // left wall: far, faint
  for (let i = 0; i < 7; i++) cluster([LEFT + R(-0.1, 0.1), R(-1.4, 1.4), -R(3, 42)], [0.05, R(0.6, 1.2), R(2, 7)], 260, R(0.12, 0.3), 0.06, 0.3, 0.2);
  // far end: faint glow around the vanishing region, denser toward the doorway
  for (let i = 0; i < 12; i++) cluster([0.9 + G() * 2.2, R(-1.4, 1.4), FAR + R(-3, 3)], [1.5, 1.0, 2], 300, R(0.12, 0.3), 0.08, 0.4, 0.25);
  // the light column through the doorway: soft + grainy, floor to ceiling
  { const n = Math.round(1400 * k), x0 = CFG.camera.pos[0], z0 = CFG.scene.doorZ;
    for (let i = 0; i < n * 2; i++) { const y = R(FLOOR, CEIL + 2.6), x = DOORX + G() * (0.18 + 0.06 * (y - FLOOR)), z = z0 + G() * 0.8;
      const tap = 0.35 + 0.65 * (1 - (y - FLOOR) / (CEIL + 2.6 - FLOOR));
      push(mass, x, y, z, R(0.06, 0.22), CFG.scene.columnLum * R(0.3, 1.1) * tap); if (rnd() < 0.25) push(grain, x + G() * 0.08, y, z, R(1, 1.6), R(0.2, 0.7) * tap); } }
  // the doorway outline: dense sharp dust along a rectangle standing on the floor
  { const x0 = DOORX - CFG.scene.doorW / 2, w = CFG.scene.doorW, h = CFG.scene.doorH, z0 = CFG.scene.doorZ, n = Math.round(1100 * k);
    for (let i = 0; i < n; i++) { const t = rnd() * 3, j = () => G() * 0.012;
      const [x, y] = t < 1 ? [x0 + w * t, FLOOR + h] : t < 2 ? [x0, FLOOR + h * (t - 1)] : [x0 + w, FLOOR + h * (t - 2)];
      push(grain, x + j(), y + j(), z0 + j(), R(1.2, 2.0), R(0.4, 0.85)); } }
  // free dust in the air everywhere, denser low-left
  { const n = Math.round(9000 * k);
    for (let i = 0; i < n; i++) { const low = rnd() < 0.55; push(grain, R(LEFT, RIGHT) * (low ? 0.75 : 1), low ? R(FLOOR, -0.4) : R(FLOOR, CEIL), -R(1.3, 44), R(0.8, 1.9), Math.pow(rnd(), 1.6)); } }

  const toArr = a => new Float32Array(a);
  const MASS = toArr(mass), GRAIN = toArr(grain), SPECK = toArr(speck);

  // ---------- shaders ----------
  const VS = `#version 300 es
in vec3 aPos; in float aSize; in float aLum; in float aSeed;
uniform mat4 uProj, uView; uniform float uTime, uFlow, uScale, uPx; out float vLum; out float vSize;
void main(){
  vec3 p = aPos + uFlow * vec3(sin(uTime*.37 + aSeed*6.283), .5*cos(uTime*.29 + aSeed*3.1), sin(uTime*.23 + aSeed*9.4));
  vec4 v = uView * vec4(p, 1.);
  float d = -v.z;
  if (d < .35) { gl_Position = vec4(2., 2., 2., 1.); gl_PointSize = 0.; vLum = 0.; vSize = 1.; return; }   // behind / at the camera: cull
  gl_Position = uProj * v;
  gl_PointSize = uPx > 0. ? clamp(aSize * uPx * (.75 + 1.2 / d), 1., 6.) : clamp(aSize * uScale / d, 1., 140.);
  vSize = gl_PointSize;
  vLum = aLum * smoothstep(50., 28., d);                 // far fog
}`;
  const FS_SOFT = `#version 300 es
precision highp float; in float vLum; in float vSize; out vec4 o;
void main(){ vec2 q = gl_PointCoord*2.-1.; float r2 = dot(q,q); if (r2 > 1.) discard;
  float e = min(1., 36. / (vSize * vSize));             // a sprite's total light stays constant as it grows (near = soft and faint)
  float a = exp(-r2*2.6) * (1.-r2) * e; o = vec4(vec3(vLum*a*.5), 1.); }`;
  const FS_SHARP = `#version 300 es
precision highp float; in float vLum; in float vSize; out vec4 o;
void main(){ vec2 q = gl_PointCoord*2.-1.; float r2 = dot(q,q); if (r2 > 1.) discard;
  float a = smoothstep(1., .35, r2); o = vec4(vec3(vLum*a*.9), 1.); }`;
  const FS_SPECK = `#version 300 es
precision highp float; in float vLum; in float vSize; uniform float uK; out vec4 o;
void main(){ vec2 q = gl_PointCoord*2.-1.; float r2 = dot(q,q); if (r2 > 1.) discard;
  o = vec4(0., 0., 0., vLum * uK * smoothstep(1., .4, r2)); }`;
  const VS_Q = `#version 300 es
in vec2 aQ; out vec2 vUv; void main(){ vUv = aQ*.5+.5; gl_Position = vec4(aQ, 0., 1.); }`;
  const FS_BLUR = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT, uN; uniform vec2 uC, uAsp; uniform float uLen, uVar, uTime; out vec4 o;
#define TAPS ${CFG.render.taps}
void main(){
  vec2 d = (uC - vUv) * uAsp; float dist = length(d); vec2 dir = d / max(dist, 1e-4);
  vec2 perp = vec2(-dir.y, dir.x); float across = dot(vUv * uAsp, perp);
  float n = .5 * texture(uN, vUv*2.3 + vec2(uTime*.004, 0.)).r + .5 * texture(uN, vec2(across * 26., dist * 3.) + vec2(0., uTime*.006)).r;
  float len = uLen * dist * (1. - uVar + uVar * 2. * n) * smoothstep(0., .25, dist);
  vec3 acc = vec3(0.); float wsum = 0.;
  float j = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - .5;   // per-pixel jitter hides tap banding
  for (int i = 0; i < TAPS; i++) { float t = (float(i) + j) / float(TAPS - 1); float w = 1. - .75 * clamp(t, 0., 1.);
    acc += texture(uT, vUv + dir * len * t / uAsp).rgb * w; wsum += w; }
  o = vec4(acc / wsum, 1.);
}`;
  const FS_COMP = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uM, uG, uN; uniform float uMg, uGg, uExp, uGam, uPal, uScrim, uFeather; uniform vec4 uSafe; uniform vec2 uRes; uniform vec3 uWd, uWm, uWh, uWt; out vec4 o;
void main(){
  vec2 px = vUv * uRes; vec2 q = max(max(uSafe.xy - px, px - uSafe.zw), 0.);
  float scrim = 1. - uScrim * (1. - smoothstep(0., uFeather, length(q)));   // feathered darkening behind the copy block only
  float m = texture(uM, vUv).r * uMg * scrim, g = texture(uG, vUv).r * uGg * scrim;
  float grainN = texture(uN, vUv * vec2(11., 6.)).r;
  float c = m * (0.82 + 0.36 * grainN) + g + 0.028;       // film-like micro texture on the soft masses; charcoal floor
  c = c / (1. + c * .55) * uExp;                          // soft shoulder
  c = pow(max(c, 0.), 1. / uGam);
  vec3 mono = vec3(c);
  // restrained orange: darks stay charcoal, mids warm up, highlights go orange then cream
  vec3 warm = mix(uWd, uWm, smoothstep(.0,.45,c));
  warm = mix(warm, uWh, smoothstep(.45,.85,c));
  warm = mix(warm, uWt, smoothstep(.85,1.2,c));
  o = vec4(mix(mono, warm, uPal), 1.);
}`;
  function prog(vs, fs, attrs) {
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); }
    return { p, u };
  }
  const PA = ["aPos", "aSize", "aLum", "aSeed"];
  const P_SOFT = prog(VS, FS_SOFT, PA), P_SHARP = prog(VS, FS_SHARP, PA), P_SPECK = prog(VS, FS_SPECK, PA);
  const P_BLUR = prog(VS_Q, FS_BLUR, ["aQ"]), P_COMP = prog(VS_Q, FS_COMP, ["aQ"]);

  function vao(data) {
    const v = gl.createVertexArray(); gl.bindVertexArray(v);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    [[0, 3, 0], [1, 1, 12], [2, 1, 16], [3, 1, 20]].forEach(([l, s, off]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 24, off); });
    return { v, n: data.length / 6 };
  }
  const V_MASS = vao(MASS), V_GRAIN = vao(GRAIN), V_SPECK = vao(SPECK);
  const V_Q = gl.createVertexArray(); gl.bindVertexArray(V_Q);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  // noise texture (value noise, tileable enough)
  const NS = 128, nd = new Uint8Array(NS * NS); { const nr = mulberry32(9); const g = []; for (let i = 0; i < 16 * 16; i++) g.push(nr());
    for (let y = 0; y < NS; y++) for (let x = 0; x < NS; x++) { let v = 0, amp = 0.6, f = 1;
      for (let o = 0; o < 3; o++) { const fx = x / NS * 4 * f, fy = y / NS * 4 * f, xi = Math.floor(fx) % 16, yi = Math.floor(fy) % 16, u = fx % 1, w = fy % 1;
        const h = (a, b) => g[((a % 16) + 16) % 16 + (((b % 16) + 16) % 16) * 16], su = u * u * (3 - 2 * u), sw = w * w * (3 - 2 * w);
        v += amp * ((h(xi, yi) * (1 - su) + h(xi + 1, yi) * su) * (1 - sw) + (h(xi, yi + 1) * (1 - su) + h(xi + 1, yi + 1) * su) * sw); amp *= 0.5; f *= 2; }
      nd[y * NS + x] = Math.round(v * 255); } }
  const T_NOISE = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, T_NOISE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, NS, NS, 0, gl.RED, gl.UNSIGNED_BYTE, nd);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // ---------- framebuffers ----------
  let fb = {};
  function target(w, h, float) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, float ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  }
  let safe = new Float32Array(4);
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75), r = hero.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * dpr)); canvas.height = Math.max(2, Math.round(r.height * dpr));
    const d = canvas.width / r.width, els = ['.big-pill', '.body-text', '.body', '.solution-cta', 'h1'].map(q => hero.querySelector(q)).filter(Boolean).map(e => e.getBoundingClientRect());
    if (!els.length) els.push(hero.getBoundingClientRect());
    const narrow = els.filter(e => e.width < r.width * 0.75); const xs = narrow.length ? narrow : els;
    const x0 = Math.min(...xs.map(e => e.left)) - r.left - 24, x1 = Math.max(...xs.map(e => e.right)) - r.left + 24, y0 = Math.min(...els.map(e => e.top)) - r.top - 16, y1 = Math.max(...els.map(e => e.bottom)) - r.top + 16;
    safe = new Float32Array([x0 * d, (r.height - y1) * d, x1 * d, (r.height - y0) * d]);   // gl_FragCoord space (y up)
    Object.values(fb).forEach(x => { gl.deleteTexture(x.t); gl.deleteFramebuffer(x.f); });
    const hw = Math.round(canvas.width / 2), hh = Math.round(canvas.height / 2);
    fb = { mass: target(hw, hh, hasFloat), blur: target(hw, hh, false), blur2: target(hw, hh, false), grain: target(canvas.width, canvas.height, false) };
  }

  // ---------- camera ----------
  const D2R = Math.PI / 180;
  const persp = (fovy, a, n, f, sx, sy) => { const t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return new Float32Array([t / a, 0, 0, 0, 0, t, 0, 0, -sx, -sy, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]); };
  function look(c, yaw, pitch) {
    const f = [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)];
    let r = [-f[2], 0, f[0]]; const rl = Math.hypot(...r); r = r.map(v => v / rl);
    const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    return new Float32Array([r[0], u[0], -f[0], 0, r[1], u[1], -f[1], 0, r[2], u[2], -f[2], 0, -dot(r, c), -dot(u, c), dot(f, c), 1]);
  }
  const mul = (m, v) => [0, 1, 2, 3].map(i => m[i] * v[0] + m[4 + i] * v[1] + m[8 + i] * v[2] + m[12 + i] * v[3]);

  const st = { mx: 0, my: 0, sx: 0, sy: 0, t: 0, speed: 0, stretch: 0, lastPX: null, lastPY: null, lastPT: 0, scrollV: 0, scrollZ: 0, lastScroll: scrollY, lastScrollT: 0 };
  let last = performance.now(), running = false, visible = true, raf = 0, showText = true;

  function draw(dt) {
    const C = CFG.camera, Rn = CFG.render; st.t += dt;
    // speed-sensitive streaks: the measured pointer speed drives a stretch factor that decays on its own
    const fromMouse = (Rn.speedStreak && !calm) ? st.speed * Rn.speedGain : 0, fromScroll = (Rn.scrollWarp && !calm) ? st.scrollV * Rn.scrollGain : 0;
    const target = Math.min(Rn.speedMax, Math.max(fromMouse, fromScroll));
    st.scrollV *= Math.exp(-dt * 5);
    st.stretch += (target - st.stretch) * (target > st.stretch ? 1 - Math.exp(-dt * 14) : 1 - Math.exp(-dt * Rn.speedDecay));
    st.speed *= Math.exp(-dt * 6);                            // speed sample fades between pointer events
    const kE = 1 - Math.exp(-dt * C.ease);
    st.sx += ((calm ? 0 : st.mx) - st.sx) * kE; st.sy += ((calm ? 0 : st.my) - st.sy) * kE;
    const sw = calm ? [0, 0, 0] : [Math.sin(st.t * 0.11) * C.sway[0], Math.sin(st.t * 0.073 + 1.3) * C.sway[1], Math.sin(st.t * 0.09 + 0.6) * C.sway[2]];
    // the scene follows the pointer: camera translates the opposite way, and turns toward the pointer
    const cam = [C.pos[0] - st.sx * C.follow[0] + sw[0], C.pos[1] - st.sy * C.follow[1] + sw[1], C.pos[2] - (Rn.scrollWarp && !calm ? st.scrollZ : 0)];
    const yaw = (-st.sx * C.followYaw + sw[2]) * D2R, pitch = (st.sy * C.followPitch) * D2R;
    const W = canvas.width, H = canvas.height, asp = W / H;
    const P = persp(C.fovY * D2R, asp, 0.1, 120, C.shift[0], C.shift[1]), V = look(cam, yaw, pitch);
    // streak centre = the projected far point of the hall axis (anchored to geometry)
    const fp = mul(P, mul(V, [C.pos[0], 0.1, -CFG.scene.farZ * 2, 1])), fc = [fp[0] / fp[3] * 0.5 + 0.5, fp[1] / fp[3] * 0.5 + 0.5];

    const focalPx = h => h / (2 * Math.tan(C.fovY * D2R / 2)), dpr = canvas.width / hero.getBoundingClientRect().width;
    const sprites = (prg, v, blendSrc, blendDst, bufH, px, extra) => {
      gl.useProgram(prg.p); gl.bindVertexArray(v.v);
      gl.uniformMatrix4fv(prg.u.uProj, false, P); gl.uniformMatrix4fv(prg.u.uView, false, V);
      gl.uniform1f(prg.u.uTime, calm ? 0 : st.t); gl.uniform1f(prg.u.uFlow, calm ? 0 : Rn.flow);
      gl.uniform1f(prg.u.uScale, focalPx(bufH)); gl.uniform1f(prg.u.uPx, px);
      if (extra) extra(prg); gl.blendFunc(blendSrc, blendDst); gl.drawArrays(gl.POINTS, 0, v.n);
    };
    gl.enable(gl.BLEND); gl.clearColor(0, 0, 0, 1);
    // 1. soft masses (additive) + dark speckles (multiplicative) at half res
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.mass.f); gl.viewport(0, 0, fb.mass.w, fb.mass.h); gl.clear(gl.COLOR_BUFFER_BIT);
    sprites(P_SOFT, V_MASS, gl.ONE, gl.ONE, fb.mass.h, 0);
    // 2. radial streak blur toward the focal point, length modulated by noise
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.blur.f); gl.viewport(0, 0, fb.blur.w, fb.blur.h); gl.disable(gl.BLEND);
    gl.useProgram(P_BLUR.p); gl.bindVertexArray(V_Q);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fb.mass.t); gl.uniform1i(P_BLUR.u.uT, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T_NOISE); gl.uniform1i(P_BLUR.u.uN, 1);
    gl.uniform2f(P_BLUR.u.uC, fc[0], fc[1]); gl.uniform2f(P_BLUR.u.uAsp, asp, 1);
    gl.uniform1f(P_BLUR.u.uLen, Rn.streak * (1 + st.stretch)); gl.uniform1f(P_BLUR.u.uVar, Rn.streakNoise); gl.uniform1f(P_BLUR.u.uTime, calm ? 0 : st.t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.blur2.f); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fb.blur.t);
    gl.uniform1f(P_BLUR.u.uLen, Rn.streak2); gl.uniform1f(P_BLUR.u.uVar, 0.3); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.enable(gl.BLEND); sprites(P_SPECK, V_SPECK, gl.ZERO, gl.ONE_MINUS_SRC_ALPHA, fb.blur2.h, dpr * 0.5, p => gl.uniform1f(p.u.uK, Rn.speckle));   // dark speckles on the blurred masses
    // 3. sharp grain, doorway, dust at full res (additive)
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.grain.f); gl.viewport(0, 0, W, H); gl.clear(gl.COLOR_BUFFER_BIT); gl.enable(gl.BLEND);
    sprites(P_SHARP, V_GRAIN, gl.ONE, gl.ONE, H, dpr);
    // 4. composite + palette
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H); gl.disable(gl.BLEND);
    gl.useProgram(P_COMP.p); gl.bindVertexArray(V_Q);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, fb.blur2.t); gl.uniform1i(P_COMP.u.uM, 0);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, fb.grain.t); gl.uniform1i(P_COMP.u.uG, 1);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, T_NOISE); gl.uniform1i(P_COMP.u.uN, 2);
    gl.uniform1f(P_COMP.u.uMg, Rn.massGain); gl.uniform1f(P_COMP.u.uGg, Rn.grainGain); gl.uniform1f(P_COMP.u.uExp, Rn.exposure);
    gl.uniform1f(P_COMP.u.uGam, Rn.gamma); gl.uniform1f(P_COMP.u.uPal, Rn.palette);
    gl.uniform3fv(P_COMP.u.uWd, Rn.warm.dark); gl.uniform3fv(P_COMP.u.uWm, Rn.warm.mid); gl.uniform3fv(P_COMP.u.uWh, Rn.warm.hi); gl.uniform3fv(P_COMP.u.uWt, Rn.warm.top);
    gl.uniform1f(P_COMP.u.uScrim, showText ? Rn.scrim : 0); gl.uniform1f(P_COMP.u.uFeather, Rn.scrimFeather * dpr); gl.uniform4fv(P_COMP.u.uSafe, safe); gl.uniform2f(P_COMP.u.uRes, W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    window.__focal = fc;
  }

  function frame(t) { raf = 0; const dt = Math.min((t - last) / 1000, 1 / 20); last = t; draw(dt); if (visible && !calm) raf = requestAnimationFrame(frame); }
  const kick = () => { if (!raf && visible && !calm) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  addEventListener("pointermove", e => { const r = hero.getBoundingClientRect();
    st.mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); st.my = Math.max(-1, Math.min(1, 1 - ((e.clientY - r.top) / r.height) * 2));
    if (st.lastPX !== null) { const dtp = Math.max((e.timeStamp - st.lastPT) / 1000, 1 / 240);
      const v = Math.hypot(e.clientX - st.lastPX, e.clientY - st.lastPY) / r.width / dtp;     // hero widths per second
      st.speed = Math.max(st.speed, Math.min(v, 6)); }
    st.lastPX = e.clientX; st.lastPY = e.clientY; st.lastPT = e.timeStamp; }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
  addEventListener("scroll", () => { const now = performance.now(), d = Math.abs(scrollY - st.lastScroll), dtS = Math.max((now - st.lastScrollT) / 1000, 1 / 120);
    st.scrollV = Math.max(st.scrollV, Math.min(d / dtS, 4000)); st.lastScroll = scrollY; st.lastScrollT = now;
    st.scrollZ = Math.min(CFG.render.scrollTravelMax, scrollY * CFG.render.scrollTravel); kick(); }, { passive: true });
  addEventListener("resize", () => { resize(); draw(0); });

  const bPal = document.getElementById("pal"), bCalm = document.getElementById("calm"), bText = document.getElementById("text");
  const bScr = document.getElementById("scr"); if (bScr) { bScr.onclick = () => { CFG.render.scrollWarp = !CFG.render.scrollWarp; bScr.textContent = "Scroll warp: " + (CFG.render.scrollWarp ? "on" : "off"); draw(0); }; bScr.textContent = "Scroll warp: " + (CFG.render.scrollWarp ? "on" : "off"); }
  const bSpd = document.getElementById("spd"); if (bSpd) { bSpd.onclick = () => { CFG.render.speedStreak = !CFG.render.speedStreak; bSpd.textContent = "Speed streaks: " + (CFG.render.speedStreak ? "on" : "off"); }; bSpd.textContent = "Speed streaks: " + (CFG.render.speedStreak ? "on" : "off"); }
  const labels = () => { if (!bPal || !bCalm || !bText) return; bPal.textContent = "Palette: " + (CFG.render.palette ? "orange" : "mono"); bCalm.textContent = "Reduce Motion: " + (calm ? "on" : "off"); bText.textContent = showText ? "Hide text" : "Show text"; };
  if (bPal) bPal.onclick = () => { CFG.render.palette = 1 - CFG.render.palette; labels(); draw(0); };
  if (bCalm) bCalm.onclick = () => { calm = !calm; st.sx = st.sy = 0; labels(); if (calm) draw(0); else kick(); };
  if (bText) bText.onclick = () => { showText = !showText; document.querySelector(WRAP_SEL).style.visibility = showText ? "" : "hidden"; document.querySelector(".navigation-bar").style.visibility = showText ? "" : "hidden"; labels(); };
  labels();

  resize(); draw(0); kick();
  if (document.fonts) document.fonts.ready.then(() => { resize(); draw(0); });
  window.__leadleHero = { get stretch() { return st.stretch; }, get scrollZ() { return st.scrollZ; }, CFG, counts: { mass: V_MASS.n, grain: V_GRAIN.n, speck: V_SPECK.n }, setPalette: p => { CFG.render.palette = p; labels(); draw(0); }, draw: () => draw(0) };
}
  function mount() {
    var hero = document.querySelector(HERO_SEL);
    if (!hero || document.getElementById("lh-fx")) return;
    var img = document.createElement("img"); img.className = "fallback"; img.alt = ""; img.setAttribute("aria-hidden", "true"); img.src = FALLBACK;
    var cv = document.createElement("canvas"); cv.id = "lh-fx"; cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(img, hero.firstChild); hero.insertBefore(cv, hero.firstChild);
    try { run(); } catch (e) { hero.classList.add("static"); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
