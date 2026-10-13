import React from "react";
import { AbsoluteFill } from "remotion";
import { RevealText } from "../components/RevealText";
import { ExitFade, PillarHeading, SafeBlock } from "../components/Ornaments";
import { HEADINGS, IHSAA, indexOfWord } from "../content";
import { COLORS, CONTENT_TOP, SAFE_BOX, fitFontSize } from "../theme";
import { sceneFrames } from "../timings";

/** الدين، والأخلاق، والآداب: ذهبية */
const GOLD_WORDS = ["الدِّينِ", "الأخلاقِ", "الآدابِ"].map((w) => indexOfWord(IHSAA, w));

export const S7Ihsaa: React.FC = () => {
  const total = sceneFrames("ihsaa");
  const width = SAFE_BOX.w - 40;
  const boxH = SAFE_BOX.y + SAFE_BOX.h - CONTENT_TOP;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        <PillarHeading text={HEADINGS.ihsaa} />
        <SafeBlock top={CONTENT_TOP}>
          <RevealText
            text={IHSAA}
            mode="line"
            fontSize={fitFontSize(IHSAA, width, boxH)}
            width={width}
            maxHeight={boxH - 20}
            wordStyle={(i) =>
              GOLD_WORDS.includes(i) ? { color: COLORS.gold, fontWeight: 700 } : undefined
            }
          />
        </SafeBlock>
      </AbsoluteFill>
    </ExitFade>
  );
};
