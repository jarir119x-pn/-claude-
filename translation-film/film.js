// «امحُ من ذاكرتك» — the film. Story, camera and timing only; all drawing goes through engine.js.
// One sheet of paper, one take. Regions sit right → left (Arabic reading order): A memory, B 1980s, C later, D Brazil, E Israel.
import * as E from './engine.js';
import { P, W, H } from './engine.js';
import { clamp, lerp, seg, eio, eo, hash, vnoise } from '/core/lib.js';

export const DUR = 90;

// ---------- data (corrected figures; see TREATMENT.md §4) ----------
const D80 = [
  { id: 'arab', name: 'العالم العربي', pop: '250 مليون نسمة', pm: 4.4, total: 1100, x: 420 },
  { id: 'hun', name: 'المجر', pop: '10 ملايين نسمة', pm: 519, total: 5190, x: 0 },
  { id: 'spa', name: 'إسبانيا', pop: '39 مليون نسمة', pm: 920, total: 35880, x: -420 },
];
// sequential ramp (pale → blue) on a log scale: colour encodes only the value
const seqCol = (v, lo, hi, a = 1) => E.rgb(E.rampRGB(-.08 - .9 * clamp(Math.log(v / lo) / Math.log(hi / lo))), a);
const colPM = v => seqCol(v, 1, 1000);
const colYR = v => seqCol(v, 30, 20000);

// ---------- layout (world units) ----------
const BOX = { l: -620, r: 620, top: -250, bot: 230 };
const RX = { B: 0, C: -2300, D: -4500, E: -6700 };
const HEAD = { x: 0, y: -690 };
const BARW = 220;

// ---------- the beat sheet (seconds) ----------
const K = {
  head: [.4, 2.8], headNote: [3.0, 4.7], strike: [5.6, 6.15], strike2: [6.25, 6.6],
  bAxes: [8.5, 9.6], bTitle: [9.0, 10.4], bArabLbl: [10.6, 11.2], bArab: [11.4, 12.6], bArabNote: [13.0, 14.9],
  bOthersLbl: [18.8, 19.6], hunGrow: [21.2, 21.7], hunBurst: [21.7, 21.95], clicks: [22.8, 23.15, 23.5, 23.85],
  spa: [24.4, 25.4], hunX: [25.6, 26.4], spaX: [26.5, 27.3], arabRing: [27.4, 27.9],
  morph: [30.0, 31.4], spaNote: [32.4, 33.6], spaNote2: [33.8, 35.0], memo: [38.0, 39.4],
  cAxes: [40.4, 41.4], cTitle: [40.6, 42.0], r02Lbl: [41.4, 41.9], r02: [42.0, 42.9], f24Lbl: [43.8, 44.3], f24: [44.4, 45.6],
  f24Note: [46.0, 47.8], frLbl: [52.4, 53.0], fr: [53.0, 54.6], rescaleC: [53.2, 54.8], frNote: [55.0, 56.0], frNote2: [56.2, 57.4],
  dTitle: [59.6, 61.0], dArab: [60.4, 60.9], dBra: [61.0, 62.4], dNote: [62.8, 63.8], dNote2: [64.0, 65.6],
  eTitle: [68.0, 69.4], eDots: [68.8, 70.4], eRing: [70.8, 71.3], eNote: [71.4, 72.9],
  eArab: [75.0, 75.8], eIsr: [76.0, 77.2], eNote2: [77.4, 78.8],
  pullOut: [80.4, 82.6], glide: [83.6, 86.0], q: [86.3, 86.9], exit: [87.4, 88.6],
};
const TP = K.hunBurst[0];                      // the frame is pierced here

// captions: the figure caption is the only "voice" (silent film)
const CAPS = [
  { t0: .6, t1: 7.4, text: 'قبل أن تسمع الأرقام، امحُ من ذاكرتك «بيت الحكمة» وأيام الترجمة الزاهرة.' },
  { t0: 9.0, t1: 14.2, text: 'أوائل الثمانينات: كم كتابًا تُرجم لكل مليون عربي؟', kicker: '1980–1985' },
  { t0: 14.4, t1: 19.8, text: '4.4 كتاب لكل مليون نسمة — أقل من كتاب واحد في السنة.', kicker: '1980–1985' },
  { t0: 24.2, t1: 29.6, text: 'المجر 519 كتابًا، وإسبانيا 920 — لكل مليون نسمة.', kicker: '1980–1985' },
  { t0: 31.0, t1: 37.8, text: 'وبالإجمالي: إسبانيا، بسكان أقل 6 مرات، ترجمت نحو 33 ضعف ما ترجمه العرب.', kicker: 'كل مربع = 100 كتاب' },
  { t0: 41.8, t1: 47.2, text: 'تقرير 2002: 330 كتابًا فقط في السنة، في جميع التخصصات.', kicker: 'بعد الثمانينات' },
  { t0: 47.4, t1: 53.05, text: 'تقدير France 24: نحو 3,000 سنويًا — ولا إحصائية دقيقة واحدة.', kicker: 'بعد الثمانينات' },
  { t0: 53.2, t1: 58.6, text: 'فرنسا وحدها، بسكان أقل 6 مرات: نحو 19,000 كتاب في السنة.', kicker: 'بعد الثمانينات' },
  { t0: 60.2, t1: 67.6, text: 'في إحدى السنوات: 2,291 عنوانًا في البرازيل، مقابل 26 للعرب — 88 ضعفًا بنصف عدد السكان.' },
  { t0: 69.0, t1: 75.0, text: 'إسرائيل، وسكانها آنذاك 4.5 مليون — واحد من خمسين من العرب…' },
  { t0: 75.2, t1: 80.4, text: '…تُرجم فيها ضعف ما تُرجم في الدول العربية مجتمعة.' },
];
export const subs = () => CAPS.map(c => ({ t0: c.t0, t1: c.t1, text: c.text }));

