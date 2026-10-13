import { Easing, interpolate } from "remotion";

export const W = 1080;
export const H = 1920;

/** Light Academia — ألوان مطفأة بلا تشبّع عالٍ */
export const C = {
  linen: "#E9E0D2",
  paper: "#FBF7EE",
  ink: "#4A3528",
  inkLight: "#7D6B5D",
  rust: "#8C5230",
  warmGray: "#948777",
  rule: "#E6DCCB",
  dustyRose: "#C9A99C",
  marginRose: "#D8B4B8",
  sage: "#9DA59C",
  camel: "#CFB07A",
  terracotta: "#C98F6B",
};

export const SAFE = { top: 250, bottom: 380, right: 150, left: 80 };
export const SAFE_BOX = {
  x: SAFE.left,
  y: SAFE.top,
  w: W - SAFE.left - SAFE.right, // 850
  h: H - SAFE.top - SAFE.bottom, // 1290
};

/** الصفحة */
export const PAPER = { x: 36, y: 150, w: 1008, h: 1500 }; // أسفلها 1650
export const MARGIN_X = 948; // الهامش الوردي (خارج منطقة النص)
export const TEXT_RIGHT = 922;
export const TEXT_LEFT = 92;
export const TEXT_W = TEXT_RIGHT - TEXT_LEFT; // 830

export const HEADING_TOP = 258;
export const CONTENT_TOP_HEADING = 432;
export const CONTENT_TOP_PLAIN = 290;
export const CONTENT_BOTTOM = 1462;
export const RULES_TOP_HEADING = 425;
export const RULES_TOP_PLAIN = 262;
export const RULES_BOTTOM = 1468;
export const PAGE_NO_Y = 1478; // صندوق الرقم 1478–1540 داخل المنطقة الآمنة

export const MIN_FONT = 54;
export const LINE_HEIGHT = 1.75;

export const EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
export const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);
export const LINEAR = (t: number) => t;

export const progress = (frame: number, start: number, duration: number, easing = EASE) =>
  interpolate(frame, [start, start + Math.max(1, duration)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};

export const toArabicDigits = (n: number) =>
  String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
