import React from "react";
import { useCurrentFrame } from "remotion";
import { NotebookPage, PlacedBlock } from "../components/NotebookPage";
import { CALENDAR_LABELS, CYCLE_NOUNS, CYCLE_VERBS, HEADINGS, MUHASABA_CARDS, indexOfWord } from "../content";
import { MARKAZI } from "../fonts";
import { C, EASE_IN_OUT, TEXT_LEFT, TEXT_W, progress } from "../theme";
import { wordFrame } from "../timings";

const A = MUHASABA_CARDS[0];
const A_MARKS = [indexOfWord(A, "أيّامُها"), indexOfWord(A, "المعدودةُ")];

export const S3MuhasabaA: React.FC = () => (
  <NotebookPage
    id="muhasaba-a"
    heading={HEADINGS.muhasaba}
    pageNo={2}
    maxFs={66}
    blocks={[{ kind: "text", text: A, mode: "line" }]}
    marks={(i) => (A_MARKS.includes(i) ? {} : undefined)}
  />
);

const PAD_COLORS = [C.terracotta, C.camel, C.sage];
const PAD_SCALES = [1, 0.86, 0.72];

/** بطاقة تقويم ورقية صغيرة تُقلب ورقتها العليا عند كلمتها */
const CalendarPad: React.FC<{
  k: number;
  h: number;
  x: number;
  bottom: number;
}> = ({ k, h, x, bottom }) => {
  const frame = useCurrentFrame();
  const w = Math.round(h * 0.8);
  const head = Math.round(h * 0.2);
  const appear = progress(frame, k * 6, 20);
  const flipAt = wordFrame(CYCLE_VERBS[k]) + 4;
  const flip = progress(frame, flipAt, 18, EASE_IN_OUT);
  const active = progress(frame, wordFrame(CYCLE_NOUNS[k]), 12);
  const labelFs = Math.max(54, Math.round(h * 0.25));
  const sheet = (style?: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: head,
        bottom: 0,
        background: C.paper,
        border: `2px solid ${C.rule}`,
        borderTop: "none",
        borderRadius: "0 0 8px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: MARKAZI,
        fontWeight: 600,
        fontSize: labelFs,
        lineHeight: 1,
        color: C.ink,
        direction: "rtl",
        ...style,
      }}
    >
      {CALENDAR_LABELS[k]}
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: bottom - h,
        width: w,
        height: h,
        opacity: appear,
        transform: `translateY(${(1 - appear) * 16 - active * 6}px)`,
        perspective: 900,
        filter: "drop-shadow(0 8px 10px rgba(74,53,40,0.16))",
      }}
    >
      {/* أوراق تحت الورقة العليا */}
      {[8, 4].map((d) => (
        <div
          key={d}
          style={{
            position: "absolute",
            left: d / 2,
            right: -d / 2,
            top: head + d,
            bottom: -d,
            background: d === 8 ? "#EDE4D5" : "#F4EEE2",
            borderRadius: "0 0 8px 8px",
          }}
        />
      ))}
      {sheet()}
      {/* الورقة التي تُقلب */}
      {flip < 1
        ? sheet({
            transformOrigin: "50% 0",
            transform: `rotateX(${flip * 175}deg)`,
            backfaceVisibility: "hidden",
            boxShadow: `inset 0 ${-40 * flip}px 40px rgba(74,53,40,${0.18 * flip})`,
          })
        : null}
      {/* الرأس الملوّن مع حلقتي التجليد */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: head,
          background: PAD_COLORS[k],
          borderRadius: "8px 8px 0 0",
        }}
      />
      {/* حلقتا التجليد: ثقب في الرأس وحلقة معدنية فوقه */}
      <svg width={w} height={head} style={{ position: "absolute", left: 0, top: -14, overflow: "visible" }}>
        {[0.3, 0.7].map((f) => (
          <g key={f}>
            <circle cx={w * f} cy={22} r={5} fill="rgba(74,53,40,0.55)" />
            <path
              d={`M ${w * f - 6} 22 C ${w * f - 7} 2, ${w * f + 7} 2, ${w * f + 6} 22`}
              fill="none"
              stroke={C.ink}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

const Calendars: React.FC<{ b: PlacedBlock }> = ({ b }) => {
  const gap = 40;
  // أكبر ارتفاع يجعل البطاقات الثلاث تتّسع لعرض النص
  const sumScale = PAD_SCALES.reduce((a, c) => a + c, 0);
  const maxH = Math.min(b.height - 30, (TEXT_W - 30 - gap * 2) / (0.8 * sumScale));
  const hs = PAD_SCALES.map((s) => Math.round(maxH * s));
  const ws = hs.map((h) => Math.round(h * 0.8));
  const total = ws.reduce((a, c) => a + c, 0) + gap * 2;
  const cx = TEXT_LEFT + TEXT_W / 2;
  // من اليمين إلى اليسار: سنة، شهر، يوم
  let right = cx + total / 2;
  return (
    <>
      {hs.map((h, k) => {
        const x = right - ws[k];
        right = x - gap;
        return <CalendarPad key={k} k={k} h={h} x={x} bottom={b.top + b.height - 12} />;
      })}
    </>
  );
};

export const S3MuhasabaB: React.FC = () => (
  <NotebookPage
    id="muhasaba-b"
    heading={HEADINGS.muhasaba}
    pageNo={3}
    maxFs={66}
    blocks={[
      { kind: "figure", rows: 4, key: "calendars" },
      { kind: "gap", rows: 1 },
      { kind: "text", text: MUHASABA_CARDS[1], mode: "word" },
    ]}
    marks={(i) => (CYCLE_NOUNS.includes(i) ? {} : undefined)}
    figure={(_, b) => <Calendars b={b} />}
  />
);

const Cc = MUHASABA_CARDS[2];
const C_MARKS = [indexOfWord(Cc, "كتابٍ")];

export const S3MuhasabaC: React.FC = () => (
  <NotebookPage
    id="muhasaba-c"
    heading={HEADINGS.muhasaba}
    pageNo={4}
    maxFs={66}
    blocks={[{ kind: "text", text: Cc, mode: "line" }]}
    marks={(i) => (C_MARKS.includes(i) ? {} : undefined)}
  />
);