// ---------- scales ----------
const Yb = (v, vmax) => BOX.bot - v / vmax * (BOX.bot - BOX.top);
function vmaxB(t) {                            // 5 → 1000 in four ratchet clicks (log steps)
  const steps = [5, 20, 100, 400, 1000]; let lv = Math.log(5);
  K.clicks.forEach((c, i) => { lv += (Math.log(steps[i + 1]) - Math.log(steps[i])) * eo(seg(t, c, c + .12)); });
  return Math.exp(lv);
}
const vmaxC = t => Math.exp(lerp(Math.log(3500), Math.log(20000), eio(seg(t, ...K.rescaleC))));
function hunValue(t) {                         // grows like any bar to the top… then bursts
  if (t < K.hunGrow[0]) return 0;
  if (t < TP) return 5 * eio(seg(t, ...K.hunGrow)) * .999;
  return lerp(5, 519, eo(seg(t, ...K.hunBurst)));
}
function niceStep(vm) { const r = vm / 5, p = Math.pow(10, Math.floor(Math.log10(r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2.5 : m < 7.5 ? 5 : 10) * p; }
const fmt = v => v >= 1000 ? Math.round(v).toLocaleString('en-US') : (Math.round(v * 10) / 10).toString();

// ---------- helpers ----------
let G = null; const _mw = new Map();
const handW = (s, size) => { const k = s + '|' + size; if (!_mw.has(k)) _mw.set(k, E.measureHand(G, s, size)); return _mw.get(k); };
function pathAt(pts, u) {                       // point at fraction u of a polyline's length
  const R = E.resample(pts, 3), L = R.total * clamp(u); let j = 0;
  while (j < R.len.length - 1 && R.len[j] < L) j++;
  return R.pts[j];
}
const rectPath = (x0, y0, x1, y1) => [[x1, y1], [x1, y0], [x0, y0], [x0, y1], [x1, y1]];   // starts bottom-right, goes up
const fadeOut = (t, a, d = .35) => 1 - seg(t, a, a + d);

// a handwritten note: optional leader from the text to a mark, then the words (right-aligned at x)
function note(text, x, y, k, o = {}) {
  const size = o.size || 34, col = o.col || P.blue, d = k[1] - k[0], lead = o.to ? .22 : 0;
  return { kind: 'note', text, x, y, size, col, to: o.to, from: o.from, kL: [k[0], k[0] + d * lead], kT: [k[0] + d * lead, k[1]], until: o.until, region: o.region };
}

// ---------- the elements on the sheet ----------
const NOTES = [
  // A: the memory
  note('افتتحه هارون الرشيد · وأيام الترجمة والحركة العلمية الزاهرة', HEAD.x + 330, HEAD.y + 95, K.headNote, { size: 30 }),
  // B
  note('أقل من كتاب واحد في السنة لكل مليون', 270, -120, K.bArabNote, { size: 32, to: [318, Yb(4.4, 5) + 30], from: [276, -128], until: TP - .2 }),
  note('×118', 60, -62, K.hunX, { size: 44, col: P.red, region: 'B80', until: K.morph[0] - .3 }),
  note('×209', -360, -268, K.spaX, { size: 44, col: P.red, region: 'B80', until: K.morph[0] - .3 }),
  note('≈ 33 ضعف العرب', -545, -110, K.spaNote, { size: 38, col: P.red }),
  note('بسكان أقل 6 مرات', -545, -62, K.spaNote2, { size: 30 }),
  note('انتهينا من الثمانينات…', -200, -430, K.memo, { size: 40 }),
  // C
  note('تقدير… ولا إحصائية دقيقة واحدة', RX.C - 140, -60, K.f24Note, { size: 32, col: P.red, to: [RX.C - 112, -20], from: [RX.C - 150, -50], until: K.frLbl[0] }),
  note('≈ 6 أضعاف العرب', RX.C - 330, -380, K.frNote, { size: 38, col: P.red }),
  note('بسكان أقل 6 مرات', RX.C - 340, -334, K.frNote2, { size: 30 }),
  // D
  note('≈ 88 ضعفًا', RX.D - 560, -300, K.dNote, { size: 44, col: P.red }),
  note('سكانها نحو نصف سكان العرب', RX.D - 120, 300, K.dNote2, { size: 30 }),
  // E
  note('إسرائيل آنذاك: 4.5 مليون نسمة', RX.E + 620, 150, K.eNote, { size: 30, to: [RX.E - 186, 96], from: [RX.E + 200, 140] }),
  note('≈ 100 ضعف للفرد', RX.E - 300, -330, K.eNote2, { size: 38, col: P.red }),
];
function Yc(v, vm) { return Yb(v, vm); }

// ---------- pencil activities: [t0, t1, colour, tip(t) in world] ----------
let ACTS = null;
function headTip(t) { const w = handW('بيت الحكمة', 130); return E.handTip('بيت الحكمة', HEAD.x + w / 2, HEAD.y, w, 130, seg(t, ...K.head)); }
function buildActs() {
  const A = [];
  const add = (k, col, tip) => A.push({ t0: k[0], t1: k[1], col, tip });
  add(K.head, 'blue', headTip);
  const strikeA = strikePts(0), strikeB = strikePts(1);
  add(K.strike, 'red', t => pathAt(strikeA, seg(t, ...K.strike)));
  add(K.strike2, 'red', t => pathAt(strikeB, seg(t, ...K.strike2)));
  add(K.bAxes, 'red', t => pathAt(axesPts(RX.B), seg(t, ...K.bAxes)));
  add(K.bArab, 'red', t => pathAt(rectPath(420 - BARW / 2, Yb(4.4, 5), 420 + BARW / 2, BOX.bot), seg(t, ...K.bArab)));
  add(K.hunGrow, 'red', t => [BARW / 2, Yb(hunValue(t), 5)]);
  add([TP, TP + .12], 'red', t => [BARW / 2, BOX.top - 40]);
  add(K.spa, 'red', t => pathAt(rectPath(-420 - BARW / 2, Yb(920, 1000), -420 + BARW / 2, BOX.bot), seg(t, ...K.spa)));
  add(K.arabRing, 'red', t => pathAt(E.ringPath(420, BOX.bot - 6, 46, 3), seg(t, ...K.arabRing)));
  add(K.cAxes, 'red', t => pathAt(axesPts(RX.C), seg(t, ...K.cAxes)));
  add(K.r02, 'red', t => pathAt(rectPath(RX.C + 420 - BARW / 2, Yc(330, 3500), RX.C + 420 + BARW / 2, BOX.bot), seg(t, ...K.r02)));
  add(K.f24, 'red', t => pathAt(dashPts(), seg(t, ...K.f24)));
  add(K.fr, 'red', t => [RX.C - 420, Yc(19000 * eo(seg(t, ...K.fr)), vmaxC(t))]);
  add(K.dArab, 'red', t => pathAt(sqPath('arab'), seg(t, ...K.dArab)));
  add(K.dBra, 'red', t => pathAt(sqPath('bra'), seg(t, ...K.dBra)));
  add(K.eDots, 'blue', t => { const i = Math.min(49, Math.floor(seg(t, ...K.eDots) * 50)); return dotXY(i); });
  add(K.eRing, 'red', t => pathAt(E.ringPath(...dotXY(49), 26, 5), seg(t, ...K.eRing)));
  add(K.eArab, 'red', t => pathAt(rectPath(RX.E - 470 - 80, 200 - 180, RX.E - 470 + 80, 200), seg(t, ...K.eArab)));
  add(K.eIsr, 'red', t => pathAt(rectPath(RX.E - 700 - 80, 200 - 360, RX.E - 700 + 80, 200), seg(t, ...K.eIsr)));
  add(K.q, 'red', t => { const w = handW('؟', 110); return E.handTip('؟', qX(), HEAD.y, w, 110, seg(t, ...K.q)); });
  for (const n of NOTES) {
    if (n.to) add(n.kL, n.col === P.red ? 'red' : 'blue', t => pathAt(E.quadPath(n.from, mid(n.from, n.to), n.to), seg(t, ...n.kL)));
    const w = handW(n.text, n.size);
    add(n.kT, n.col === P.red ? 'red' : 'blue', t => E.handTip(n.text, n.x, n.y, w, n.size, seg(t, ...n.kT)));
  }
  return A.sort((a, b) => a.t0 - b.t0);
}
const mid = (a, b) => { const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1]; return [mx - dy * .22, my + dx * .22]; };
const qX = () => HEAD.x - handW('بيت الحكمة', 130) / 2 - 40;
function strikePts(i) {
  const w = handW('بيت الحكمة', 130);
  if (i === 0) return [[HEAD.x + w / 2 + 30, HEAD.y - 52], [HEAD.x, HEAD.y - 40], [HEAD.x - w / 2 - 30, HEAD.y - 30]];
  const wn = handW(NOTES[0].text, 30);
  return [[NOTES[0].x + 10, NOTES[0].y - 10], [NOTES[0].x - wn - 10, NOTES[0].y - 6]];
}
const axesPts = rx => [[rx + BOX.r, BOX.top - 10], [rx + BOX.r, BOX.bot], [rx + BOX.l - 10, BOX.bot]];
const dashPts = () => rectPath(RX.C - BARW / 2, Yc(3000, 3500), RX.C + BARW / 2, Yc(300, 3500));
// D: proportional squares (area ∝ titles), bottom-aligned at y = 200
const SQ = { bra: { v: 2291, side: 470, x: RX.D - 300 }, arab: { v: 26, side: 470 * Math.sqrt(26 / 2291), x: RX.D + 330 } };
const sqPath = k => { const s = SQ[k]; return rectPath(s.x - s.side / 2, 200 - s.side, s.x + s.side / 2, 200); };
// E: 50 people dots, 10 × 5, filled right → left; the last one is Israel
const dotXY = i => [RX.E + 300 - (i % 10) * 56, -40 + Math.floor(i / 10) * 56 - 56 * 2];

// ---------- pencil ----------
const FL = c => (c === 'red' ? 1 : 0);
function penAt(t, cam) {
  if (!ACTS) ACTS = buildActs();
  let cur = null, prev = null, next = null;
  for (const a of ACTS) { if (a.t0 <= t && t <= a.t1) cur = a; if (a.t1 < t && (!prev || a.t1 >= prev.t1)) prev = a; if (a.t0 > t && !next) next = a; }
  let w, lift, flip;
  if (cur) { w = cur.tip(t); lift = .04 + .03 * Math.abs(Math.sin(t * 29)); flip = FL(cur.col); }
  else if (!prev) {                               // entering from the lower right
    const e = next.tip(next.t0), u = eo(seg(t, 0, next.t0));
    const s0 = E.s2w(cam, W + 200, H + 120); w = [lerp(s0[0], e[0], u), lerp(s0[1], e[1], u)]; lift = .6 * (1 - u) + .06; flip = FL(next.col);
  } else {
    const p = prev.tip(prev.t1);
    const hop = next ? Math.min(.55, next.t0 - prev.t1) : 0;
    if (next && t >= next.t0 - hop) {
      const u = eio(seg(t, next.t0 - hop, next.t0)), q = next.tip(next.t0);
      w = [lerp(p[0], q[0], u), lerp(p[1], q[1], u)]; lift = .06 + Math.sin(u * Math.PI) * Math.min(.55, .15 + Math.hypot(q[0] - p[0], q[1] - p[1]) / 900);
    } else {                                      // resting near the last mark, hovering
      const rest = seg(t, prev.t1, prev.t1 + .5);
      w = [p[0] + 18 * rest, p[1] + 26 * rest]; lift = .06 + .22 * rest + .03 * Math.sin(t * 2.3);
    }
    const f0 = FL(prev.col), f1 = next ? FL(next.col) : f0;
    flip = next && f0 !== f1 ? lerp(f0, f1, eio(seg(t, next.t0 - .55, next.t0 - .1))) : f0;
  }
  let [sx, sy] = E.w2s(cam, w[0], w[1]);
  if (t > TP && t < TP + 1.1) {                   // flinch: recoil and freeze when the frame breaks
    const k = Math.sin(clamp((t - TP) / 1.1) * Math.PI);
    sx += 70 * k; sy += 40 * k; lift = Math.max(lift, .8 * k);
  }
  if (t > K.exit[0]) {                            // exit: hand the story to the viewer
    const u = eio(seg(t, ...K.exit)); sx = lerp(sx, W + 260, u); sy = lerp(sy, H + 200, u); lift += .5 * u;
  }
  return { tip: [sx, sy], s: .82 * Math.sqrt(cam.zoom), lift, flip, alpha: t > K.exit[1] ? 0 : 1 };
}

// ---------- camera ----------
const CK = [
  [0, 0, -690, 1.55], [5.4, 0, -690, 1.55], [6.6, 0, -685, 1.72], [7.4, 0, -685, 1.72],
  [8.9, 0, 20, 1.0], [11.0, 0, 20, 1.0], [12.0, 190, 40, 1.14], [15.4, 190, 40, 1.14], [19.0, 0, 20, 1.0],
  [33.6, 0, 20, 1.0], [35.2, 400, 160, 1.85], [37.0, 400, 160, 1.85], [38.0, -60, -160, 1.0], [39.5, -60, -160, 1.0],
  [41.0, RX.C, 20, 1.0], [53.0, RX.C, 20, 1.0], [54.8, RX.C, 0, .96], [58.6, RX.C, 0, .96],
  [60.0, RX.D, 20, 1.0], [67.0, RX.D, 20, 1.0], [68.4, RX.E, 20, 1.0], [70.4, RX.E + 140, -40, 1.12], [74.4, RX.E + 140, -40, 1.12], [75.2, RX.E, 20, 1.0],
  [80.4, RX.E, 20, 1.0], [82.6, -3300, -230, .225], [83.6, -3300, -230, .225], [86.0, -40, -745, 1.6], [DUR, -40, -745, 1.68],
];
function camAt(t) {
  let i = 0; while (i < CK.length - 2 && CK[i + 1][0] <= t) i++;
  const a = CK[i], b = CK[i + 1], u = eio(seg(t, a[0], b[0]));
  const dist = Math.hypot(b[1] - a[1], b[2] - a[2]);
  const dip = dist > 1200 && b[3] > .5 && a[3] > .5 ? 1 - .28 * Math.sin(u * Math.PI) : 1;   // long pans pull back a little
  const zl = Math.exp(lerp(Math.log(a[3]), Math.log(b[3]), u));
  const cam = { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), zoom: zl * dip, roll: 0, sx: 0, sy: 0 };
  if (t >= TP && t < K.clicks[3] + .6) {          // punch-in over 2 frames + decaying shake
    const pin = clamp((t - TP) / (2 / 24)), dec = Math.exp(-(t - TP) * 3.2);
    cam.zoom *= 1 + .2 * pin * (1 - eio(seg(t, K.clicks[0], K.clicks[3] + .5)));
    cam.sx = (vnoise(t * 31) - .5) * 30 * dec; cam.sy = (vnoise(t * 29 + 7) - .5) * 30 * dec; cam.roll = (vnoise(t * 17 + 3) - .5) * .02 * dec;
  }
  for (const c of K.clicks) if (t >= c && t < c + .12) cam.sy += 6 * Math.sin(seg(t, c, c + .12) * Math.PI);  // jolt on each click
  return cam;
}

