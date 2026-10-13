import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { MARKAZI, MESSIRI } from "../fonts";
import {
  C,
  CONTENT_BOTTOM,
  CONTENT_TOP_HEADING,
  CONTENT_TOP_PLAIN,
  HEADING_TOP,
  LINE_HEIGHT,
  PAGE_NO_Y,
  RULES_BOTTOM,
  RULES_TOP_HEADING,
  RULES_TOP_PLAIN,
  SAFE_BOX,
  TEXT_W,
  W,
  progress,
  toArabicDigits,
} from "../theme";
import { LINEAR } from "../theme";
import { PageId, page } from "../timings";
import { Fleuron, InkLayout, InkText, Mark, wipeMask } from "./Ink";
import { Weighted, baselineIn, fitFont, useFontMetrics } from "./layout";
import { Paper } from "./Paper";

export type Block =
  | { kind: "text"; text: string; mode: "line" | "word"; color?: string }
  | { kind: "gap"; rows: number }
  | { kind: "figure"; rows: number; key: string };

export type PlacedBlock = Block & {
  top: number;
  rows: number;
  height: number;
  /** خطوط القاعدة لصفوف الكتلة */
  baselines: number[];
  firstIndex: number;
};

export type PageGeometry = InkLayout & { blocks: PlacedBlock[]; rules: number[] };

export const splitLines = (text: string) =>
  text.split("\n").map((l) => l.trim().split(/\s+/).filter(Boolean));

/** عنوان الركن: El Messiri، بنّي صدئ، يُكتب بالقناع نفسه ثم ❦ */
export const Heading: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: HEADING_TOP,
        left: SAFE_BOX.x,
        width: SAFE_BOX.w,
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: MESSIRI,
          fontWeight: 600,
          fontSize: 66,
          lineHeight: 1.4,
          color: C.rust,
          padding: "0 8px",
          opacity: progress(frame, 0, 6),
          ...wipeMask(progress(frame, 0, 20, LINEAR)),
        }}
      >
        {text}
      </span>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 2, opacity: progress(frame, 14, 16) }}>
        <Fleuron size={34} />
      </div>
    </div>
  );
};

/** رقم الصفحة بالأرقام العربية بين خطّين رفيعين */
export const PageNumber: React.FC<{ n: number }> = ({ n }) => (
  <div
    style={{
      position: "absolute",
      top: PAGE_NO_Y,
      left: 0,
      width: W,
      height: 62,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 18,
      direction: "rtl",
    }}
  >
    <div style={{ width: 26, height: 2, background: C.terracotta, opacity: 0.7 }} />
    <span style={{ fontFamily: MESSIRI, fontWeight: 600, fontSize: 40, color: C.warmGray, lineHeight: 1 }}>
      {toArabicDigits(n)}
    </span>
    <div style={{ width: 26, height: 2, background: C.terracotta, opacity: 0.7 }} />
  </div>
);

type Props = {
  id: PageId;
  heading?: string;
  pageNo: number;
  blocks: Block[];
  maxFs: number;
  align?: "start" | "center";
  marks?: (i: number, wordAt: number) => Mark | undefined;
  figure?: (key: string, b: PlacedBlock, g: PageGeometry) => React.ReactNode;
  underlay?: (g: PageGeometry) => React.ReactNode;
  overlay?: (g: PageGeometry) => React.ReactNode;
  /** فوق الصفحة كلها (مثل غلاف الدفتر) */
  cover?: React.ReactNode;
};

/**
 * صفحة دفتر: يُحسب حجم الخط من الأسطر اليدوية، وتُوضع الكتلة النهائية في
 * منتصف المنطقة من البداية، وتُشدّ السطور على خطوط القاعدة.
 */
export const NotebookPage: React.FC<Props> = ({
  id,
  heading,
  pageNo,
  blocks,
  maxFs,
  align = "start",
  marks,
  figure,
  underlay,
  overlay,
  cover,
}) => {
  const metrics = useFontMetrics();
  const { lead } = page(id);
  if (!metrics) return null;

  const top = heading ? CONTENT_TOP_HEADING : CONTENT_TOP_PLAIN;
  const avail = CONTENT_BOTTOM - top;

  // الأوزان للقياس: الكلمة المميَّزة بوزن 600
  let wi = 0;
  const weighted: Weighted[][] = [];
  let rows = 0;
  for (const b of blocks) {
    if (b.kind === "text") {
      for (const line of splitLines(b.text)) {
        weighted.push(
          line.map((word) => {
            const m = marks?.(wi++, 0);
            return { word, weight: m ? m.weight ?? 600 : 400 };
          }),
        );
        rows++;
      }
    } else rows += b.rows;
  }
  const fs = fitFont(weighted, TEXT_W - 12, avail, rows, maxFs);
  const P = Math.round(fs * LINE_HEIGHT);
  const baseOff = baselineIn(P, fs, metrics);
  const blockTop = Math.round(top + (avail - rows * P) / 2);

  let row = 0;
  let firstIndex = 0;
  const placed: PlacedBlock[] = blocks.map((b) => {
    const n = b.kind === "text" ? splitLines(b.text).length : b.rows;
    const p: PlacedBlock = {
      ...b,
      top: blockTop + row * P,
      rows: n,
      height: n * P,
      baselines: Array.from({ length: n }, (_, k) => blockTop + (row + k) * P + baseOff),
      firstIndex,
    };
    row += n;
    if (b.kind === "text") firstIndex += splitLines(b.text).flat().length;
    return p;
  });

  const anchor = blockTop + baseOff + 3;
  const rulesTop = heading ? RULES_TOP_HEADING : RULES_TOP_PLAIN;
  const rules: number[] = [];
  for (let y = anchor - Math.ceil((anchor - rulesTop) / P) * P; y <= RULES_BOTTOM; y += P) {
    if (y >= rulesTop) rules.push(y);
  }
  const g: PageGeometry = { fs, P, baseOff, blocks: placed, rules };

  return (
    <AbsoluteFill>
      <Paper rules={rules} seed={`page-${id}`} />
      <PageNumber n={pageNo} />
      <Sequence from={lead} layout="none" name={`${id}-content`}>
        {underlay?.(g)}
        {heading ? <Heading text={heading} /> : null}
        {placed.map((b, k) =>
          b.kind === "text" ? (
            <InkText
              key={k}
              lines={splitLines(b.text)}
              rowTops={b.baselines.map((y) => y - baseOff)}
              firstIndex={b.firstIndex}
              mode={b.mode}
              fs={fs}
              P={P}
              baseOff={baseOff}
              align={align}
              family={MARKAZI}
              color={b.color}
              marks={marks}
            />
          ) : b.kind === "figure" ? (
            <React.Fragment key={k}>{figure?.(b.key, b, g)}</React.Fragment>
          ) : null,
        )}
        {overlay?.(g)}
        {cover}
      </Sequence>
    </AbsoluteFill>
  );
};
