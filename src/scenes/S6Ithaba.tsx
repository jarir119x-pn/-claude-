import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { NotebookPage } from "../components/NotebookPage";
import { HEADINGS, ITHABA, indexOfWord } from "../content";
import { EASE_IN_OUT, progress } from "../theme";
import { wordFrame } from "../timings";

/** النصف الثاني يبدأ عند «ويعاقبُ» */
const TURN = indexOfWord(ITHABA, "ويعاقبُ");

/** شمس تدفأ في النصف الأول، ثم يمرّ ظل سحابة فيبرد المشهد */
const Light: React.FC = () => {
  const frame = useCurrentFrame();
  const warm = progress(frame, 0, 60, EASE_IN_OUT);
  const t0 = wordFrame(TURN) - 6;
  const cool = progress(frame, t0 + 10, 40, EASE_IN_OUT);
  const sweep = interpolate(frame, [t0, t0 + 50], [1400, -1400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN_OUT,
  });
  return (
    <>
      <AbsoluteFill
        style={{
          mixBlendMode: "multiply",
          opacity: warm * (1 - cool) * 0.9,
          background:
            "radial-gradient(ellipse 80% 55% at 62% 40%, rgba(247,214,170,0.55) 0%, rgba(247,214,170,0.25) 60%, rgba(247,214,170,0.1) 100%)",
        }}
      />
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: warm * (1 - cool),
          background:
            "radial-gradient(ellipse 60% 40% at 62% 38%, rgba(255,226,180,0.22) 0%, rgba(255,226,180,0) 70%)",
        }}
      />
      {/* ظل السحابة يعبر ثم يستقر برودةً خافتة */}
      <AbsoluteFill style={{ mixBlendMode: "multiply" }}>
        <div
          style={{
            position: "absolute",
            top: -300,
            left: sweep,
            width: 1600,
            height: 2500,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(150,158,160,0.45), rgba(150,158,160,0))",
            filter: "blur(30px)",
            opacity: frame >= t0 ? 1 : 0,
          }}
        />
        <AbsoluteFill style={{ background: "rgba(196,202,204,1)", opacity: cool * 0.55 }} />
      </AbsoluteFill>
    </>
  );
};

export const S6Ithaba: React.FC = () => (
  <NotebookPage
    id="ithaba"
    heading={HEADINGS.ithaba}
    pageNo={7}
    maxFs={64}
    blocks={[{ kind: "text", text: ITHABA, mode: "line" }]}
    overlay={() => <Light />}
  />
);
