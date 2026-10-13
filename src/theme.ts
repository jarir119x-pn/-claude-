import { Easing, interpolate } from "remotion";
import type { CSSProperties } from "react";

export const W = 1080;
export const H = 1920;

export const COLORS = {
  navyDeep: "#0E1626",
  navy: "#1A2338",
  gold: "#C9A45C",
  ivory: "#F2EBDD",
  cold: "#7A8699",
};

export const SAFE = { top: 250, bottom: 380, right: 150, left: 80 };
export const SAFE_BOX = {
  x: SAFE.left,
  y: SAFE.top,
  w: W - SAFE.left - SAFE.right, // 850
  h: H - SAFE.top - SAFE.bottom, // 1290
};
export const SAFE_CENTER_X = SAFE_BOX.x + SAFE_BOX.w / 2;
export const SAFE_CENTER_Y = SAFE_BOX.y + SAFE_BOX.h / 2;

/** بداية المحتوى في المشاهد التي لها عنوان ركن */
export const CONTENT_TOP = 450;

export const MIN_FONT = 46;
export const LINE_HEIGHT = 1.9;

/** ناعم بلا ارتداد */
export const EASE = Easing.bezier(0.22, 1, 0.36, 1);
export const EASE_IN_OUT = Easing.bezier(0.45, 0, 0.55, 1);

export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing = EASE,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });

/** تلاشٍ + انزلاق 20px + blur يزول */
export const reveal = (
  frame: number,
  start: number,
  duration = 20,
  distance = 20,
  blur = 10,
): CSSProperties => {
  const p = progress(frame, start, duration);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
    filter: p < 1 ? `blur(${(1 - p) * blur}px)` : undefined,
  };
};

/** حجم خط يتكيّف مع طول الفقرة (تقدير أولي، والقياس الفعلي يصغّره إن فاض) */
export const fitFontSize = (
  text: string,
  boxW: number,
  boxH: number,
  { max = 80, fill = 0.62 }: { max?: number; fill?: number } = {},
) => {
  const base = text.replace(/[ً-ٰٟ\s]/g, "").length;
  const fs = Math.sqrt((boxW * boxH * fill) / (base * 0.42 * LINE_HEIGHT));
  return Math.max(MIN_FONT, Math.min(max, Math.floor(fs)));
};

export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
};
