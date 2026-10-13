import { useEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";
import { MARKAZI, fontsReady } from "../fonts";
import { LINE_HEIGHT, MIN_FONT } from "../theme";

let ctx: CanvasRenderingContext2D | null = null;
let metrics: { ascent: number; descent: number } | null = null;

const canvas = () => (ctx ??= document.createElement("canvas").getContext("2d")!);

export const textWidth = (text: string, fs: number, weight = 400, family = MARKAZI) => {
  const c = canvas();
  c.font = `${weight} ${fs}px "${family}"`;
  // القياس بالخصائص الافتراضية؛ فرق ccmp في عرض العلامات مهمل (هامش 3% في fitFont)
  return c.measureText(text).width;
};

/** ينتظر الخطوط ثم يقيس مقاييسها (يؤخّر العرض حتى ذلك) */
export const useFontMetrics = () => {
  const [ready, setReady] = useState(metrics !== null);
  const [handle] = useState(() => (metrics ? null : delayRender("fonts + metrics")));
  useEffect(() => {
    if (metrics) {
      if (handle !== null) continueRender(handle);
      return;
    }
    fontsReady.then(() => {
      const c = canvas();
      c.font = `400 100px "${MARKAZI}"`;
      const m = c.measureText("بسم الله");
      metrics = {
        ascent: m.fontBoundingBoxAscent / 100,
        descent: m.fontBoundingBoxDescent / 100,
      };
      setReady(true);
      if (handle !== null) continueRender(handle);
    });
  }, [handle]);
  return ready ? metrics : null;
};

export type Weighted = { word: string; weight: number };

export const lineWidth = (line: Weighted[], fs: number, family = MARKAZI) =>
  line.reduce((w, x) => w + textWidth(x.word, fs, x.weight, family), 0) +
  (line.length - 1) * textWidth(" ", fs, 400, family);

/**
 * أكبر خط يجعل أطول سطر يتّسع للعرض، وكل الصفوف تتّسع للارتفاع.
 * لا يُكسر السطر أبدًا: إن طال صغُر الخط (ولا يقل عن MIN_FONT).
 */
export const fitFont = (
  lines: Weighted[][],
  width: number,
  height: number,
  rows: number,
  max: number,
  family = MARKAZI,
) => {
  const w100 = Math.max(...lines.map((l) => lineWidth(l, 100, family)));
  const byWidth = (width / (w100 * 1.03)) * 100;
  const byHeight = height / (rows * LINE_HEIGHT);
  const fs = Math.floor(Math.min(max, byWidth, byHeight));
  if (fs < MIN_FONT) {
    console.warn(`font ${fs}px < ${MIN_FONT}px; clamped`);
  }
  return Math.max(MIN_FONT, fs);
};

/** موضع خط القاعدة داخل صندوق سطر ارتفاعه P */
export const baselineIn = (P: number, fs: number, m: { ascent: number; descent: number }) =>
  (P - (m.ascent + m.descent) * fs) / 2 + m.ascent * fs;
