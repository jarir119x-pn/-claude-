import React from "react";
import { interpolate } from "remotion";
import { RevealText } from "../components/RevealText";
import { ExitFade, SafeBlock } from "../components/Ornaments";
import { PILLARS, PILLAR_WORDS, words } from "../content";
import { COLORS, SAFE_BOX, fitFontSize, mix, progress } from "../theme";
import { sceneFrames, wordFrame } from "../timings";

const GLOW_STAGGER = 10;

export const S2Pillars: React.FC = () => {
  const total = sceneFrames("pillars");
  const n = words(PILLARS).length;
  // التوهّج يبدأ لحظة اكتمال ظهور الفقرة، ركنًا بعد ركن
  const glowStart = wordFrame(n) - 4;
  const width = SAFE_BOX.w - 40;
  return (
    <ExitFade duration={total}>
      <SafeBlock>
        <RevealText
          text={PILLARS}
          mode="line"
          fontSize={fitFontSize(PILLARS, width, SAFE_BOX.h * 0.6, { max: 78 })}
          width={width}
          maxHeight={SAFE_BOX.h - 40}
          style={{ textWrap: "balance" }}
          wordStyle={(i, { frame }) => {
            const k = PILLAR_WORDS.findIndex((ws) => ws.includes(i));
            if (k < 0) return undefined;
            const s = glowStart + k * GLOW_STAGGER;
            const lit = progress(frame, s, 12);
            const peak = interpolate(frame, [s, s + 9, s + 34], [0, 1, 0.5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return {
              color: mix(COLORS.ivory, COLORS.gold, lit),
              fontWeight: 700,
              textShadow: `0 0 ${10 + 26 * peak}px rgba(201,164,92,${0.55 * peak})`,
            };
          }}
        />
      </SafeBlock>
    </ExitFade>
  );
};
