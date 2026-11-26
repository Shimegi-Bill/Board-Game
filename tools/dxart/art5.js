/* 畫中有話 v3：環境（每張卡用一套做底：前中後景、霧、光、倒影），再放主角 */
const DXK = (() => {
  const A = DXA, O = DXO, { rn, f, lin, rad, P, C, E, Rc, st, glow, stars, moon, cloud, clouds, litCloud, mixc, flt } = A;
  const PAL = A.PAL;
  const blurF = (s) => { const k = 'b' + s; return A.flt(k); };
  /* 山脊：幾個正弦加隨機起伏 */
  const ridge = (y, amp, rough = 1, x0 = -5, x1 = 205, step = 3) => {
    const a1 = rn(0, 6), a2 = rn(0, 6), a3 = rn(0, 6), k1 = rn(0.012, 0.025), k2 = rn(0.04, 0.07), k3 = rn(0.12, 0.2);
    let d = `M${x0} 300V${f(y)}`;
    for (let x = x0; x <= x1; x += step) d += `L${x} ${f(y - amp * (0.55 + 0.45 * Math.sin(x * k1 + a1)) - amp * 0.28 * rough * Math.sin(x * k2 + a2) - amp * 0.09 * rough * Math.sin(x * k3 + a3) - rn(0, amp * 0.04 * rough))}`;
    return d + `L${x1} 300Z`;
  };
  /* 一層層山：遠嘅淡（空氣感），之間有霧 */
  const mtns = (n, yTop, yBot, cFar, cNear, haze, ampTop = 40, ampBot = 18) => {
    let h = '';
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 1 : i / (n - 1), y = yTop + (yBot - yTop) * t, amp = ampTop + (ampBot - ampTop) * t, col = mixc(cFar, cNear, t);
      h += P(ridge(y, amp, 1 + t), lin([[0, mixc(col, haze, 0.15)], [0.6, col], [1, mixc(col, '#000000', 0.2)]]));
      h += clouds(y - amp, y + 40, haze, 0.18 + 0.1 * (1 - t), 0.008, 0.06, 20 + i);
      h += Rc(0, y - amp * 0.3, 200, amp * 0.8 + 10, lin([[0, haze, 0], [0.5, haze, 0.16 * (1 - t) + 0.05], [1, haze, 0]]));
    }
    return h;
  };
  /* 前景草：好多條彎曲草葉 */
  const grass = (y0, y1, c1, c2, n = 160, hi = 10) => {
    let h = '';
    for (let i = 0; i < n; i++) { const x = rn(-4, 204), y = rn(y0, y1), t = (y - y0) / Math.max(1, y1 - y0), ht = hi * (0.6 + t * 0.9) * rn(0.6, 1.3), bend = rn(-ht * 0.5, ht * 0.5); h += P(`M${f(x)} ${f(y)}q${f(bend * 0.3)} ${f(-ht * 0.6)} ${f(bend)} ${f(-ht)}`, 'none', st(mixc(c1, c2, rn(0, 1)), 0.5 + t * 0.9, ` opacity="${f(0.6 + t * 0.4)}"`)); }
    return h;
  };
  const flowers = (y0, y1, cols, n = 40) => { let h = ''; for (let i = 0; i < n; i++) { const x = rn(0, 200), y = rn(y0, y1), t = (y - y0) / Math.max(1, y1 - y0), r = 0.6 + t * 1.4, c = cols[i % cols.length]; h += C(x, y, r * 1.8, c, ' opacity=".25"') + C(x, y, r, c) + C(x - r * 0.3, y - r * 0.3, r * 0.4, '#ffffff', ' opacity=".6"'); } return h; };
  const rock = (x, y, s, c = '#3a3a4a') => `<g transform="translate(${f(x)} ${f(y)}) scale(${s})" filter="${flt('vol')}">${P(`M-14 0Q-15-8-8-12Q-2-17 6-13Q14-10 15-3Q15 0 12 0Z`, lin([[0, mixc(c, '#ffffff', 0.25)], [1, mixc(c, '#000000', 0.2)]]))}${P('M-6-10Q0-12 4-9', 'none', st(mixc(c, '#ffffff', 0.4), 0.8, ' opacity=".5"'))}</g>`;
  const reeds = (x, y, n, c = '#1a2a22') => { let h = ''; for (let i = 0; i < n; i++) { const xx = x + rn(-10, 10), ht = rn(14, 30), b = rn(-4, 4); h += P(`M${f(xx)} ${y}q${f(b * 0.4)} ${f(-ht * 0.6)} ${f(b)} ${f(-ht)}`, 'none', st(c, rn(0.5, 1))); if (R() < 0.4) h += E(xx + b, y - ht, 0.9, 3, mixc(c, '#6a4a2a', 0.5)); } return h; };
  const R = A.R;
  /* 一排樹（遠景圓樹剪影） */
  const treeLine = (y, c, n = 16, s = 1) => { let h = ''; for (let i = 0; i < n; i++) { const x = (i / (n - 1)) * 210 - 5 + rn(-4, 4), r = rn(6, 11) * s; h += C(x, y - r * 0.8, r, c) + C(x + r * 0.5, y - r * 0.4, r * 0.8, c); } return h + Rc(0, y - 2, 200, 300 - y + 2, c); };
  const pineRow = (y, c, n, s, snow) => { let h = ''; for (let i = 0; i < n; i++) h += `<g transform="translate(${f((i / (n - 1)) * 220 - 10 + rn(-5, 5))} ${f(y + rn(-3, 3))}) scale(${f(s * rn(0.7, 1.15) * 100) / 100})">${O.pine(c, snow)}</g>`; return h; };
  /* 光束 */
  const rays = (x, y, n, c, a = 0.12, spread = 1, len = 320, dir = 90) => { let h = ''; for (let i = 0; i < n; i++) { const t = ((dir + (i - (n - 1) / 2) * 9 * spread) * Math.PI) / 180, w = rn(0.03, 0.07); h += P(`M${x} ${y}L${f(x + Math.cos(t - w) * len)} ${f(y + Math.sin(t - w) * len)}L${f(x + Math.cos(t + w) * len)} ${f(y + Math.sin(t + w) * len)}Z`, lin([[0, c, a], [1, c, 0]], 0.5 + Math.cos(t) * 0.0, 0, 0.5 + Math.cos(t) * 0.5, Math.max(0, Math.sin(t)))); } return `<g filter="${flt('cl')}">${h}</g>`; };
  /* 倒影：將一段畫上下反轉放喺水面下面 */
  const mirror = (content, yw, a = 0.45) => { const cp = 'mr' + Math.floor(R() * 1e9).toString(36); return `<defs><clipPath id="${cp}"><rect y="${yw}" width="200" height="${300 - yw}"/></clipPath></defs><g clip-path="url(#${cp})" opacity="${a}" filter="${flt('cl')}"><g transform="translate(0 ${2 * yw}) scale(1 -1)">${content}</g></g>`; };
  const fog = (y0, y1, c, a = 0.35) => clouds(y0, y1, c, a, 0.005, 0.05, 31) + Rc(0, y0, 200, y1 - y0, lin([[0, c, 0], [0.5, c, a * 0.4], [1, c, 0]]));
  const water = (y, c1, c2, lx, shine) => {
    let h = Rc(0, y, 200, 300 - y, lin([[0, c1], [1, c2]])) + clouds(y, 300, '#ffffff', 0.14, 0.006, 0.2, 4) + clouds(y, 300, c2, 0.3, 0.012, 0.15, 5);
    if (shine) for (let i = 0; i < 40; i++) { const t = i / 40, yy = y + 2 + Math.pow(t, 1.5) * (300 - y), w = (2 + t * 18) * rn(0.6, 1.4); h += Rc(lx - w / 2 + rn(-3, 3) * (1 + t * 5), yy, w, 0.5 + t * 1.5, shine, ` rx="1" opacity="${f(Math.max(0.1, 0.8 - t * 0.6) * rn(0.6, 1))}"`); }
    return h + Rc(0, y - 1.5, 200, 4, lin([[0, shine || '#ffffff', 0], [0.5, shine || '#ffffff', 0.22], [1, shine || '#ffffff', 0]], 0, 0, 1, 0));
  };
  /* 光源：月（kind 'full'／'cres'）或者日；冇就用 null */
  const src = (o) => (o.moon ? moon(o.moon[0], o.moon[1], o.moon[2] || 16, o.moon[3] || 'full') : o.sun ? (A.setLight(o.sun[0], o.sun[1]), glow(o.sun[0], o.sun[1], (o.sun[2] || 16) * 6, '#fff2c8', 0.55) + C(o.sun[0], o.sun[1], o.sun[2] || 16, rad([[0, '#fffbe8'], [0.8, '#ffe9a8'], [1, '#ffd27a']]))) : '');
  const K = {};
  /* 月夜海／日落海：遠島、海面光路、可加船 */
  K.sea = (o = {}) => { const p = PAL[o.pal || 'night'], hz = o.hz || 200, [lx] = A.light(); let h = A.sky(o.pal || 'night', 0.6) + (o.stars !== false ? stars(o.nstars || 70, 0, hz - 30) : '') + src(o);
    h += mtns(2, hz - 4, hz + 2, mixc(p[1], p[2], 0.4), mixc(p[0], p[1], 0.5), p[2], 14, 8) + water(hz + 2, mixc(p[1], p[0], 0.3), mixc(p[0], '#000000', 0.4), lx, mixc(p[3], '#ffffff', 0.3));
    return h; };
  /* 維港夜景：獅子山、密樓、燈倒影 */
  K.harbour = (o = {}) => { const p = PAL[o.pal || 'night'], hz = o.hz || 206, [lx] = A.light(); let h = A.sky(o.pal || 'night', 0.6) + stars(50, 0, 130) + src(o);
    h += P(ridge(hz - 24, 30, 1.3), mixc(p[0], p[1], 0.5)) + fog(hz - 50, hz - 10, mixc(p[2], '#ffffff', 0.2), 0.3);
    h += A.city(hz, mixc(p[0], '#000000', 0.2), '#ffd98a', o.dens || 0.8);
    h += water(hz, mixc(p[1], p[0], 0.4), mixc(p[0], '#000000', 0.5), lx, mixc(p[3], '#ffffff', 0.3));
    for (let i = 0; i < 60; i++) { const x = rn(0, 200), y = rn(hz + 3, 298), w = rn(2, 8); h += Rc(x, y, w, 0.6, R() < 0.85 ? '#ffd98a' : '#ff6a8a', ` opacity="${f(rn(0.15, 0.45))}"`); }
    return h; };
  /* 草地：遠山、樹林、花草、螢火 */
  K.meadow = (o = {}) => { const p = PAL[o.pal || 'dusk'], hz = o.hz || 200; let h = A.sky(o.pal || 'dusk', 0.7) + (o.stars ? stars(50, 0, 120) : '') + src(o);
    h += mtns(3, hz - 30, hz - 4, mixc(p[1], p[2], 0.5), mixc(p[0], '#1a3a2a', 0.5), p[2], 34, 14) + treeLine(hz + 6, mixc(p[0], '#14281e', 0.6), 18, 0.9);
    h += Rc(0, hz + 6, 200, 300 - hz, lin([[0, mixc('#3a5a3a', p[0], 0.4)], [1, mixc('#1a2a1a', '#000000', 0.3)]])) + grass(hz + 10, 300, mixc('#5a8a4a', p[3], 0.25), '#1a3a1a', 260, 12) + (o.flowers !== false ? flowers(hz + 20, 300, o.fc || ['#ffd27a', '#ff9ab0', '#ffffff', '#c8a0ff'], 50) : '');
    if (o.fireflies) h += A.motes(16, '#fff0a8', hz - 40, 290);
    return h; };
  /* 霧林：一排排松樹、霧、光束 */
  K.forest = (o = {}) => { const p = PAL[o.pal || 'teal'], snow = !!o.snow; let h = A.sky(o.pal || 'teal', 0.35) + src(o);
    if (o.rays) { const [lx, ly] = A.light(); h += rays(lx, ly, 7, mixc(p[3], '#ffffff', 0.3), 0.16, 1.4); }
    for (let r = 0; r < 4; r++) { const y = 170 + r * 34, col = mixc(mixc(p[1], p[2], 0.5), mixc(p[0], '#000000', 0.5), r / 3); h += pineRow(y, col, 9 - r, 1.3 + r * 0.45, snow) + fog(y - 30, y + 10, mixc(p[2], '#ffffff', 0.3), 0.3 - r * 0.05); }
    return h + Rc(0, 285, 200, 15, snow ? '#e8eef8' : mixc(p[0], '#000000', 0.6)); };
  /* 雪原 */
  K.snow = (o = {}) => { const p = PAL[o.pal || 'snow'], hz = o.hz || 215; let h = A.sky(o.pal || 'snow', 0.5) + src(o);
    h += mtns(3, hz - 40, hz - 8, mixc(p[1], '#ffffff', 0.4), mixc(p[1], '#ffffff', 0.7), '#ffffff', 36, 16);
    h += pineRow(hz, mixc(p[0], '#2a3a4a', 0.4), 8, 1.1, true) + P(ridge(hz + 8, 6, 0.6), lin([[0, '#f4f8ff'], [1, '#c8d4ec']])) + Rc(0, hz + 12, 200, 300, lin([[0, '#eef3fb'], [1, '#b8c8e4']]));
    for (let i = 0; i < 70; i++) h += C(rn(0, 200), rn(0, 300), rn(0.5, 1.6), '#ffffff', ` opacity="${f(rn(0.4, 0.9))}"`);
    return h; };
  /* 沙漠 */
  K.desert = (o = {}) => { const p = PAL[o.pal || 'night'], hz = o.hz || 215; let h = A.sky(o.pal || 'night', 0.7) + (o.stars !== false ? stars(110, 0, hz - 20) : '') + src(o);
    const dc = o.dc || ['#d8a066', '#a8643a', '#5a3018'];
    for (let i = 0; i < 4; i++) { const y = hz + i * 22; h += P(`M-5 ${y + 20}Q${50 + i * 20} ${y - 14} ${110 + i * 10} ${y + 4}T205 ${y - 6}V300H-5Z`, lin([[0, mixc(dc[0], p[2], 0.3 - i * 0.05)], [1, mixc(dc[2], '#000000', i * 0.1)]])) + P(`M-5 ${y + 20}Q${50 + i * 20} ${y - 14} ${110 + i * 10} ${y + 4}`, 'none', st(mixc(dc[0], '#ffffff', 0.4), 0.8, ' opacity=".5"')); }
    return h; };
  /* 雲海：山峰穿出 */
  K.cloudsea = (o = {}) => { const p = PAL[o.pal || 'gold'], hz = o.hz || 200; let h = A.sky(o.pal || 'gold', 0.6) + src(o);
    if (o.peaks !== false) h += P(ridge(hz - 10, 50, 1.6, -5, 80), lin([[0, mixc(p[1], '#ffffff', 0.2)], [1, mixc(p[0], '#000000', 0.2)]])) + P(ridge(hz - 4, 36, 1.4, 120, 205), lin([[0, mixc(p[1], '#ffffff', 0.25)], [1, mixc(p[0], '#000000', 0.2)]]));
    return h + A.cloudSea(hz, mixc(p[3], '#ffffff', 0.4), mixc(p[1], p[2], 0.5)); };
  /* 山湖倒影 */
  K.lake = (o = {}) => { const p = PAL[o.pal || 'dawn'], hz = o.hz || 190, [lx] = A.light(); const top = mtns(3, hz - 60, hz - 4, mixc(p[1], '#ffffff', 0.25), mixc(p[0], '#14281e', 0.5), p[2], 50, 14) + pineRow(hz + 2, mixc(p[0], '#10201a', 0.6), 10, 0.9, !!o.snow);
    let h = A.sky(o.pal || 'dawn', 0.6) + (o.stars ? stars(60, 0, 110) : '') + src(o) + top;
    h += water(hz, mixc(p[1], p[2], 0.3), mixc(p[0], '#000000', 0.3), lx, o.moon || o.sun ? mixc(p[3], '#ffffff', 0.3) : null) + mirror(top + src(o), hz, 0.42);
    return h + reeds(18, 300, 9) + reeds(188, 300, 7); };
  /* 香港霓虹街：唐樓、招牌、濕地倒影 */
  K.street = (o = {}) => { const p = PAL[o.pal || 'night']; let h = A.sky(o.pal || 'night', 0.4) + stars(20, 0, 60);
    const signs = o.signs || [['夢', '#ff5a8a'], ['茶', '#ffd25a'], ['冰室', '#5ad8ff'], ['押', '#ff7a4a'], ['藥', '#8aff9a']];
    h += `<g transform="translate(26 300) scale(1.6)" filter="${flt('vol')}">${O.tonglau(mixc('#8a6a5a', p[1], 0.4), '#ffd98a', 5)}</g><g transform="translate(176 300) scale(1.6)" filter="${flt('vol')}">${O.tonglau(mixc('#6a5a6a', p[1], 0.4), '#ffc87a', 5)}</g>`;
    signs.forEach(([t, c], i) => { h += `<g transform="translate(${i % 2 ? 150 - i * 4 : 50 + i * 4} ${130 + i * 26}) scale(${f(0.9 - i * 0.08)})">${O.neon(t, c)}</g>`; });
    h += Rc(0, 255, 200, 45, lin([[0, '#1a1a2a'], [1, '#08080e']])) + mirror(signs.map(([t, c], i) => `<g transform="translate(${i % 2 ? 150 - i * 4 : 50 + i * 4} ${130 + i * 26}) scale(${f(0.9 - i * 0.08)})">${O.neon(t, c)}</g>`).join(''), 255, 0.35);
    for (let i = 0; i < 40; i++) h += P(`M${f(rn(0, 200))} ${f(rn(0, 300))}l-3 10`, 'none', st('#c8d8ff', 0.6, ' opacity=".3"'));
    return h; };
  /* 海底：光柱、海草、珊瑚、氣泡 */
  K.under = (o = {}) => { let h = A.sky('sea', 0.1) + rays(100, -40, 9, '#bff6ff', 0.1, 1.2, 380) + clouds(0, 300, '#3a9ab0', 0.25, 0.01, 0.02, 41);
    for (let i = 0; i < 14; i++) { const x = rn(0, 200), ht = rn(30, 80); h += P(`M${f(x)} 300q${f(rn(-10, 10))} ${f(-ht / 2)} 0 ${f(-ht)}q${f(rn(-8, 8))} ${f(-ht / 3)} ${f(rn(-4, 4))} ${f(-ht / 2)}`, 'none', st(mixc('#1a6a4a', '#0a2a2a', rn(0, 1)), rn(1.5, 3), ' opacity=".85"')); }
    h += P('M0 280Q50 262 100 276T200 270V300H0Z', lin([[0, '#2a5a5a'], [1, '#0a1a20']]));
    for (let i = 0; i < 10; i++) h += C(rn(10, 190), rn(276, 296), rn(3, 7), ['#e86a6a', '#f0a05a', '#c87ac8'][i % 3], ' opacity=".8"');
    for (let i = 0; i < 30; i++) { const r = rn(0.8, 3); h += C(rn(10, 190), rn(0, 280), r, 'none', st('#dff8ff', 0.6, ' opacity=".55"')) + C(rn(10, 190), rn(0, 280), 0.5, '#ffffff', ' opacity=".5"'); }
    return h; };
  /* 室內：窗（夜景）、暖燈、枱 */
  K.room = (o = {}) => { const p = PAL[o.pal || 'night']; let h = Rc(0, 0, 200, 300, lin([[0, '#3a2a22'], [1, '#1a120e']])) + clouds(0, 300, '#6a4a3a', 0.25, 0.02, 0.02, 51);
    h += `<g transform="translate(0 0)"><rect x="24" y="30" width="152" height="170" fill="${lin([[0, p[0]], [1, p[2]]])}"/>${stars(30, 34, 120)}</g>`;
    h += glow(170, 200, 90, '#ffc878', 0.35) + Rc(0, 215, 200, 85, lin([[0, '#7a4a2a'], [1, '#3a2014']])) + Rc(0, 213, 200, 4, '#9a6a3a');
    return h; };
  K.roomFrame = () => P('M24 30H176V200H24Z', 'none', st('#5a3a22', 6)) + P('M100 30V200M24 115H176', 'none', st('#5a3a22', 4));
  /* 星空／宇宙：星雲、銀河 */
  K.space = (o = {}) => { let h = Rc(0, 0, 200, 300, lin([[0, '#05060f'], [1, '#101030']])) + clouds(0, 300, '#6a3a9a', 0.35, 0.007, 0.012, 61) + clouds(0, 300, '#2a6aa8', 0.3, 0.01, 0.01, 62) + clouds(60, 240, '#ffd8e8', 0.18, 0.012, 0.03, 63) + stars(220, 0, 300);
    return h; };
  /* 唐樓天台 */
  K.rooftop = (o = {}) => { const p = PAL[o.pal || 'dusk']; let h = A.sky(o.pal || 'dusk', 0.7) + src(o) + A.city(225, mixc(p[0], '#000000', 0.15), '#ffd98a', 0.9);
    h += Rc(0, 228, 200, 72, lin([[0, '#6a5a5a'], [1, '#2a2222']])) + Rc(0, 226, 200, 3, '#8a7a7a');
    h += `<g transform="translate(160 228)" filter="${flt('vol')}">${Rc(-12, -26, 24, 26, '#8a8a8a')}${E(0, -26, 12, 3, '#9a9a9a')}${Rc(-14, -2, 28, 2, '#5a5a5a')}</g>` + P('M30 228V190M24 196H36M26 204H34', 'none', st('#2a2a2a', 0.8));
    return h; };
  return { K, ridge, mtns, grass, flowers, rock, reeds, treeLine, pineRow, rays, mirror, fog, water };
})();