// ---------- drawing ----------
function drawHeadline(g, t) {
  const w = handW('بيت الحكمة', 130);
  E.handText(g, 'بيت الحكمة', HEAD.x + w / 2, HEAD.y, { size: 130, progress: seg(t, ...K.head), color: P.blue, zoom: 1.8 });
  E.pencilStroke(g, strikePts(0), { color: P.red, width: 6, progress: seg(t, ...K.strike), seed: 4, wobble: .5 });
  E.pencilStroke(g, strikePts(1), { color: P.red, width: 3.2, progress: seg(t, ...K.strike2), seed: 6 });
  if (t > K.q[0]) E.handText(g, '؟', qX(), HEAD.y, { size: 110, color: P.red, progress: seg(t, ...K.q), zoom: 1.6 });
}
function drawAxes(g, t, rx, k, vm, unit) {
  const p = seg(t, ...k); if (p <= 0) return;
  E.pencilStroke(g, axesPts(rx), { color: P.ink, width: 2, progress: p, seed: 9 + rx, wobble: .25, passes: 1 });
  const step = niceStep(vm), tp = seg(t, k[1] - .3, k[1] + .5);
  g.save();
  for (let v = 0; v <= vm * 1.0001; v += step) {
    const y = Yb(v, vm);
    if (v > 0) { g.globalAlpha = tp * .8; g.strokeStyle = P.rule; g.lineWidth = 1; g.beginPath(); g.moveTo(rx + BOX.l, y); g.lineTo(rx + BOX.r, y); g.stroke(); }
    g.globalAlpha = 1; E.setType(g, fmt(v), rx + BOX.r + 16, y + 6, { size: 19, progress: tp });
  }
  g.restore();
  E.setType(g, unit, rx + BOX.r, BOX.top - 26, { size: 24, font: '"Plex Arabic"', align: 'right', progress: tp, color: P.inkSoft });
}
function title(g, text, rx, k, alpha = 1) {
  E.setType(g, text, rx + BOX.r, BOX.top - 92, { size: 54, font: 'Amiri', weight: 700, color: P.ink, align: 'right', progress: seg(t_, ...k), alpha });
}
function label(g, name, sub, x, k, alpha = 1) {
  const p = seg(t_, ...k); if (p <= 0) return;
  E.setType(g, name, x, BOX.bot + 46, { size: 32, font: '"Plex Arabic"', weight: 600, color: P.ink, align: 'center', progress: p, alpha });
  if (sub) E.setType(g, sub, x, BOX.bot + 80, { size: 22, font: '"Plex Arabic"', color: P.inkSoft, align: 'center', progress: p, alpha });
}
const value = (g, txt, x, y, k, o = {}) => E.setType(g, txt, x, y, { size: o.size || 26, weight: 500, color: o.color || P.ink, align: 'center', progress: seg(t_, k, k + .35), alpha: o.alpha ?? 1 });
function bar(g, x, v, vm, k, fill, o = {}) {
  const top = Math.min(Yb(v, vm), BOX.bot - 2);
  E.inkShape(g, rectPath(x - BARW / 2, top, x + BARW / 2, BOX.bot), { fill, progress: o.progress ?? seg(t_, ...k), seed: o.seed || 3, hatch: .45 });
}
let t_ = 0;

