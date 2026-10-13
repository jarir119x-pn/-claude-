import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Fleuron, InkText, wipeMask } from "../components/Ink";
import { fitFont, useFontMetrics } from "../components/layout";
import { splitLines } from "../components/NotebookPage";
import { Paper } from "../components/Paper";
import { TITLE, TITLE_LABEL, words } from "../content";
import { MESSIRI } from "../fonts";
import { C, LINEAR, SAFE_BOX, TEXT_W, progress } from "../theme";
import { wordFrame } from "../timings";

const TITLE_MAX = 112;
const LABEL_FS = 54;

/** صفحة عنوان كتاب قديم: «من الأدب الصغير» ثم العنوان ثم ❦ */
export const S1Title: React.FC = () => {
  const frame = useCurrentFrame();
  const metrics = useFontMetrics();
  if (!metrics) return null;
  const lines = splitLines(TITLE);
  const TITLE_FS = fitFont(
    lines.map((l) => l.map((word) => ({ word, weight: 600 }))),
    TEXT_W - 40,
    10000,
    1,
    TITLE_MAX,
    MESSIRI,
  );
  const TITLE_P = Math.round(TITLE_FS * 1.55);
  const n = words(TITLE).length;
  const blockH = 90 + 34 + 2 + 40 + lines.length * TITLE_P + 26 + 64;
  const top = Math.round(SAFE_BOX.y + (SAFE_BOX.h - blockH) / 2);
  const titleTop = top + 90 + 34 + 2 + 40;
  const fleuronTop = titleTop + lines.length * TITLE_P + 26;
  const fl = progress(frame, wordFrame(n) - 6, 24);
  return (
    <AbsoluteFill>
      <Paper margin={false} seed="page-title" />
      <div
        style={{
          position: "absolute",
          top,
          left: SAFE_BOX.x,
          width: SAFE_BOX.w,
          textAlign: "center",
          direction: "rtl",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontFamily: MESSIRI,
            fontWeight: 600,
            fontSize: LABEL_FS,
            lineHeight: "90px",
            color: C.warmGray,
            padding: "0 6px",
            opacity: progress(frame, 0, 6),
            ...wipeMask(progress(frame, 0, 22, LINEAR)),
          }}
        >
          {TITLE_LABEL}
        </span>
        <div
          style={{
            margin: "34px auto 0",
            width: 120 * progress(frame, 10, 24),
            height: 2,
            background: C.terracotta,
          }}
        />
      </div>
      <InkText
        lines={lines}
        rowTops={lines.map((_, r) => titleTop + r * TITLE_P)}
        firstIndex={0}
        mode="line"
        fs={TITLE_FS}
        P={TITLE_P}
        baseOff={TITLE_P * 0.7}
        align="center"
        family={MESSIRI}
        color={C.rust}
        marks={() => ({ weight: 600, tintAt: null, underlineAt: null })}
      />
      <div
        style={{
          position: "absolute",
          top: fleuronTop,
          left: SAFE_BOX.x,
          width: SAFE_BOX.w,
          display: "flex",
          justifyContent: "center",
          opacity: fl,
          transform: `translateY(${(1 - fl) * 10}px)`,
        }}
      >
        <Fleuron size={64} />
      </div>
    </AbsoluteFill>
  );
};
