import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { octagramPath } from "../components/Background";
import { ExitFade, PillarHeading } from "../components/Ornaments";
import { CYCLE_WORDS, HEADINGS, MUHASABA_CARDS, words } from "../content";
import { KUFI } from "../fonts";
import {
  COLORS,
  CONTENT_TOP,
  EASE_IN_OUT,
  SAFE_BOX,
  fitFontSize,
  progress,
  reveal,
} from "../theme";
import { CARD_FRAMES, sceneFrames, wordFrame } from "../timings";

const CARD = {
  x: SAFE_BOX.x,
  y: CONTENT_TOP + 10,
  w: SAFE_BOX.w,
  h: SAFE_BOX.y + SAFE_BOX.h - CONTENT_TOP - 30,
};
const PAD = 56;
const NUMERALS = ["١", "٢", "٣"];

const Card: React.FC<{ index: number; children: React.ReactNode }> = ({
  index,
  children,
}) => {
  const frame = useCurrentFrame();
  const corners = [
    [0, 0],
    [CARD.w, 0],
    [0, CARD.h],
    [CARD.w, CARD.h],
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.x,
        top: CARD.y,
        width: CARD.w,
        height: CARD.h,
        ...reveal(frame, 0, 20),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(10,16,30,0.62), rgba(10,16,30,0.42))",
          border: "2px solid rgba(201,164,92,0.38)",
          boxShadow: "inset 0 0 0 10px rgba(10,16,30,0.0), inset 0 0 60px rgba(0,0,0,0.25)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 12,
          border: "2px solid rgba(201,164,92,0.14)",
        }}
      />
      <svg
        width={CARD.w}
        height={CARD.h}
        style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
      >
        {corners.map(([x, y], i) => (
          <path
            key={i}
            d={octagramPath(x, y, 12)}
            fill={COLORS.navyDeep}
            stroke={COLORS.gold}
            strokeWidth={2}
          />
        ))}
        <path
          d={`M ${CARD.w / 2} -24 L ${CARD.w / 2 + 24} 0 L ${CARD.w / 2} 24 L ${CARD.w / 2 - 24} 0 Z`}
          fill={COLORS.navyDeep}
          stroke={COLORS.gold}
          strokeWidth={2}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: -24,
          left: CARD.w / 2 - 24,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: KUFI,
          fontWeight: 700,
          fontSize: 24,
          color: COLORS.gold,
          direction: "rtl",
        }}
      >
        {NUMERALS[index]}
      </div>
      <div
        style={{
          position: "absolute",
          inset: PAD,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** حلقة زخرفية: دورة لكلٍّ من الحَوْل والشهر واليوم، بأحجام متناقصة */
const RINGS = [
  { r: 180, ticks: 12 },
  { r: 132, ticks: 30 },
  { r: 88, ticks: 24 },
];
const RING_BOX = 420;

const CycleRing: React.FC<{ cycleStarts: number[]; end: number }> = ({
  cycleStarts,
  end,
}) => {
  const frame = useCurrentFrame();
  const c = RING_BOX / 2;
  const appear = progress(frame, 0, 24);
  const SWAP = 16;
  return (
    <svg width={RING_BOX} height={RING_BOX} style={{ overflow: "visible", opacity: appear }}>
      {RINGS.map((ring, k) => {
        const s = cycleStarts[k];
        const e = k < 2 ? cycleStarts[k + 1] : end;
        const p = progress(frame, s, e - s, EASE_IN_OUT);
        // ظهور الحلقة: الأولى من البداية، والتالية تنكمش إليها من حجم سابقتها
        const inP = k === 0 ? 1 : progress(frame, s, SWAP);
        const outP = k < 2 ? progress(frame, e, SWAP) : 0;
        const prevR = k === 0 ? ring.r : RINGS[k - 1].r;
        const nextR = k < 2 ? RINGS[k + 1].r : ring.r;
        const scale =
          (interpolate(inP, [0, 1], [prevR / ring.r, 1]) *
            interpolate(outP, [0, 1], [1, nextR / ring.r]));
        const opacity = inP * (1 - outP);
        if (opacity <= 0.001) return null;
        const rot = p * 360;
        const arcLen = 2 * Math.PI * (ring.r + 22);
        const head = (rot - 90) * (Math.PI / 180);
        return (
          <g
            key={k}
            opacity={opacity}
            transform={`translate(${c} ${c}) scale(${scale})`}
          >
            <circle r={ring.r} fill="none" stroke={COLORS.gold} strokeWidth={2} opacity={0.55} />
            <circle r={ring.r - 14} fill="none" stroke={COLORS.gold} strokeWidth={2} opacity={0.22} />
            <g transform={`rotate(${rot})`}>
              {Array.from({ length: ring.ticks }).map((_, i) => {
                const a = (i / ring.ticks) * Math.PI * 2;
                const major = ring.ticks === 12 || i % (ring.ticks / 6) === 0;
                const r1 = ring.r - (major ? 14 : 8);
                return (
                  <line
                    key={i}
                    x1={Math.cos(a) * r1}
                    y1={Math.sin(a) * r1}
                    x2={Math.cos(a) * ring.r}
                    y2={Math.sin(a) * ring.r}
                    stroke={COLORS.gold}
                    strokeWidth={major ? 2.5 : 2}
                    opacity={major ? 0.9 : 0.5}
                  />
                );
              })}
            </g>
            {/* قوس التقدّم: تكتمل الدائرة باكتمال الدورة */}
            <circle
              r={ring.r + 22}
              fill="none"
              stroke={COLORS.gold}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${arcLen * p} ${arcLen}`}
              transform="rotate(-90)"
            />
            {p > 0 && p < 1 ? (
              <path
                d={octagramPath(Math.cos(head) * (ring.r + 22), Math.sin(head) * (ring.r + 22), 9)}
                fill={COLORS.gold}
                stroke="none"
              />
            ) : null}
            <path
              d={octagramPath(0, 0, ring.r * 0.28)}
              fill="none"
              stroke={COLORS.gold}
              strokeWidth={2}
              opacity={0.7}
              transform={`rotate(${-rot / 2})`}
            />
          </g>
        );
      })}
    </svg>
  );
};

const innerW = CARD.w - PAD * 2;
const innerH = CARD.h - PAD * 2;

const CardA: React.FC = () => (
  <RevealText
    text={MUHASABA_CARDS[0]}
    mode="line"
    fontSize={fitFontSize(MUHASABA_CARDS[0], innerW, innerH)}
    width={innerW}
    maxHeight={innerH}
  />
);

const CardB: React.FC = () => {
  const text = MUHASABA_CARDS[1];
  const n = words(text).length;
  const starts = CYCLE_WORDS.map((i) => wordFrame(i));
  const textH = innerH - RING_BOX - 30;
  return (
    <>
      <CycleRing cycleStarts={starts} end={wordFrame(n) + 18} />
      <div style={{ height: 30 }} />
      <RevealText
        text={text}
        mode="word"
        fontSize={fitFontSize(text, innerW, textH, { max: 72 })}
        width={innerW}
        maxHeight={textH}
        wordStyle={(i) =>
          (CYCLE_WORDS as readonly number[]).includes(i) ? { color: COLORS.gold, fontWeight: 700 } : undefined
        }
      />
    </>
  );
};

const CardC: React.FC = () => (
  <RevealText
    text={MUHASABA_CARDS[2]}
    mode="line"
    fontSize={fitFontSize(MUHASABA_CARDS[2], innerW, innerH, { max: 72 })}
    width={innerW}
    maxHeight={innerH}
  />
);

const CARDS = [CardA, CardB, CardC];

export const S3Muhasaba: React.FC = () => {
  const total = sceneFrames("muhasaba");
  let offset = 0;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        <PillarHeading text={HEADINGS.muhasaba} />
        {CARDS.map((C, i) => {
          const from = offset;
          offset += CARD_FRAMES[i];
          return (
            <Sequence key={i} from={from} durationInFrames={CARD_FRAMES[i]} layout="none">
              {i < CARDS.length - 1 ? (
                <ExitFade duration={CARD_FRAMES[i]}>
                  <Card index={i}>
                    <C />
                  </Card>
                </ExitFade>
              ) : (
                <Card index={i}>
                  <C />
                </Card>
              )}
            </Sequence>
          );
        })}
      </AbsoluteFill>
    </ExitFade>
  );
};