function drawB(g, t, cam) {
  if (t > 41.5 && t < 80.3) return;               // off-camera
  const vm = vmaxB(t), morph = seg(t, ...K.morph), barA = 1 - eio(morph);
  drawAxes(g, t, RX.B, K.bAxes, vm, morph < .5 ? 'كتاب لكل مليون نسمة' : '');
  // plot frame: the top edge is the one that tears
  const fp = seg(t, ...K.bAxes);
  if (fp > 0) {
    g.save(); g.globalAlpha = fp;
    const torn = t >= TP, gx0 = -150, gx1 = 150;
    const top = torn ? [[[BOX.r, BOX.top], [gx1, BOX.top]], [[gx0, BOX.top], [BOX.l, BOX.top]]] : [[[BOX.r, BOX.top], [BOX.l, BOX.top]]];
    top.forEach((pts, i) => E.pencilStroke(g, pts, { color: P.ink, width: 1.2, seed: 20 + i, wobble: .2, passes: 1, progress: fp }));
    E.pencilStroke(g, [[BOX.l, BOX.top], [BOX.l, BOX.bot]], { color: P.ink, width: 1.2, seed: 23, wobble: .2, passes: 1, progress: fp });
    if (torn) {                                   // the scar: torn paper lips, curled back
      const k = eo(seg(t, TP, TP + .15));
      for (const [x0, dir] of [[gx1, 1], [gx0, -1]]) {
        const pts = Array.from({ length: 9 }, (_, i) => [x0 - dir * i * 7 * k, BOX.top - (i % 2 ? 14 : 2) * k - i * 3 * k]);
        g.fillStyle = 'rgba(232,224,207,1)'; g.beginPath(); g.moveTo(x0, BOX.top); pts.forEach(p => g.lineTo(...p)); g.lineTo(x0 - dir * 70 * k, BOX.top - 46 * k); g.closePath(); g.fill();
        E.pencilStroke(g, [[x0, BOX.top], ...pts, [x0 - dir * 70 * k, BOX.top - 46 * k]], { color: P.ink, width: 1.3, seed: x0, wobble: .5, passes: 1 });
      }
      for (let i = 0; i < 14; i++) {                // paper fragments thrown up
        const a = t - TP; if (a > 1.2) break;
        const vx = (hash(i * 3.1) - .5) * 420, vy = -300 - hash(i * 7.7) * 500, x = vx * a, y = BOX.top + vy * a + 600 * a * a;
        g.globalAlpha = fp * (1 - a / 1.2); g.fillStyle = i % 3 ? 'rgba(225,215,195,1)' : P.ink;
        g.save(); g.translate(x, y); g.rotate(a * 9 * (hash(i) - .5)); g.fillRect(-5, -3, 10, 6); g.restore();
      }
    }
    g.restore();
  }
  title(g, 'كم كتابًا تُرجم لكل مليون نسمة؟', RX.B, K.bTitle, 1 - seg(t, K.morph[0] - .4, K.morph[0]));
  title(g, 'كم كتابًا تُرجم إجمالًا؟', RX.B, [K.morph[1] - .2, K.morph[1] + 1.2]);
  // category labels
  const [arab, hun, spa] = D80;
  label(g, arab.name, arab.pop, arab.x, K.bArabLbl);
  label(g, hun.name, hun.pop, hun.x, K.bOthersLbl);
  label(g, spa.name, spa.pop, spa.x, K.bOthersLbl);
  // bars (per million)
  if (barA > 0) {
    g.save(); g.globalAlpha *= barA;
    bar(g, arab.x, 4.4, vm, K.bArab, colPM(4.4), { seed: 5 });
    const hv = hunValue(t);
    if (hv > 0) {
      const top = Yb(hv, vm);
      if (t < TP) bar(g, hun.x, hv, vm, null, colPM(519), { progress: 1, seed: 7 });
      else {                                      // the burst: a flat column that runs off the sheet
        const tt = Math.max(top, BOX.top - 5000);
        g.fillStyle = colPM(519); g.fillRect(hun.x - BARW / 2, tt, BARW, BOX.bot - tt);
        E.pencilStroke(g, [[hun.x + BARW / 2, BOX.bot], [hun.x + BARW / 2, tt], [hun.x - BARW / 2, tt], [hun.x - BARW / 2, BOX.bot]], { color: P.ink, width: 1.6, seed: 7, wobble: .3, passes: 2 });
      }
    }
    if (t > K.spa[0]) bar(g, spa.x, 920, vm, K.spa, colPM(920), { seed: 9 });
    value(g, '4.4', arab.x, Yb(4.4, vm) - 16, K.bArab[1], { alpha: t < K.clicks[0] ? 1 : 1 - seg(t, K.clicks[0], K.clicks[3]) });
    if (t > K.clicks[3]) value(g, '4.4', arab.x, BOX.bot - 18, K.clicks[3] + .1, { color: P.red });
    value(g, '519', hun.x, Yb(519, vm) - 16, K.clicks[3] + .15);
    value(g, '920', spa.x, Yb(920, vm) - 16, K.spa[1]);
    g.restore();
    E.pencilStroke(g, E.ringPath(arab.x, BOX.bot - 6, 46, 3), { color: P.red, width: 2, progress: seg(t, ...K.arabRing), alpha: .9 * fadeOut(t, K.morph[0] - .3), passes: 1 });
  }
  // morph: every bar → unit squares (one square = 100 books)
  if (morph > 0) drawSquares(g, t, morph, vm);
}
function drawSquares(g, t, morph, vm) {
  const S = 12, PI = 14.5, COLS = 14;
  D80.forEach((c, ci) => {
    const n = Math.round(c.total / 100), top0 = Yb(c.pm, vm), col = colPM(c.pm);
    for (let i = 0; i < n; i++) {
      const tx = c.x + (COLS * PI) / 2 - (i % COLS) * PI - PI / 2, ty = BOX.bot - 10 - Math.floor(i / COLS) * PI;
      const u = clamp(morph * 1.6 - (i / Math.max(1, n)) * .6 - ci * .02);
      if (u <= 0) continue;
      const e = eio(u), x = lerp(c.x + (hash(i + ci * 99) - .5) * BARW * .8, tx, e), y = lerp(Math.max(top0, BOX.top) + (BOX.bot - Math.max(top0, BOX.top)) * hash(i * 1.3 + ci), ty, e);
      g.fillStyle = col; g.fillRect(x - S / 2, y - S / 2, S, S);
      g.strokeStyle = P.ink; g.lineWidth = .9; g.globalAlpha = .8; g.strokeRect(x - S / 2, y - S / 2, S, S); g.globalAlpha = 1;
    }
    const rows = Math.ceil(n / COLS), vy = BOX.bot - 10 - rows * PI - 8;
    value(g, '≈ ' + c.total.toLocaleString('en-US'), c.x, vy, K.morph[1] + .1 + ci * .15, { color: c.id === 'arab' ? P.red : P.ink });
  });
  E.setType(g, '■ = 100 كتاب', RX.B + BOX.r, BOX.top - 26, { size: 24, font: '"Plex Arabic"', align: 'right', progress: seg(t, K.morph[1], K.morph[1] + .6), color: P.inkSoft });
}

