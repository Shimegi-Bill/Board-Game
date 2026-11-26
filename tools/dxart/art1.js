/* 畫中有話卡圖 v3 基本工具（DXA）：漸變、濾鏡（立體打光 vol、手繪邊 wob、雲 cl）、碎形雲、受光雲 litCloud、天空、月、雲、雲海、海、城市
 * 每張卡 200×300；兩次畫：第一次記低月／日位置（光源），第二次所有立體打光同雲都向住光源 */
const DXA = (() => {
  let R = Math.random, D = [], N = 0;
  const mul = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const rn = (a, b) => a + R() * (b - a);
  const f = (n) => Math.round(n * 10) / 10;
  const sid = () => 'q' + (N++).toString(36);
  const stp = (s) => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lin = (s, x1 = 0, y1 = 0, x2 = 0, y2 = 1) => { const i = sid(); D.push(`<linearGradient id="${i}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stp(s)}</linearGradient>`); return `url(#${i})`; };
  const rad = (s, cx = 0.5, cy = 0.5, r = 0.5) => { const i = sid(); D.push(`<radialGradient id="${i}" cx="${cx}" cy="${cy}" r="${r}">${stp(s)}</radialGradient>`); return `url(#${i})`; };
  const G = (t, c, o) => `<g${t ? ` transform="${t}"` : ''}${o != null ? ` opacity="${o}"` : ''}>${c}</g>`;
  const at = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)})${s !== 1 ? ` scale(${f(s * 100) / 100})` : ''}${r ? ` rotate(${r})` : ''}`;
  const P = (d, fill, ex = '') => `<path d="${d}" fill="${fill}"${ex}/>`;
  const C = (x, y, r, fill, ex = '') => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${ex}/>`;
  const E = (x, y, rx, ry, fill, ex = '') => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${ex}/>`;
  const Rc = (x, y, w, h, fill, ex = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}"${ex}/>`;
  const st = (c, w, ex = '') => ` stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${ex}`;
  /* v2 濾鏡（預先整圖，唔使理手機效能）：vol 立體打光、wob 手繪邊、雲、霧 */
  let FL = {}, SEED = 1, LP = null, LPN = null;   // LP：今次用嘅光源；LPN：試畫時記低
  const light = () => LP || [100, 90];
  const flt = (k) => {
    if (FL[k]) return `url(#${FL[k]})`;
    const i = sid(); FL[k] = i;
    if (k === 'vol') { const [lx, ly] = light(); D.push(`<filter id="${i}" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB"><feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="b"/><feDiffuseLighting in="b" surfaceScale="3.5" diffuseConstant="1" lighting-color="#fff" result="d"><fePointLight x="${lx}" y="${ly}" z="80"/></feDiffuseLighting><feSpecularLighting in="b" surfaceScale="3.5" specularConstant=".38" specularExponent="18" lighting-color="#fff1cc" result="s"><fePointLight x="${lx}" y="${ly}" z="70"/></feSpecularLighting><feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1" k2=".2" result="m"/><feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="m" in2="s2" operator="arithmetic" k2="1" k3=".4" result="o"/><feComposite in="o" in2="SourceAlpha" operator="in"/></filter>`); }
    else if (k === 'wob') D.push(`<filter id="${i}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".055" numOctaves="2" seed="${SEED}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    else if (k === 'cl') D.push(`<filter id="${i}" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="1.8" result="b"/><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="${SEED}" result="n"/><feDisplacementMap in="b" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>`);
    else if (k === 'soft') D.push(`<filter id="${i}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7"/></filter>`);
    else if (k === 'far') D.push(`<filter id="${i}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".7"/></filter>`);
    return `url(#${i})`;
  };
  /* 碎形雲層：雜訊變透明度，再染色（c 顏色、a 濃度、fx／fy 雲嘅闊窄） */
  const clouds = (y0, y1, c = '#ffffff', a = 0.5, fx = 0.011, fy = 0.032, sd = 0) => {
    const i = sid(), m = sid();
    const hx = c.replace('#', ''), r = parseInt(hx.slice(0, 2), 16) / 255, gg = parseInt(hx.slice(2, 4), 16) / 255, b = parseInt(hx.slice(4, 6), 16) / 255;
    D.push(`<filter id="${i}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="5" seed="${SEED * 7 + sd}"/><feColorMatrix type="matrix" values="0 0 0 0 ${f(r * 100) / 100} 0 0 0 0 ${f(gg * 100) / 100} 0 0 0 0 ${f(b * 100) / 100} ${f(a * 3.2 * 100) / 100} 0 0 0 ${f(-a * 1.45 * 100) / 100}"/></filter><linearGradient id="${m}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity="1"/><stop offset=".75" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="${y0}" width="200" height="${y1 - y0}"><rect x="0" y="${y0}" width="200" height="${y1 - y0}" fill="url(#${m}g)"/></mask>`);
    return `<g mask="url(#${m})"><rect x="0" y="${y0}" width="200" height="${y1 - y0}" filter="url(#${i})"/></g>`;
  };
  /* 光照立體雲：雜訊做高度，點光源喺月／日；a 濃度、z 光源高度 */
  const litCloud = (y0, y1, base, lc, fx, fy, a, sd, z = 40) => {
    const i = sid(), m = sid(), [lx, ly] = light();
    D.push(`<filter id="${i}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${fx} ${fy}" numOctaves="4" seed="${SEED * 13 + sd}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${a} 0 0 0 ${f(-a * 0.48 * 100) / 100}" result="al"/><feGaussianBlur in="al" stdDeviation="2.4" result="ab"/><feDiffuseLighting in="ab" surfaceScale="4.5" diffuseConstant="1.2" lighting-color="${lc}" result="li"><fePointLight x="${lx}" y="${ly}" z="${z}"/></feDiffuseLighting><feFlood flood-color="${base}" result="bc"/><feComposite in="li" in2="bc" operator="arithmetic" k1="1" k2=".28" result="col"/><feGaussianBlur in="al" stdDeviation="1.2" result="al2"/><feComposite in="col" in2="al2" operator="in"/></filter><linearGradient id="${m}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="${y0}" width="200" height="${y1 - y0}"><rect y="${y0}" width="200" height="${y1 - y0}" fill="url(#${m}g)"/></mask>`);
    return `<g mask="url(#${m})"><rect y="${y0}" width="200" height="${y1 - y0}" filter="url(#${i})"/></g>`;
  };
  const mixc = (a, b, t) => { const p = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, j) => Math.round(v + (y[j] - v) * t).toString(16).padStart(2, '0')).join(''); };
  /* 天空色盤：上、中、下、光 */
  const PAL = {
    night: ['#0a0f30', '#212d68', '#4b4f92', '#ffe9a8'],
    dusk: ['#291a4d', '#88407a', '#f39062', '#ffd38a'],
    dawn: ['#22305e', '#7b6fb3', '#f6bba3', '#fff0c8'],
    teal: ['#03202d', '#0d4858', '#3e8d8a', '#d8fff2'],
    rose: ['#381c3e', '#b05b7c', '#f4c3b1', '#fff1e4'],
    gold: ['#3a2914', '#a8692b', '#f6c97c', '#fff2c2'],
    day: ['#5fa6c4', '#a6d8d0', '#f4ecd0', '#ffffff'],
    lav: ['#2b2451', '#6b60aa', '#c8b8e8', '#fff3ff'],
    storm: ['#181d29', '#3a4555', '#6e7c88', '#dfe8ff'],
    sea: ['#03131f', '#0a344e', '#1f6e86', '#bff6ff'],
    aur: ['#040a1c', '#0a2236', '#163a4a', '#c8ffe8'],
    fall: ['#2d1911', '#8b3b20', '#e8a45c', '#ffe1a8'],
    snow: ['#293450', '#6e86a9', '#d9e3f0', '#ffffff'],
    red: ['#290a13', '#7a1a2b', '#da573e', '#ffd38a'],
    mint: ['#1d3b3a', '#4f8f7f', '#cfe9cf', '#fffbe0'],
    peach: ['#4a2d4a', '#d5807a', '#fbd6a8', '#fff6dd'],
  };
  const sky = (k, glowY = 0.75) => {
    const p = PAL[k] || PAL.night, [lx, ly] = LP || [100, glowY * 300], day = ['day', 'mint', 'peach', 'gold', 'dawn', 'rose'].includes(k);
    let h = Rc(0, 0, 200, 300, lin([[0, p[0]], [0.5, p[1]], [0.85, p[2]], [1, mixc(p[2], p[3], 0.3)]]));
    h += clouds(0, 300, p[1], 0.22, 0.006, 0.02, 1);
    h += Rc(0, 0, 200, 300, rad([[0, p[3], 0.5], [0.22, p[3], 0.2], [1, p[3], 0]], lx / 200, ly / 300, 0.62));
    h += litCloud(0, 170, mixc(p[0], p[1], 0.6), mixc(p[3], '#ffffff', 0.4), 0.006, 0.02, day ? 2.0 : 2.1, 3, 34);
    h += litCloud(80, 230, mixc(p[1], p[2], 0.5), mixc(p[3], '#ffffff', 0.25), 0.009, 0.03, day ? 1.9 : 1.7, 8, 46);
    return h;
  };
  const glow = (x, y, r, c = '#ffe9a8', a = 0.55) => C(x, y, r, rad([[0, c, a], [0.45, c, a * 0.35], [1, c, 0]]));
  const stars = (n, y0 = 0, y1 = 170, c = '#fff8e0') => {
    let h = '';
    for (let i = 0; i < n; i++) { const x = rn(4, 196), y = rn(y0, y1), r = R() < 0.12 ? rn(1, 1.6) : rn(0.35, 0.9); h += C(x, y, r, c, ` opacity="${f(rn(0.45, 1))}"`); }
    for (let i = 0; i < Math.max(1, n / 18); i++) { const x = rn(15, 185), y = rn(y0, y1 * 0.8), s = rn(2.5, 4.5); h += P(`M${f(x)} ${f(y - s)}Q${f(x)} ${f(y)} ${f(x + s)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + s)}Q${f(x)} ${f(y)} ${f(x - s)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y - s)}Z`, c, ' opacity=".9"'); }
    return h;
  };
  const moon = (x, y, r, kind = 'full', c = '#fff3cf', bg = '#1d2552') => {
    if (!LPN) LPN = [x, y];
    let h = glow(x, y, r * 3.2, c, 0.35) + C(x, y, r, rad([[0, '#fffbea'], [0.7, c], [1, '#e9cf8f']], 0.4, 0.38, 0.7));
    if (kind === 'full') { const cp = sid(); D.push(`<clipPath id="${cp}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/></clipPath>`); return h + C(x - r * 0.3, y - r * 0.15, r * 0.18, '#e8d39a', ' opacity=".55"') + C(x + r * 0.25, y + r * 0.3, r * 0.12, '#e8d39a', ' opacity=".5"') + C(x + r * 0.35, y - r * 0.35, r * 0.08, '#e8d39a', ' opacity=".45"') + `<g clip-path="url(#${cp})" opacity=".55">${clouds(y - r, y + r, '#c9b27a', 0.6, 0.09, 0.09, 9)}</g>` + C(x - r * 0.35, y - r * 0.4, r * 0.35, '#fffdf2', ' opacity=".35"') + C(x, y, r * 1.12, 'none', st(c, r * 0.12, ' opacity=".18"')); }
    // 彎月：用遮罩挖走一個圓（唔好用深色圓遮，同天空顏色唔夾）
    const i = sid(); D.push(`<mask id="${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="300"><rect width="200" height="300" fill="#fff"/><circle cx="${f(x + r * 0.45)}" cy="${f(y - r * 0.25)}" r="${f(r * 0.92)}" fill="#000"/></mask>`);
    return glow(x, y, r * 3.2, c, 0.3) + `<g mask="url(#${i})">${C(x, y, r, rad([[0, '#fffbea'], [0.7, c], [1, '#e9cf8f']], 0.4, 0.38, 0.7))}</g>`;
  };
  const cloud = (x, y, s = 1, c = '#fdf3ff', sh = '#c9b6e6', a = 1) => {
    const [lx, ly] = light(), dx = lx - x, dy = ly - y, dl = Math.hypot(dx, dy) || 1, ux = dx / dl, uy = dy / dl;
    let b = E(0, 2, 44, 9, sh, ' opacity=".8"');
    for (let i = 0; i < 16; i++) { const t = i / 15, px = -36 + t * 72 + rn(-5, 5), pr = (9 + Math.sin(t * Math.PI) * 11) * rn(0.75, 1.15), py = -pr * 0.55 + rn(-3, 3); b += C(px, py, pr, rad([[0, mixc(c, '#ffffff', 0.5)], [0.5, c], [1, sh]], 0.5 + ux * 0.28, 0.5 + uy * 0.28, 0.62)); }
    return `<g transform="${at(x, y, s)}" opacity="${a}" filter="${flt('cl')}">${b}</g>`;
  };
  const cloudSea = (y, c = '#f4e8ff', sh = '#a993d0') => {
    let h = Rc(0, y + 6, 200, 300 - y, lin([[0, sh], [1, mixc(sh, '#000000', 0.25)]]));
    for (let row = 0; row < 3; row++) for (let i = -1; i < 7; i++) h += cloud(i * 34 + rn(-8, 8) + row * 12, y + 8 + row * 26, 0.62 + row * 0.18, c, sh);
    return h + litCloud(y, 300, sh, c, 0.02, 0.05, 2.2, 11, 60);
  };
  const sea = (y, c1 = '#12305a', c2 = '#061226', shine = '#ffe9a8', sx = 100) => {
    let h = Rc(0, y, 200, 300 - y, lin([[0, c1], [1, c2]]));
    for (let i = 0; i < 9; i++) { const yy = y + 6 + i * i * 1.6 + rn(0, 2), w = 10 + i * 6; h += Rc(sx - w / 2 + rn(-4, 4), yy, w, 1.2 + i * 0.12, shine, ` opacity="${f(0.55 - i * 0.05)}" rx="1"`); }
    for (let i = 0; i < 14; i++) { const yy = rn(y + 8, 300), x = rn(0, 200); h += P(`M${f(x)} ${f(yy)}q4-2 8 0`, 'none', st('#ffffff', 0.7, ' opacity=".18"')); }
    h += clouds(y, 300, '#ffffff', 0.16, 0.006, 0.18, 4) + clouds(y, 300, c2, 0.35, 0.01, 0.12, 5);
    if (LP) sx = LP[0];
    for (let i = 0; i < 26; i++) { const yy = y + 3 + Math.pow(i / 26, 1.6) * (300 - y), w = 3 + rn(2, 6) * (1 + i / 10); h += Rc(sx - w / 2 + rn(-6, 6) * (1 + i / 12), yy, w, 0.9 + i * 0.05, shine, ` opacity="${f(Math.max(0.12, 0.7 - i * 0.022))}" rx=".5"`); }
    return h + Rc(0, y - 2, 200, 6, lin([[0, shine, 0], [0.5, shine, 0.18], [1, shine, 0]]));
  };
  const hills = (y, c1, c2, amp = 14, seed = 0) => {
    const k = 0.04 + seed * 0.01;
    let d = `M0 ${y}`;
    for (let x = 0; x <= 200; x += 20) d += ` Q${x + 10} ${f(y - amp * Math.sin((x + seed * 37) * k) - amp * 0.5)} ${x + 20} ${f(y - amp * 0.3 * Math.cos((x + 20) * k * 1.7))}`;
    const cp = sid(); D.push(`<clipPath id="${cp}"><path d="${d} V300 H0Z"/></clipPath>`);
    return P(d + ' V300 H0Z', lin([[0, c1], [1, c2]])) + `<g clip-path="url(#${cp})">${clouds(y - amp * 2, 300, c1, 0.35, 0.03, 0.06, 6)}${clouds(y - amp * 2, 300, '#000000', 0.25, 0.05, 0.03, 7)}</g>` + Rc(0, y - amp * 1.5, 200, amp * 2.5, lin([[0, '#ffffff', 0], [0.5, '#ffffff', 0.07], [1, '#ffffff', 0]]));
  };
  /* 香港式高樓：密密麻麻、窗口亮燈 */
  const city = (y, c = '#151a3a', win = '#ffd98a', dens = 1, x0 = 0, x1 = 200) => {
    const row = (yb, col, dd, wa, op) => {
      let h = '', x = x0;
      while (x < x1) {
        const w = rn(8, 18), ht = rn(26, 92) * dd, top = yb - ht;
        h += Rc(x, top, w + 0.5, ht + 2, lin([[0, mixc(col, '#8a90b8', 0.18)], [1, col]]));
        if (R() < 0.3) h += Rc(x + w * 0.45, top - rn(4, 10), 1, 10, col) + C(x + w * 0.45 + 0.5, top - 10, 0.9, '#ff5a4a');
        for (let wy = top + 3; wy < yb - 2; wy += 3.6) for (let wx = x + 1.6; wx < x + w - 1.6; wx += 2.8) if (R() < wa) h += Rc(wx, wy, 1.4, 1.8, R() < 0.82 ? win : '#bfe0ff', ` opacity="${f(rn(0.45, 1))}"`);
        x += w + rn(0, 1.5);
      }
      return `<g opacity="${op}">${h}</g>`;
    };
    return `<g filter="${flt('far')}">${row(y - 8, mixc(c, '#6a70a0', 0.3), dens * 1.15, 0.16, 0.7)}</g>` + Rc(x0, y - 50, x1 - x0, 50, lin([[0, '#c8c0d8', 0], [1, '#c8c0d8', 0.16]])) + row(y, c, dens, 0.3, 1);
  };
  const vign = (a = 0.55) => Rc(0, 0, 200, 300, rad([[0.55, '#000', 0], [1, '#000', a]], 0.5, 0.5, 0.75));
  const grain = () => { let h = ''; for (let i = 0; i < 70; i++) h += C(rn(0, 200), rn(0, 300), rn(0.3, 0.8), R() < 0.5 ? '#fff' : '#000', ` opacity="${f(rn(0.03, 0.08))}"`); return h; };
  const motes = (n, c = '#ffe9a8', y0 = 0, y1 = 300) => { let h = ''; for (let i = 0; i < n; i++) { const x = rn(5, 195), y = rn(y0, y1), r = rn(0.8, 2); h += glow(x, y, r * 4, c, 0.5) + C(x, y, r * 0.6, '#fffdf0'); } return h; };
  const birds = (n, x0, y0, s = 1, c = '#1b1b2e', spread = 50) => { let h = ''; for (let i = 0; i < n; i++) { const x = x0 + rn(-spread, spread), y = y0 + rn(-spread * 0.5, spread * 0.5), k = s * rn(0.6, 1.1); h += P(`M${f(x - 6 * k)} ${f(y)}q${f(3 * k)}-${f(3.4 * k)} ${f(6 * k)} 0q${f(3 * k)}-${f(3.4 * k)} ${f(6 * k)} 0`, 'none', st(c, 1.3 * k)); } return h; };
  return { set: (c, keep) => { R = mul(c * 7919 + 17); D = []; N = 0; FL = {}; SEED = c + 1; if (keep) { LP = LPN; } else { LP = null; LPN = null; } }, probe: () => LPN, setLight: (x, y) => { if (!LPN) LPN = [x, y]; }, motes: (...a) => motes(...a), defs: () => D.join(''), flt, clouds, litCloud, mixc, light, mul, rn, f, lin, rad, G, at, P, C, E, Rc, st, sky, glow, stars, moon, cloud, cloudSea, sea, hills, city, vign, grain, motes, birds, PAL, R: () => R() };
})();
