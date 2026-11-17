/*! leadle-hero-ribbon v1.0.0 | the ribbon hero for leadlehq.com solutions pages (braid / loop / unfurl) | built from leadle-hero-ribbon.html */
(function () {
  var m = /^\/solutions\/(outbound-os|revops-as-a-service|founder-on-call)\/?$/.exec(location.pathname);
  if (!m) return;
  var FORM = { "outbound-os": "braid", "revops-as-a-service": "loop", "founder-on-call": "unroll" }[m[1]];
  window.__lhForm = FORM;
  var FALLBACK = "https://revops-leadle.github.io/leadle-hero-space/hero-ribbon-" + FORM + ".v1.webp";
  var style = document.createElement("style"); style.id = "lh-hero-style";
  style.textContent = '.section_solutions-hero{position:relative;isolation:isolate;overflow:hidden;background-image:none!important;background-color:#0b0b0c!important}\n.section_solutions-hero .glass-bg{display:none!important;background-image:none!important}\n.section_solutions-hero>.padding-global{position:relative;z-index:1}\n.section_solutions-hero #lh-fx,.section_solutions-hero .fallback{position:absolute;inset:0;width:100%;height:100%;z-index:0;display:block;object-fit:cover;pointer-events:none}\n.section_solutions-hero.static #lh-fx{display:none}\n.section_solutions-hero .text-color-black,.section_solutions-hero .heading-style-h1,.section_solutions-hero .body-text{color:#f3f5f7!important}\n.section_solutions-hero .big-pill{color:#fff!important;background:rgba(249,115,22,.18)!important}\n.section_solutions-hero .primary-button{background:#f3f5f7!important;color:#2c2f34!important;border-color:#f3f5f7!important}\n.section_solutions-hero .button-secondary{color:#f3f5f7!important;border-color:rgba(243,245,247,.85)!important}';
  (document.head || document.documentElement).appendChild(style);   // before first paint: the old hero images are never requested
  function run() {
  // ============================== TUNING ==============================
  const PALETTES = {   // charcoal + ember family (v2's chosen map) with a per-offering hue
    ember:  { dark: [.04,.025,.022], mid: [.42,.15,.05], hi: [.98,.54,.20], top: [1,.86,.68] },
    copper: { dark: [.04,.025,.022], mid: [.40,.16,.08], hi: [.94,.50,.28], top: [1,.85,.70] },
    amber:  { dark: [.04,.025,.022], mid: [.45,.21,.05], hi: [.99,.66,.24], top: [1,.90,.70] },
  };
  const CFG = {
    form: window.__lhForm,                       // braid | loop | unroll
    camera: { pos: [0, 0, 7.6], fovY: 40, shift: [0, 0], follow: [0.9, 0.5], followYaw: 5, followPitch: 3, ease: 5, sway: [0.12, 0.06, 0.5] },
    render: {
      exposure: 1.25, gamma: 1.0,
      glow: 0.06, glowWide: 0.14, glowRadius: 1.0,     // tight (half-res) and wide (quarter-res) glow around the band
      haze: 0.19, hazeCenter: [0.68, 0.40], hazeSize: 0.70,   // soft warm haze behind the form
      floor: 0.018, grain: 0.14,
      dots: 170, dotLum: 0.5,
      edge: 0.04,                                      // light along the band's edges
      pulse: 1.6, pulseWidth: 0.045, pulseReach: 0.30,  // pointer light pulse: strength, width along u, pointer distance (NDC) where it fades out
      travel: 0.45,                                     // autonomous traveller brightness (a pulse that runs along the band on its own)
      scrim: 0.70, scrimFeather: 120,
      speedPulse: true, speedGain: 0.9, speedMax: 0.8, speedDecay: 3.5,   // fast sweeps widen and brighten the pulse, then it decays
      scrollWarp: true, scrollGain: 0.0016, scrollTravel: 0.0035, scrollTravelMax: 2.2,   // scrolling dollies the camera in and speeds the flow
      palette: 1, warm: null, msaa: 4,
    },
    forms: {
      braid:  { threads: 7, segs: 160, width: [0.38, 0.90], spread: 2.6, bundle: 0.42, twist: 2.6, flow: 0.18, hue: "ember", travelSpeed: 0.09, trunkY: -1.75,   // the v3 pass (18 Nov) + 18 Nov evening refinements
                lift: 0.42, liftR: 1.7, liftZ: 0.9,                  // ribbons near the pointer bend toward it and rise toward the viewer
                signal: true, signalSpeed: 0.38, signalLife: 2.6,    // click / tap / fast sweep: a pulse runs along every ribbon into the bundle
                render: { haze: 0.17, hazeCenter: [0.78, 0.40], hazeSize: 0.55, curl: 0.3, light: [0.40, 2, 0.07, 0.62],
                          warm: { dark: [.045,.03,.027], mid: [.50,.19,.07], hi: [.98,.56,.22], top: [1,.86,.68] } } },
      loop:   { segs: 280, rx: 4.8, rz: 2.3, wave: 0.6, width: 2.1, twist: 1.0, offset: [1.2, -2.25, 0.6], tilt: 1.0, spin0: 0.3, spin: 0.03, lean: [0.35, 0.22], hue: "copper", travelSpeed: 0.07 },
      unroll: { segs: 300, origin: [-2.6, -2.7, -0.5], run: 9.5, rise: 1.2, waves: 1.0, phase: -0.25, near: 1.8, twist: 2.0, width: [0.14, 2.2], spring: 16, damp: 5, endFollow: [1.6, 1.0], originGlow: 1.2, hue: "amber", travelSpeed: 0.22 },
    },
  };
  if (!CFG.forms[CFG.form]) CFG.form = "braid";
  CFG.render.stops = CFG.render.stops || [0.30, 0.68, 1.15]; CFG.render.curl = CFG.render.curl === undefined ? 0.55 : CFG.render.curl;
  CFG.render.light = CFG.render.light || [0.25, 3, 0.045, 0.70];   // lambert wrap, falloff power, ambient, diffuse weight (v3.1 values)
  const BASE_RENDER = JSON.parse(JSON.stringify(CFG.render));
  const COPY = {
    braid:  ["B2B Appointment Setting + Outbound Systems", "Qualified Meetings, Powered by Signal-Led Outbound", "We manage targeting, research, messaging, email, LinkedIn and calling to create qualified sales conversations consistently. Run it with Leadle, or build the system for your team to own."],
    loop:   ["RevOps as a Service", "Connected systems. Predictable revenue.", "Most B2B teams don't have a pipeline problem. They have a systems problem. We audit, clean, and automate your revenue operations across every stage of the funnel."],
    unroll: ["Founder On Call", "Founder-level GTM firepower", "Get hands-on strategic leadership from Leadle’s founders to architect your next-gen growth system and unlock scalable revenue."],
  };
  // ====================================================================

  const hero = document.querySelector(".section_solutions-hero"), canvas = document.getElementById("lh-fx");
  let calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const gl = canvas.getContext("webgl2", { alpha: false, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) { hero.classList.add("static"); return; }
  const mobile = Math.min(innerWidth, innerHeight) < 700;
  const D2R = Math.PI / 180;

  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  // ---------- shaders ----------
  const VS_R = `#version 300 es
in vec3 aPos; in vec3 aNrm; in vec2 aUv; in float aLum; in float aRid;
uniform mat4 uProj, uView; out vec3 vN; out vec3 vP; out vec2 vUv; out float vLum; out float vRid;
void main(){ vec4 v = uView * vec4(aPos, 1.); vP = v.xyz; vN = mat3(uView) * aNrm; vUv = aUv; vLum = aLum; vRid = aRid; gl_Position = uProj * v; }`;
  const FS_R = `#version 300 es
precision highp float; in vec3 vN; in vec3 vP; in vec2 vUv; in float vLum; in float vRid;
uniform sampler2D uN; uniform float uEdge, uPulseU, uPulseW, uPulseK, uPulseR, uRidSpread, uClosed, uTime, uTravel, uTravelK, uTravelW, uOrigin; uniform vec4 uLight, uWave; out vec4 o;
void main(){
  vec3 n = normalize(vN); vec3 V = normalize(-vP); float inside = 1.; if (dot(n, V) < 0.) { n = -n; inside = .72; }
  vec3 L = normalize(vec3(.45, .80, .40)); vec3 H = normalize(L + V);
  float wrap = clamp((dot(n, L) + uLight.x) / (1. + uLight.x), 0., 1.), diff = pow(wrap, uLight.y) + .08 * max(dot(n, normalize(vec3(-.6, -.3, .7))), 0.);   // wrapped lambert + weak fill: satin, not plastic
  float spec = pow(max(dot(n, H), 0.), 48.), fres = pow(1. - max(dot(n, V), 0.), 4.);
  float band = .97 + .06 * texture(uN, vec2(vUv.x * 40. + vRid * .13, vUv.y * 2.5 + uTime * .01)).r;   // barely-there weave
  float e = min(vUv.y, 1. - vUv.y); float edge = smoothstep(.06, 0., e);
  float d = abs(vUv.x - uPulseU); if (uClosed > .5) d = min(d, 1. - d);
  float rid = exp(-(vRid - uPulseR) * (vRid - uPulseR) / (uRidSpread * uRidSpread + 1e-4));
  float pulse = exp(-d * d / (uPulseW * uPulseW)) * uPulseK * rid;
  float tp = vUv.x - uTime * uTravel; tp = tp - floor(tp); float d2 = min(tp, 1. - tp);
  float trav = exp(-d2 * d2 / (uTravelW * uTravelW)) * uTravelK;
  float wp = uWave.x + uWave.y * uWave.z, dw = vUv.x - wp;                                  // the signal: a bright front that runs toward u = 1 and fades
  float wave = uWave.w > 0. ? (exp(-dw * dw / .0035) + .35 * step(0., -dw) * exp(dw * 9.)) * max(0., 1. - uWave.y / uWave.w) : 0.;   // bright front + a glowing tail behind it
  float lit = pulse + trav + wave * 1.5;
  float og = uOrigin * exp(-vUv.x * vUv.x / .0025);
  float c = vLum * inside * (uLight.z + uLight.w * diff * band + .22 * spec + .08 * fres) + edge * uEdge + lit * (.9 * edge + .35 * (.3 + .7 * diff)) + og;
  o = vec4(c, 0., 0., 1.);
}`;
  const VS_P = `#version 300 es
in vec3 aPos; in float aSize; in float aLum; in float aSeed; uniform mat4 uProj, uView; uniform float uTime, uDpr; out float vLum;
void main(){ vec3 p = aPos + .25 * vec3(sin(uTime * .21 + aSeed * 6.283), cos(uTime * .17 + aSeed * 3.1), sin(uTime * .13 + aSeed * 9.4));
  vec4 v = uView * vec4(p, 1.); gl_Position = uProj * v; gl_PointSize = aSize * uDpr * clamp(7. / -v.z, .4, 2.); vLum = aLum * (.6 + .4 * sin(uTime * .9 + aSeed * 40.)); }`;
  const FS_P = `#version 300 es
precision highp float; in float vLum; out vec4 o;
void main(){ vec2 q = gl_PointCoord * 2. - 1.; float r2 = dot(q, q); if (r2 > 1.) discard; o = vec4(vLum * smoothstep(1., .2, r2), 0., 0., 1.); }`;
  const VS_Q = `#version 300 es
in vec2 aQ; out vec2 vUv; void main(){ vUv = aQ * .5 + .5; gl_Position = vec4(aQ, 0., 1.); }`;
  const FS_BLUR = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uT; uniform vec2 uDir; out vec4 o;
void main(){ float w[5] = float[5](.227, .194, .121, .054, .016); float acc = texture(uT, vUv).r * w[0];
  for (int i = 1; i < 5; i++) { acc += texture(uT, vUv + uDir * float(i)).r * w[i]; acc += texture(uT, vUv - uDir * float(i)).r * w[i]; } o = vec4(acc, 0., 0., 1.); }`;
  const FS_COMP = `#version 300 es
precision highp float; in vec2 vUv; uniform sampler2D uS, uG1, uG2, uN; uniform float uGlow, uGlowW, uHaze, uHazeSize, uFloor, uGrain, uExp, uGam, uPal, uScrim, uFeather;
uniform vec2 uHazeC, uRes, uAsp; uniform vec4 uSafe; uniform vec3 uWd, uWm, uWh, uWt, uStops; out vec4 o;
void main(){
  vec2 px = vUv * uRes; vec2 q = max(max(uSafe.xy - px, px - uSafe.zw), 0.);
  float scrim = 1. - uScrim * (1. - smoothstep(0., uFeather, length(q)));
  vec2 hd = (vUv - uHazeC) * uAsp; float haze = uHaze * exp(-dot(hd, hd) / (uHazeSize * uHazeSize));
  float c = texture(uS, vUv).r + texture(uG1, vUv).r * uGlow + texture(uG2, vUv).r * uGlowW + haze;
  float g = texture(uN, vUv * vec2(13., 7.) ).r;
  c = (c * (1. - uGrain * .5 + uGrain * g) + uFloor) * scrim;
  c = c / (1. + c * .5) * uExp; c = pow(max(c, 0.), 1. / uGam);
  vec3 warm = mix(uWd, uWm, smoothstep(0., uStops.x, c)); warm = mix(warm, uWh, smoothstep(uStops.x, uStops.y, c)); warm = mix(warm, uWt, smoothstep(uStops.y, uStops.z, c));
  o = vec4(mix(vec3(c), warm, uPal), 1.);
}`;
  function prog(vs, fs, attrs) {
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    attrs.forEach((a, i) => gl.bindAttribLocation(p, i, a)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; for (let i = 0, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i < n; i++) { const nm = gl.getActiveUniform(p, i).name.replace("[0]", ""); u[nm] = gl.getUniformLocation(p, nm); }
    return { p, u };
  }
  const P_R = prog(VS_R, FS_R, ["aPos", "aNrm", "aUv", "aLum", "aRid"]), P_P = prog(VS_P, FS_P, ["aPos", "aSize", "aLum", "aSeed"]);
  const P_BLUR = prog(VS_Q, FS_BLUR, ["aQ"]), P_COMP = prog(VS_Q, FS_COMP, ["aQ"]);

  // noise texture
  const NS = 128, nd = new Uint8Array(NS * NS); { const nr = mulberry32(9); const g = []; for (let i = 0; i < 256; i++) g.push(nr());
    for (let y = 0; y < NS; y++) for (let x = 0; x < NS; x++) { let v = 0, amp = 0.6, f = 1;
      for (let o = 0; o < 3; o++) { const fx = x / NS * 4 * f, fy = y / NS * 4 * f, xi = Math.floor(fx) % 16, yi = Math.floor(fy) % 16, u = fx % 1, w = fy % 1;
        const h = (a, b) => g[((a % 16) + 16) % 16 + (((b % 16) + 16) % 16) * 16], su = u * u * (3 - 2 * u), sw = w * w * (3 - 2 * w);
        v += amp * ((h(xi, yi) * (1 - su) + h(xi + 1, yi) * su) * (1 - sw) + (h(xi, yi + 1) * (1 - su) + h(xi + 1, yi + 1) * su) * sw); amp *= 0.5; f *= 2; }
      nd[y * NS + x] = Math.round(v * 255); } }
  const T_NOISE = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, T_NOISE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, NS, NS, 0, gl.RED, gl.UNSIGNED_BYTE, nd);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  // quad + dots
  const V_Q = gl.createVertexArray(); gl.bindVertexArray(V_Q);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const dots = []; { const r = mulberry32(77); for (let i = 0; i < CFG.render.dots * (mobile ? 0.6 : 1); i++) dots.push((r() * 2 - 1) * 9, (r() * 2 - 1) * 4.5, -4 + r() * 6, 1.2 + r() * 2.2, CFG.render.dotLum * Math.pow(r(), 1.5), r()); }
  const V_D = gl.createVertexArray(); gl.bindVertexArray(V_D);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dots), gl.STATIC_DRAW);
  [[0, 3, 0], [1, 1, 12], [2, 1, 16], [3, 1, 20]].forEach(([l, s, off]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 24, off); });
  const N_DOTS = dots.length / 6;

  // ---------- ribbon mesh (rebuilt each frame on the CPU; 10 floats per vertex) ----------
  const STRIDE = 10;   // CFG.render.curl: edge-normal tilt that shades a band like a shallow trough
  let mesh = null;   // { vao, vbo, ibo, nIdx, data, ribbons:[{segs, off}] }
  function allocMesh(counts) {
    if (mesh) { gl.deleteVertexArray(mesh.vao); gl.deleteBuffer(mesh.vbo); gl.deleteBuffer(mesh.ibo); }
    let nv = 0; const idx = []; const ribbons = [];
    counts.forEach(segs => { const base = nv; ribbons.push({ segs, off: base });
      for (let i = 0; i < segs; i++) { const a = base + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } nv += (segs + 1) * 2; });
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo); gl.bufferData(gl.ARRAY_BUFFER, nv * STRIDE * 4, gl.DYNAMIC_DRAW);
    [[0, 3, 0], [1, 3, 12], [2, 2, 24], [3, 1, 32], [4, 1, 36]].forEach(([l, s, off]) => { gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, STRIDE * 4, off); });
    const ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(idx), gl.STATIC_DRAW);
    mesh = { vao, vbo, ibo, nIdx: idx.length, data: new Float32Array(nv * STRIDE), ribbons, centre: ribbons.map(r => new Float32Array((r.segs + 1) * 3)) };
  }
  const tmp = { p: [0, 0, 0], T: [0, 0, 0], N: [0, 0, 0], B: [0, 0, 0] };
  const norm = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; v[0] /= l; v[1] /= l; v[2] /= l; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // writes one ribbon: f(u) -> [x,y,z], w(u) width, tw(u) twist (rad), lum(u), rid. Rotation-minimising frame + twist.
  function writeRibbon(k, f, w, tw, lum, rid, closed) {
    const r = mesh.ribbons[k], segs = r.segs, D = mesh.data, C = mesh.centre[k]; let o = r.off * STRIDE;
    let N = null, prevT = null, N0 = null, fix = 0;
    for (let pass = closed ? 0 : 1; pass < 2; pass++) { N = null; prevT = null; o = r.off * STRIDE;
    for (let i = 0; i <= segs; i++) {
      const u = i / segs, p = f(u), p1 = f(Math.min(1, u + 1e-3)), p0 = f(Math.max(0, u - 1e-3));
      const T = norm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
      if (!N) { const ref = Math.abs(T[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]; N = norm(cross(ref, T)); }
      else { // parallel transport: rotate N by the rotation taking prevT to T
        const ax = cross(prevT, T), s = Math.hypot(ax[0], ax[1], ax[2]), c = prevT[0] * T[0] + prevT[1] * T[1] + prevT[2] * T[2];
        if (s > 1e-6) { const a = norm(ax), ang = Math.atan2(s, c), ca = Math.cos(ang), sa = Math.sin(ang), dotN = a[0] * N[0] + a[1] * N[1] + a[2] * N[2], axN = cross(a, N);
          N = norm([N[0] * ca + axN[0] * sa + a[0] * dotN * (1 - ca), N[1] * ca + axN[1] * sa + a[1] * dotN * (1 - ca), N[2] * ca + axN[2] * sa + a[2] * dotN * (1 - ca)]); }
        // keep N perpendicular to T (drift control)
        const d = N[0] * T[0] + N[1] * T[1] + N[2] * T[2]; N = norm([N[0] - T[0] * d, N[1] - T[1] * d, N[2] - T[2] * d]);
      }
      prevT = T;
      if (i === 0) N0 = N;
      if (pass === 0) { if (i === segs) { const Bn0 = cross(T, N0), th = Math.atan2(N[0] * Bn0[0] + N[1] * Bn0[1] + N[2] * Bn0[2], N[0] * N0[0] + N[1] * N0[1] + N[2] * N0[2]);
          const total = th + tw(1) - tw(0); fix = Math.round(total / Math.PI) * Math.PI - total; } continue; }   // end frame must land on the start frame (mod a half-turn)
      const Bn = cross(T, N), ph = tw(u) + fix * u, cp = Math.cos(ph), sp = Math.sin(ph);
      const B = [N[0] * cp + Bn[0] * sp, N[1] * cp + Bn[1] * sp, N[2] * cp + Bn[2] * sp];       // across-the-band direction
      const nrm = cross(T, B), hw = w(u) * 0.5, l = lum(u), curl = CFG.render.curl;
      C[i * 3] = p[0]; C[i * 3 + 1] = p[1]; C[i * 3 + 2] = p[2];
      for (let s = -1; s <= 1; s += 2) {
        D[o++] = p[0] + B[0] * hw * s; D[o++] = p[1] + B[1] * hw * s; D[o++] = p[2] + B[2] * hw * s;
        const nx = nrm[0] + B[0] * s * curl, ny = nrm[1] + B[1] * s * curl, nz = nrm[2] + B[2] * s * curl, nl = Math.hypot(nx, ny, nz) || 1;
        D[o++] = nx / nl; D[o++] = ny / nl; D[o++] = nz / nl;
        D[o++] = u; D[o++] = s < 0 ? 0 : 1; D[o++] = l; D[o++] = rid;
      }
    } }
  }

  // ---------- forms ----------
  const st = { mx: 0, my: 0, sx: 0, sy: 0, t: 0, speed: 0, stretch: 0, lastPX: null, lastPY: null, lastPT: 0, scrollV: 0, scrollZ: 0, lastScroll: scrollY, lastScrollT: 0,
    pulseU: 0.5, pulseK: 0, pulseR: 0, ex: 0, ey: 0, evx: 0, evy: 0, waveU: 0, waveT: -1e9, lastWave: -1e9, asp: 1.8 };
  let FORM = null;
  const FORMS = {
    braid: {
      closed: false, ridSpread: 2.5,
      setup(F) { const r = mulberry32(31); F.th = []; for (let k = 0; k < F.threads; k++) F.th.push({ a: (k / F.threads) * Math.PI * 2 + r() * 0.3, w: F.width[0] + (F.width[1] - F.width[0]) * r(), lum: 0.85 + 0.2 * r(), ph: r() * 6.283, sp: 0.6 + 0.8 * r() });
        allocMesh(F.th.map(() => F.segs)); },
      build(F, t, bx, by) {
        const halfH = CFG.camera.pos[2] * Math.tan(CFG.camera.fovY * D2R / 2), pw = [bx * halfH * st.asp, by * halfH], lk = calm ? 0 : F.lift || 0;
        const liftTo = p => { if (!lk) return p; const dx = pw[0] - p[0], dy = pw[1] - p[1], g = lk * Math.exp(-(dx * dx + dy * dy) / (F.liftR * F.liftR));
          return [p[0] + dx * g * 0.35, p[1] + dy * g * 0.55, p[2] + F.liftZ * g]; };
        const trunk = u => { const s = Math.sin(Math.PI * u); return [-7.4 + 14.8 * u, F.trunkY + 0.9 * s + by * s * s * 0.8 + 0.12 * Math.sin(t * 0.3 + u * 4), -1.6 + 2.4 * s * s + 0.4 * Math.sin(t * 0.21 + u * 3)]; };
        F.th.forEach((h, k) => {
          const f = u => { const p = trunk(u), s = sstep(0.0, 0.6, u), r = (1 - s) * F.spread * h.sp + s * F.bundle * (0.7 + 0.3 * Math.sin(u * 5 + h.ph)), ang = h.a + F.twist * u + t * 0.12 * (k % 2 ? 1 : -1) * 0.5;
            return liftTo([p[0] + bx * Math.sin(Math.PI * u) * 0.6, p[1] + Math.sin(ang) * r * 0.7 - (1 - s) * 0.5, p[2] + Math.cos(ang) * r]); };
          writeRibbon(k, f, u => h.w * (0.8 + 0.5 * sstep(0.1, 0.6, u)), u => h.a + 0.9 * u + t * 0.05, u => h.lum * (0.8 + 0.3 * sstep(0.3, 1, u)), k);
        });
      },
    },
    loop: {
      closed: true, ridSpread: 1,
      setup(F) { allocMesh([F.segs]); },
      build(F, t, bx, by) {
        const spin = F.spin0 + t * F.spin + bx * F.lean[0], tilt = F.tilt + by * F.lean[1], cs = Math.cos(spin), sn = Math.sin(spin), ct = Math.cos(tilt), stt = Math.sin(tilt);
        const f = u => { const th = u * Math.PI * 2, x = F.rx * Math.cos(th), z = F.rz * Math.sin(th), y = F.wave * Math.sin(2 * th + 0.4) + 0.25 * Math.sin(th * 3 + t * 0.2);   // an ellipse lying flat, undulating
          const x1 = x * cs + z * sn, z1 = -x * sn + z * cs, y2 = y * ct - z1 * stt, z2 = y * stt + z1 * ct;      // spin about y, then tilt toward the camera
          return [x1 + F.offset[0], y2 + F.offset[1], z2 + F.offset[2]]; };
        writeRibbon(0, f, () => F.width, u => Math.PI * F.twist * u + 0.35 * Math.sin(t * 0.25), u => 0.95 + 0.1 * Math.sin(u * 12.56 + t * 0.4), 0, true);
      },
    },
    unroll: {
      closed: false, ridSpread: 1,
      setup(F) { allocMesh([F.segs]); },
      build(F, t, bx, by, dt) {
        const tx = bx * F.endFollow[0], ty = by * F.endFollow[1];   // the free end chases the pointer on a spring
        st.evx += ((tx - st.ex) * F.spring - st.evx * F.damp) * dt; st.evy += ((ty - st.ey) * F.spring - st.evy * F.damp) * dt;
        st.ex += st.evx * dt; st.ey += st.evy * dt;
        const O = F.origin;   // u = 0: the bright point the ribbon unfurls from; the band widens and folds as it runs to the right
        const f = u => { const w = u * u, sw = Math.sin(Math.PI * u);
          return [O[0] + F.run * u + st.ex * w + 0.1 * Math.sin(t * 0.3 + u * 3) * u, O[1] + F.rise * u + 1.5 * Math.sin((F.waves * u + F.phase) * 2 * Math.PI) * (0.35 + 0.65 * u) + st.ey * w + 0.08 * Math.sin(t * 0.37 + u * 5) * u, O[2] + F.near * sw + 0.3 * Math.sin(t * 0.21 + u * 4)]; };
        writeRibbon(0, f, u => F.width[0] + (F.width[1] - F.width[0]) * Math.pow(u, 0.7), u => Math.PI * F.twist * u + 0.3 * Math.sin(t * 0.22), u => 0.9 + 0.15 * u, 0);
      },
    },
  };
  function setForm(name) {
    CFG.form = name; FORM = FORMS[name]; const F = CFG.forms[name];
    Object.assign(CFG.render, JSON.parse(JSON.stringify(BASE_RENDER)), F.render || {});   // per-form look on top of the shared base
    FORM.setup(F);
    CFG.render.warm = (F.render && F.render.warm) || PALETTES[F.hue] || PALETTES.ember; st.ex = st.ey = st.evx = st.evy = 0;
    const c = COPY[name], $p = document.getElementById("pill"), $h = document.getElementById("h1"), $l = document.getElementById("lede");
    if ($p && $h && $l && !hero.dataset.keepCopy) { $p.textContent = c[0]; $h.textContent = c[1]; $l.textContent = c[2]; }
    document.querySelectorAll('.note button[id^="f-"]').forEach(b => b.classList.toggle("on", b.id === "f-" + name));
    resize(); draw(0);
  }

  // ---------- framebuffers ----------
  let fb = {}, safe = new Float32Array(4), msaa = 0;
  function target(w, h) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, w, h, 0, gl.RED, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f, w, h };
  }
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 1.75), r = hero.getBoundingClientRect();
    canvas.width = Math.max(2, Math.round(r.width * dpr)); canvas.height = Math.max(2, Math.round(r.height * dpr));
    const box = e => { const rs = []; try { const rg = document.createRange(); rg.selectNodeContents(e); for (const q of rg.getClientRects()) if (q.width > 0 && q.height > 0) rs.push(q); } catch (_) {}
      if (!rs.length) return e.getBoundingClientRect(); return { left: Math.min(...rs.map(q => q.left)), right: Math.max(...rs.map(q => q.right)), top: Math.min(...rs.map(q => q.top)), bottom: Math.max(...rs.map(q => q.bottom)) }; };
    const d = canvas.width / r.width, els = ['.big-pill', '.body-text', '.solution-cta', 'h1'].map(q => hero.querySelector(q)).filter(Boolean).map(box);
    if (!els.length) els.push(hero.getBoundingClientRect());
    const x0 = Math.min(...els.map(e => e.left)) - r.left - 24, x1 = Math.max(...els.map(e => e.right)) - r.left + 24, y0 = Math.min(...els.map(e => e.top)) - r.top - 16, y1 = Math.max(...els.map(e => e.bottom)) - r.top + 16;
    safe = new Float32Array([x0 * d, (r.height - y1) * d, x1 * d, (r.height - y0) * d]);
    Object.values(fb).forEach(x => { if (x.t) gl.deleteTexture(x.t); if (x.f) gl.deleteFramebuffer(x.f); if (x.rb) x.rb.forEach(b => gl.deleteRenderbuffer(b)); });
    const W = canvas.width, H = canvas.height, hw = W >> 1, hh = H >> 1, qw = W >> 2, qh = H >> 2;
    fb = { scene: target(W, H), h1: target(hw, hh), h2: target(hw, hh), q1: target(qw, qh), q2: target(qw, qh) };
    // multisampled scene (colour + depth), resolved into fb.scene
    msaa = Math.min(CFG.render.msaa, gl.getParameter(gl.MAX_SAMPLES) || 0);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    const cb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, cb);
    if (msaa > 1) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.R8, W, H); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.R8, W, H);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, cb);
    const db = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, db);
    if (msaa > 1) gl.renderbufferStorageMultisample(gl.RENDERBUFFER, msaa, gl.DEPTH_COMPONENT24, W, H); else gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, W, H);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, db);
    fb.ms = { f, rb: [cb, db], w: W, h: H };
  }

  // ---------- camera ----------
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

  let last = performance.now(), running = false, visible = true, raf = 0, showText = true;
  function draw(dt) {
    const C = CFG.camera, Rn = CFG.render, F = CFG.forms[CFG.form]; st.t += dt;
    const fromMouse = (Rn.speedPulse && !calm) ? st.speed * Rn.speedGain : 0, fromScroll = (Rn.scrollWarp && !calm) ? st.scrollV * Rn.scrollGain : 0;
    const target = Math.min(Rn.speedMax, Math.max(fromMouse, fromScroll));
    st.scrollV *= Math.exp(-dt * 5);
    st.stretch += (target - st.stretch) * (target > st.stretch ? 1 - Math.exp(-dt * 14) : 1 - Math.exp(-dt * Rn.speedDecay));
    st.speed *= Math.exp(-dt * 6);
    const kE = 1 - Math.exp(-dt * C.ease);
    st.sx += ((calm ? 0 : st.mx) - st.sx) * kE; st.sy += ((calm ? 0 : st.my) - st.sy) * kE;
    const sw = calm ? [0, 0, 0] : [Math.sin(st.t * 0.11) * C.sway[0], Math.sin(st.t * 0.073 + 1.3) * C.sway[1], Math.sin(st.t * 0.09 + 0.6) * C.sway[2]];
    const cam = [C.pos[0] + st.sx * C.follow[0] + sw[0], C.pos[1] + st.sy * C.follow[1] + sw[1], C.pos[2] - (Rn.scrollWarp && !calm ? st.scrollZ : 0)];
    const yaw = (st.sx * C.followYaw + sw[2]) * D2R, pitch = (-st.sy * C.followPitch) * D2R;   // the scene leans toward the pointer
    const W = canvas.width, H = canvas.height, asp = W / H; st.asp = asp;
    const P = persp(C.fovY * D2R, asp, 0.1, 60, C.shift[0], C.shift[1]), V = look(cam, yaw, pitch);
    const tt = calm ? 0 : st.t, flowK = 1 + st.stretch * 1.5;

    // geometry for this frame (the form bends toward the pointer)
    FORM.build(F, tt, calm ? 0 : st.sx, calm ? 0 : st.sy, Math.max(dt, 1 / 240));
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, mesh.data);

    // pointer -> nearest point on the band (screen space) drives the light pulse
    { let best = 1e9, bu = st.pulseU, br = st.pulseR; const PV = (p) => { const v = mul(P, mul(V, [p[0], p[1], p[2], 1])); return [v[0] / v[3], v[1] / v[3]]; };
      mesh.centre.forEach((Cc, k) => { const n = Cc.length / 3; for (let i = 0; i < n; i += 3) { const q = PV([Cc[i * 3], Cc[i * 3 + 1], Cc[i * 3 + 2]]);
        const dx = (q[0] - st.mx) * asp, dy = q[1] - st.my, d = dx * dx + dy * dy; if (d < best) { best = d; bu = i / (n - 1); br = k; } } });
      const dist = Math.sqrt(best), k = calm ? 0 : sstep(Rn.pulseReach * (1 + st.stretch), 0.03, dist) * Rn.pulse * (1 + st.stretch * 0.6);
      let du = bu - st.pulseU; if (FORM.closed) du -= Math.round(du);
      const kp = 1 - Math.exp(-dt * 10); st.pulseU += du * kp; if (FORM.closed) st.pulseU -= Math.floor(st.pulseU);
      st.pulseK += (k - st.pulseK) * (1 - Math.exp(-dt * (k > st.pulseK ? 12 : 4))); st.pulseR += (br - st.pulseR) * kp; }

    if (F.signal && !calm && st.speed > 2.2 && st.t - st.lastWave > 0.9 && st.pulseK > 0.2) { st.waveU = st.pulseU; st.waveT = st.t; st.lastWave = st.t; }
    // 1. scene: ribbons (opaque, depth) + dust (additive) into the multisampled buffer, resolve to fb.scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb.ms.f); gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
    gl.useProgram(P_R.p); gl.bindVertexArray(mesh.vao);
    gl.uniformMatrix4fv(P_R.u.uProj, false, P); gl.uniformMatrix4fv(P_R.u.uView, false, V);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_NOISE); gl.uniform1i(P_R.u.uN, 0);
    gl.uniform1f(P_R.u.uEdge, Rn.edge); gl.uniform1f(P_R.u.uPulseU, st.pulseU); gl.uniform1f(P_R.u.uPulseW, Rn.pulseWidth * (1 + st.stretch * 1.2));
    gl.uniform1f(P_R.u.uPulseK, st.pulseK); gl.uniform1f(P_R.u.uPulseR, st.pulseR); gl.uniform1f(P_R.u.uRidSpread, FORM.ridSpread); gl.uniform1f(P_R.u.uClosed, FORM.closed ? 1 : 0);
    gl.uniform1f(P_R.u.uOrigin, F.originGlow || 0); gl.uniform4fv(P_R.u.uLight, Rn.light);
    gl.uniform4f(P_R.u.uWave, st.waveU, st.t - st.waveT, F.signalSpeed || 0, (F.signal && !calm) ? (F.signalLife || 0) : 0); gl.uniform1f(P_R.u.uTime, tt); gl.uniform1f(P_R.u.uTravel, F.travelSpeed * flowK); gl.uniform1f(P_R.u.uTravelK, calm ? 0 : Rn.travel); gl.uniform1f(P_R.u.uTravelW, 0.05);
    gl.drawElements(gl.TRIANGLES, mesh.nIdx, gl.UNSIGNED_INT, 0);
    gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(P_P.p); gl.bindVertexArray(V_D); gl.uniformMatrix4fv(P_P.u.uProj, false, P); gl.uniformMatrix4fv(P_P.u.uView, false, V);
    gl.uniform1f(P_P.u.uTime, tt); gl.uniform1f(P_P.u.uDpr, W / hero.getBoundingClientRect().width); gl.drawArrays(gl.POINTS, 0, N_DOTS);
    gl.depthMask(true); gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fb.ms.f); gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb.scene.f);
    gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    // 2. glow: half-res blur (tight) and quarter-res blur (wide)
    gl.useProgram(P_BLUR.p); gl.bindVertexArray(V_Q); gl.activeTexture(gl.TEXTURE0); gl.uniform1i(P_BLUR.u.uT, 0);
    const blur = (src, a, b, rad) => { gl.bindFramebuffer(gl.FRAMEBUFFER, a.f); gl.viewport(0, 0, a.w, a.h); gl.bindTexture(gl.TEXTURE_2D, src.t); gl.uniform2f(P_BLUR.u.uDir, rad / a.w, 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.bindFramebuffer(gl.FRAMEBUFFER, b.f); gl.bindTexture(gl.TEXTURE_2D, a.t); gl.uniform2f(P_BLUR.u.uDir, 0, rad / b.h); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    blur(fb.scene, fb.h1, fb.h2, 1.6 * Rn.glowRadius); blur(fb.h2, fb.q1, fb.q2, 2.2 * Rn.glowRadius); blur(fb.q2, fb.q1, fb.q2, 2.2 * Rn.glowRadius);
    // 3. composite
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
    gl.useProgram(P_COMP.p); gl.bindVertexArray(V_Q);
    [[fb.scene.t, "uS"], [fb.h2.t, "uG1"], [fb.q2.t, "uG2"], [T_NOISE, "uN"]].forEach(([t, n], i) => { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, t); gl.uniform1i(P_COMP.u[n], i); });
    gl.uniform1f(P_COMP.u.uGlow, Rn.glow); gl.uniform1f(P_COMP.u.uGlowW, Rn.glowWide); gl.uniform1f(P_COMP.u.uHaze, Rn.haze); gl.uniform1f(P_COMP.u.uHazeSize, Rn.hazeSize);
    gl.uniform2f(P_COMP.u.uHazeC, Rn.hazeCenter[0] + st.sx * 0.03, Rn.hazeCenter[1] + st.sy * 0.02); gl.uniform2f(P_COMP.u.uAsp, asp, 1);
    gl.uniform1f(P_COMP.u.uFloor, Rn.floor); gl.uniform1f(P_COMP.u.uGrain, Rn.grain); gl.uniform1f(P_COMP.u.uExp, Rn.exposure); gl.uniform1f(P_COMP.u.uGam, Rn.gamma); gl.uniform1f(P_COMP.u.uPal, Rn.palette);
    const w = Rn.warm; gl.uniform3fv(P_COMP.u.uStops, Rn.stops); gl.uniform3fv(P_COMP.u.uWd, w.dark); gl.uniform3fv(P_COMP.u.uWm, w.mid); gl.uniform3fv(P_COMP.u.uWh, w.hi); gl.uniform3fv(P_COMP.u.uWt, w.top);
    const dpr = W / hero.getBoundingClientRect().width;
    gl.uniform1f(P_COMP.u.uScrim, showText ? Rn.scrim : 0); gl.uniform1f(P_COMP.u.uFeather, Rn.scrimFeather * dpr); gl.uniform4fv(P_COMP.u.uSafe, safe); gl.uniform2f(P_COMP.u.uRes, W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function frame(t) { raf = 0; const dt = Math.min((t - last) / 1000, 1 / 20); last = t; draw(dt); if (visible && !calm) raf = requestAnimationFrame(frame); }
  const kick = () => { if (!raf && visible && !calm) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  addEventListener("pointermove", e => { const r = hero.getBoundingClientRect();
    st.mx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)); st.my = Math.max(-1, Math.min(1, 1 - ((e.clientY - r.top) / r.height) * 2));
    if (st.lastPX !== null) { const dtp = Math.max((e.timeStamp - st.lastPT) / 1000, 1 / 240);
      const v = Math.hypot(e.clientX - st.lastPX, e.clientY - st.lastPY) / r.width / dtp; st.speed = Math.max(st.speed, Math.min(v, 6)); }
    st.lastPX = e.clientX; st.lastPY = e.clientY; st.lastPT = e.timeStamp; kick(); }, { passive: true });
  hero.addEventListener("pointerdown", e => { if (e.target.closest("a, button, input, select, textarea")) return; const F = CFG.forms[CFG.form]; if (!F.signal || calm) return;
    const r = hero.getBoundingClientRect(); st.mx = ((e.clientX - r.left) / r.width) * 2 - 1; st.my = 1 - ((e.clientY - r.top) / r.height) * 2;
    st.waveU = st.pulseK > 0.15 ? Math.max(0, st.pulseU - 0.02) : 0; st.waveT = st.t; st.lastWave = st.t; kick(); }, { passive: true });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
  addEventListener("scroll", () => { const now = performance.now(), d = Math.abs(scrollY - st.lastScroll), dtS = Math.max((now - st.lastScrollT) / 1000, 1 / 120);
    st.scrollV = Math.max(st.scrollV, Math.min(d / dtS, 4000)); st.lastScroll = scrollY; st.lastScrollT = now;
    st.scrollZ = Math.min(CFG.render.scrollTravelMax, scrollY * CFG.render.scrollTravel); kick(); }, { passive: true });
  addEventListener("resize", () => { resize(); draw(0); });

  // note bar
  const $ = id => document.getElementById(id);
  ["braid", "loop", "unroll"].forEach(n => { const b = $("f-" + n); if (b) b.onclick = () => { setForm(n); kick(); }; });
  const bPal = $("pal"), bCalm = $("calm"), bText = $("text"), bSpd = $("spd"), bScr = $("scr");
  const labels = () => { if (bPal) bPal.textContent = "Palette: " + (CFG.render.palette ? "orange" : "mono"); if (bCalm) bCalm.textContent = "Reduce Motion: " + (calm ? "on" : "off");
    if (bText) bText.textContent = showText ? "Hide text" : "Show text"; if (bSpd) bSpd.textContent = "Speed pulse: " + (CFG.render.speedPulse ? "on" : "off"); if (bScr) bScr.textContent = "Scroll warp: " + (CFG.render.scrollWarp ? "on" : "off"); };
  if (bPal) bPal.onclick = () => { CFG.render.palette = 1 - CFG.render.palette; labels(); draw(0); };
  if (bCalm) bCalm.onclick = () => { calm = !calm; st.sx = st.sy = 0; labels(); if (calm) draw(0); else kick(); };
  if (bText) bText.onclick = () => { showText = !showText; const c = document.querySelector(".solutions-hero-wrapper"), n = document.querySelector(".navigation-bar"); if (c) c.style.visibility = showText ? "" : "hidden"; if (n) n.style.visibility = showText ? "" : "hidden"; labels(); draw(0); };
  if (bSpd) bSpd.onclick = () => { CFG.render.speedPulse = !CFG.render.speedPulse; labels(); };
  if (bScr) bScr.onclick = () => { CFG.render.scrollWarp = !CFG.render.scrollWarp; labels(); draw(0); };
  labels();

  setForm(CFG.form); kick();
  if (document.fonts) document.fonts.ready.then(() => { resize(); draw(0); });
  window.__leadleHero = { CFG, st, setForm, draw: () => draw(0), get msaa() { return msaa; }, get verts() { return mesh.data.length / STRIDE; }, get mesh() { return mesh; } };
}
  function mount() {
    var hero = document.querySelector(".section_solutions-hero");
    if (!hero || document.getElementById("lh-fx")) return;
    hero.dataset.keepCopy = "1";
    var img = document.createElement("img"); img.className = "fallback"; img.alt = ""; img.setAttribute("aria-hidden", "true"); img.src = FALLBACK;
    var cv = document.createElement("canvas"); cv.id = "lh-fx"; cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(img, hero.firstChild); hero.insertBefore(cv, img.nextSibling);   // the still sits under the canvas while it boots, and alone when it cannot run
    try { run(); } catch (e) { hero.classList.add("static"); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
