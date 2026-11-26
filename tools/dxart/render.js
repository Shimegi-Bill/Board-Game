// 畫中有話卡圖第 1 步：SVG 場景 → PNG（Chromium 出圖）
// node render.js 出去資料夾 [闊=900] [場景號碼…（唔寫就全部）]；出 r000.png…（號碼係場景號碼，唔係卡號）
const { chromium } = require('playwright'); const fs = require('fs');
const out = process.argv[2] || 'raw', W = +(process.argv[3] || 900);
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const code = ['art1.js', 'art2.js', 'art5.js', 'svg.js', 'art6.js'].map((x) => fs.readFileSync(__dirname + '/' + x, 'utf8')).join('\n');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: W, height: Math.round(W * 1.5) } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.setContent(`<html><body style="margin:0;background:#000"><script>${code}</script><div id="h"></div></body></html>`);
  let L = process.argv.slice(4).map(Number);
  if (!L.length) L = Array.from({ length: await p.evaluate(() => DX_SCN.length) }, (_, i) => i);
  for (const c of L) {
    await p.evaluate(([c, W]) => { const h = document.getElementById('h'); h.innerHTML = dxSvg(c); const s = h.querySelector('svg'); s.setAttribute('width', W); s.setAttribute('height', Math.round(W * 1.5)); s.style.display = 'block'; }, [c, W]);
    await p.locator('#h svg').screenshot({ path: `${out}/r${String(c).padStart(3, '0')}.png` });
  }
  if (errs.length) console.log('errors', errs);
  await b.close();
})();
