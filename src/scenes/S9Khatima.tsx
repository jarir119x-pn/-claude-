import React from "react";
import { useCurrentFrame } from "remotion";
import { Leather } from "../components/Desk";
import { Fleuron, wipeMask } from "../components/Ink";
import { baselineIn, useFontMetrics } from "../components/layout";
import { NotebookPage, PlacedBlock } from "../components/NotebookPage";
import { ATTRIBUTION, KHATIMA, words } from "../content";
import { MARKAZI } from "../fonts";
import { C, EASE_IN_OUT, LINEAR, MIN_FONT, PAPER, TEXT_LEFT, TEXT_W, progress } from "../theme";
import { BOOK_CLOSE_FRAMES, unitFrames, wordFrame } from "../timings";

const N = words(KHATIMA).length;
const NA = ATTRIBUTION.reduce((n, t) => n + words(t).length, 0);

/** «ابن المقفع — الأدب الصغير» بخط أصغر على سطر الدفتر، والشرطة خط رفيع */
const Attribution: React.FC<{ b: PlacedBlock; P: number; baseOff: number }> = ({ b, P, baseOff }) => {
  const frame = useCurrentFrame();
  const m = useFontMetrics();
  if (!m) return null;
  const at = wordFrame(N);
  const p = progress(frame, at, wordFrame(NA), LINEAR);
  const shift = baseOff - baselineIn(P, MIN_FONT, m);
  return (
    <div
      style={{
        position: "absolute",
        top: b.top + shift,
        left: TEXT_LEFT,
        width: TEXT_W,
        height: P,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          direction: "rtl",
          fontFamily: MARKAZI,
          fontSize: MIN_FONT,
          lineHeight: `${P}px`,
          color: C.warmGray,
          padding: "0 6px",
          opacity: progress(frame, at, 6),
          ...wipeMask(p),
        }}
      >
        <span>{ATTRIBUTION[0]}</span>
        <span style={{ width: 40, height: 2, background: C.terracotta, marginTop: 6 }} />
        <span>{ATTRIBUTION[1]}</span>
      </div>
    </div>
  );
};

/** يُغلق الدفتر ببطء ويظهر غلافه الجلدي */
const Cover: React.FC = () => {
  const frame = useCurrentFrame();
  const closeAt = unitFrames(N + NA); // بعد تثبيت الخاتمة
  const p = progress(frame, closeAt, Math.round(BOOK_CLOSE_FRAMES * 0.65), EASE_IN_OUT);
  if (p <= 0) return null;
  const angle = 180 - 180 * p;
  const spine = PAPER.x + PAPER.w;
  const shade = Math.sin(p * Math.PI) * 0.35;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        perspective: 2600,
        perspectiveOrigin: `${spine}px 50%`,
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${spine + 8}px 50%`,
          transform: `rotateY(${angle}deg)`,
          backfaceVisibility: "hidden",
        }}
      >
        <Leather
          style={{
            left: PAPER.x - 14,
            top: PAPER.y - 10,
            width: PAPER.w + 22,
            height: PAPER.h + 22,
            boxShadow: "0 24px 40px rgba(74,53,40,0.25)",
          }}
        >
          {/* تذهيب أعمى: إطاران رفيعان وزهرة في الوسط، بلا نص */}
          {[38, 52].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: i,
                border: "2px solid rgba(255,222,186,0.20)",
                borderRadius: 6,
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Fleuron size={110} color="rgba(60,28,12,0.38)" />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 14,
              background: `linear-gradient(to left, rgba(0,0,0,0) 0%, rgba(40,20,10,${shade}) 100%)`,
            }}
          />
        </Leather>
      </div>
    </div>
  );
};

export const S9Khatima: React.FC = () => (
  <NotebookPage
    id="khatima"
    pageNo={10}
    maxFs={72}
    align="center"
    blocks={[
      { kind: "text", text: KHATIMA, mode: "line" },
      { kind: "gap", rows: 1 },
      { kind: "figure", rows: 1, key: "attribution" },
    ]}
    marks={(i) => (i <= 2 ? {} : undefined)}
    figure={(_, b, g) => <Attribution b={b} P={g.P} baseOff={g.baseOff} />}
    cover={<Cover />}
  />
);