function drawC(g, t) {
  if (t < 38.5 || (t > 61 && t < 80.3)) return;
  const vm = vmaxC(t), rx = RX.C;
  drawAxes(g, t, rx, K.cAxes, vm, 'كتاب في السنة');
  title(g, 'كم كتابًا يُترجم في السنة؟', rx, K.cTitle);
  label(g, 'تقرير 2002', '', rx + 420, K.r02Lbl);
  label(g, 'France 24', 'تقدير', rx, K.f24Lbl);
  label(g, 'فرنسا', '68 مليون نسمة', rx - 420, K.frLbl);
  if (t > K.r02[0]) bar(g, rx + 420, 330, vm, K.r02, colYR(330), { seed: 11 });
  value(g, '330', rx + 420, Yb(330, vm) - 16, K.r02[1]);
  if (t > K.f24[0]) {                             // the estimate: a dashed range, hatched, never solid
    const y0 = Yb(3000, vm), y1 = Yb(300, vm), p = seg(t, ...K.f24);
    g.save(); g.globalAlpha = clamp(p * 2) * .5; g.beginPath(); g.rect(rx - BARW / 2, y0, BARW, y1 - y0); g.clip();
    g.strokeStyle = colYR(2000); g.lineWidth = 3;
    for (let x = rx - BARW / 2 - (y1 - y0); x < rx + BARW / 2; x += 13) { g.beginPath(); g.moveTo(x, y1); g.lineTo(x + (y1 - y0), y0); g.stroke(); }
    g.restore();
    E.dashedCell(g, rx - BARW / 2, y0, rx + BARW / 2, y1, { progress: p, color: P.ink, width: 1.8 });
    value(g, '~3,000', rx, y0 - 16, K.f24[1]);
    value(g, 'بضع مئات', rx, y1 + 30, K.f24[1] + .2, { size: 20, color: P.inkSoft });
  }
  if (t > K.fr[0]) {
    const v = 19000 * eo(seg(t, ...K.fr));
    bar(g, rx - 420, v, vm, null, colYR(19000), { progress: 1, seed: 13 });
    value(g, '~19,000', rx - 420, Yb(v, vm) - 16, K.fr[1]);
  }
}

