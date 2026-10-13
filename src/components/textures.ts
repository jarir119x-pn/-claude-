import { random } from "remotion";

// بلاطات ملمس حتمية البذرة (تُولَّد مرة واحدة في المتصفح)
const cache = new Map<string, string>();

const tile = (
  key: string,
  size: number,
  pixel: (x: number, y: number) => [number, number, number, number],
) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixel(x, y);
      const o = (y * size + x) * 4;
      img.data[o] = r;
      img.data[o + 1] = g;
      img.data[o + 2] = b;
      img.data[o + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL("image/png");
  cache.set(key, url);
  return url;
};

/** ضوضاء خطية ناعمة (لخيوط النسيج) */
const smooth1d = (seed: string, n: number) => {
  const raw = Array.from({ length: n }, (_, i) => random(`${seed}-${i}`) * 2 - 1);
  return raw.map((_, i) => (raw[(i - 1 + n) % n] + 2 * raw[i] + raw[(i + 1) % n]) / 4);
};

/** نسيج الكتّان: خيوط أفقية وعمودية + حبيبات (رمادي حول 128 للمزج overlay) */
export const linenTexture = () => {
  const S = 256;
  const rows = smooth1d("linen-row", S);
  const cols = smooth1d("linen-col", S);
  return tile("linen", S, (x, y) => {
    const v =
      128 +
      34 * rows[y] * (0.6 + 0.4 * Math.sin(x * 0.9)) +
      34 * cols[x] * (0.6 + 0.4 * Math.sin(y * 0.9)) +
      22 * (random(`linen-${x}-${y}`) - 0.5);
    const c = Math.max(0, Math.min(255, Math.round(v)));
    return [c, c, c, 255];
  });
};

/** حبيبات الورق وأليافه (فاتحة، تُمزج multiply) */
export const paperTexture = () => {
  const S = 256;
  return tile("paper", S, (x, y) => {
    let v = 246 + 9 * random(`paper-${x}-${y}`);
    // ألياف قصيرة متفرّقة
    if (random(`fiber-${Math.floor(x / 3)}-${y}`) > 0.9965) v -= 22;
    if (random(`fiber2-${x}-${Math.floor(y / 4)}`) > 0.997) v -= 16;
    const c = Math.max(0, Math.min(255, Math.round(v)));
    return [c, c - 1, c - 3, 255];
  });
};

/** جلد الغلاف: حبيبات متجمّعة */
export const leatherTexture = () => {
  const S = 256;
  return tile("leather", S, (x, y) => {
    const cell = random(`leather-${Math.floor(x / 5)}-${Math.floor(y / 5)}`);
    const v = 200 + 40 * cell + 15 * random(`lf-${x}-${y}`);
    const c = Math.max(0, Math.min(255, Math.round(v)));
    return [c, c, c, 255];
  });
};

/** grain ثابت البذرة لمنع التخطيط اللوني بعد الضغط */
export const grainTexture = () =>
  tile("grain", 256, (x, y) => {
    const v = Math.floor(random(`muhasaba-grain-${x}-${y}`) * 256);
    return [v, v, v, 255];
  });

/** مسار حافة غير مستوية (deckled) لمستطيل، بإحداثيات نسبية لعنصره */
export const deckledPath = (w: number, h: number, seed: string, amp = 1.8, step = 9) => {
  const pts: [number, number][] = [];
  const j = (k: string) => (random(`${seed}-${k}`) - 0.5) * 2 * amp;
  for (let x = 0; x <= w; x += step) pts.push([x, Math.max(0, amp + j(`t${x}`))]);
  for (let y = 0; y <= h; y += step) pts.push([w - Math.max(0, amp + j(`r${y}`)), y]);
  for (let x = w; x >= 0; x -= step) pts.push([x, h - Math.max(0, amp + j(`b${x}`))]);
  for (let y = h; y >= 0; y -= step) pts.push([Math.max(0, amp + j(`l${y}`)), y]);
  return `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
};
