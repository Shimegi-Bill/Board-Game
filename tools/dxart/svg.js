/* 畫中有話：場景清單（art6.js 填）同出 SVG（兩次畫：第一次記低月／日位置做光源，第二次正式畫） */
const DX_SCN = [];
function dxSvg(c) {
  DXA.set(c); DX_SCN[c % DX_SCN.length]();
  DXA.set(c, true);
  const body = DX_SCN[c % DX_SCN.length]();
  const w = DXA.flt('wob'), vg = DXA.vign(0.42);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><defs>${DXA.defs()}</defs><g filter="${w}">${body}</g>${vg}</svg>`;
}