function drawD(g, t) {
  if (t < 56 || (t > 70 && t < 80.3)) return;
  E.setType(g, 'عناوين مترجمة في سنة واحدة مرصودة', RX.D + BOX.r, BOX.top - 92, { size: 54, font: 'Amiri', weight: 700, color: P.ink, align: 'right', progress: seg(t, ...K.dTitle) });
  E.setType(g, 'المساحة تتناسب مع عدد العناوين', RX.D + BOX.r, BOX.top - 26, { size: 24, font: '"Plex Arabic"', align: 'right', progress: seg(t, K.dTitle[1] - .4, K.dTitle[1] + .4), color: P.inkSoft });
  for (const [k, kk, name, fill] of [['arab', K.dArab, 'العالم العربي', colYR(26)], ['bra', K.dBra, 'البرازيل', colYR(2291)]]) {
    if (t < kk[0]) continue;
    const s = SQ[k];
    E.inkShape(g, sqPath(k), { fill, progress: seg(t, ...kk), seed: k === 'bra' ? 17 : 19, hatch: .4 });
    value(g, s.v.toLocaleString('en-US'), s.x, 200 - s.side - 18, kk[1], { size: 30 });
    E.setType(g, name, s.x, 250, { size: 32, font: '"Plex Arabic"', weight: 600, color: P.ink, align: 'center', progress: seg(t, kk[0], kk[0] + .5) });
  }
}

function drawE(g, t) {
  if (t < 64) return;
  E.setType(g, 'السكان والترجمة', RX.E + BOX.r, BOX.top - 92, { size: 54, font: 'Amiri', weight: 700, color: P.ink, align: 'right', progress: seg(t, ...K.eTitle) });
  E.setType(g, '● = 4.5 مليون نسمة', RX.E + BOX.r, BOX.top - 26, { size: 24, font: '"Plex Arabic"', align: 'right', progress: seg(t, K.eDots[0], K.eDots[0] + .6), color: P.inkSoft });
  const [d0, d1] = K.eDots;
  for (let i = 0; i < 50; i++) {
    const tl = d0 + (d1 - d0) * i / 50 + (i === 49 ? .2 : 0);
    const [x, y] = dotXY(i);
    E.dataDot(g, x, y, 17, i === 49 ? colYR(4000) : '#EDE6D6', { fresh: t - tl, ripple: i === 49 ? 1.4 : 0 });
  }
  E.pencilStroke(g, E.ringPath(...dotXY(49), 26, 5), { color: P.red, width: 2.2, progress: seg(t, ...K.eRing), passes: 1 });
  if (t > K.eDots[1]) E.setType(g, 'العرب: نحو 225 مليون نسمة', dotXY(0)[0] + 16, dotXY(0)[1] - 44, { size: 24, font: '"Plex Arabic"', color: P.inkSoft, align: 'right', progress: seg(t, K.eDots[1], K.eDots[1] + .6) });
  // output bars: Israel = 2 units, all Arab states = 1 unit
  if (t > K.eArab[0] - .6) {
    E.pencilStroke(g, [[RX.E - 340, 200], [RX.E - 880, 200]], { color: P.ink, width: 2, progress: seg(t, K.eArab[0] - .6, K.eArab[0]), passes: 1, seed: 31 });
    E.setType(g, 'حجم الترجمة', RX.E - 610, -230, { size: 26, font: '"Plex Arabic"', color: P.inkSoft, align: 'center', progress: seg(t, K.eArab[0] - .6, K.eArab[0]) });
  }
  if (t > K.eArab[0]) {
    E.inkShape(g, rectPath(RX.E - 470 - 80, 20, RX.E - 470 + 80, 200), { fill: colYR(1200), progress: seg(t, ...K.eArab), seed: 33 });
    E.setType(g, 'الدول العربية مجتمعة', RX.E - 470, 246, { size: 26, font: '"Plex Arabic"', weight: 600, color: P.ink, align: 'center', progress: seg(t, ...K.eArab) });
    value(g, '1', RX.E - 470, 2, K.eArab[1], { size: 34, color: P.red });
  }
  if (t > K.eIsr[0]) {
    E.inkShape(g, rectPath(RX.E - 700 - 80, -160, RX.E - 700 + 80, 200), { fill: colYR(2400), progress: seg(t, ...K.eIsr), seed: 35 });
    E.setType(g, 'إسرائيل', RX.E - 700, 246, { size: 26, font: '"Plex Arabic"', weight: 600, color: P.ink, align: 'center', progress: seg(t, ...K.eIsr) });
    value(g, '2', RX.E - 700, -178, K.eIsr[1], { size: 34 });
  }
}

function drawNotes(g, t) {
  for (const n of NOTES) {
    if (t < n.kL[0]) continue;
    const a = n.until ? fadeOut(t, n.until) : 1; if (a <= 0) continue;
    g.save(); g.globalAlpha *= a;
    if (n.to) E.leader(g, n.from, n.to, { color: n.col, progress: seg(t, ...n.kL), seed: n.x });
    E.handText(g, n.text, n.x, n.y, { size: n.size, color: n.col, progress: seg(t, ...n.kT), zoom: 1.8 });
    g.restore();
  }
}

export function renderFilm(g, t) {
  G = G || g; t_ = t;
  const cam = camAt(t);
  E.drawPaper(g, cam, { dots: .9 });
  E.applyCam(g, cam);
  drawHeadline(g, t);
  drawB(g, t, cam); drawC(g, t); drawD(g, t); drawE(g, t);
  drawNotes(g, t);
  const pen = penAt(t, cam);
  E.drawPencil(g, { ...pen, ang: .62 });
  let box = null;
  for (const c of CAPS) { const b = E.caption(g, c.text, t, { t0: c.t0, t1: c.t1, kicker: c.kicker || '' }); if (b && t >= c.t0 + .2 && t <= c.t1) box = { id: 'cap' + c.t0, text: c.text, ...b }; }
  return box;
}
export function texts(g, t) {
  const out = [];
  for (const c of CAPS) if (t >= c.t0 + .2 && t <= c.t1) {
    const L = E.captionLayout(g, c.text, { size: 44, maxW: 1500 }), w = Math.max(...L.widths), lh = 44 * 1.35;
    out.push({ id: 'cap' + c.t0, text: c.text, x0: 1740 - w, y0: 1000 - (L.lines.length - 1) * lh - 44, x1: 1740, y1: 1022 });
  }
  return out;
}
