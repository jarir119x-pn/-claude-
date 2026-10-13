import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { ExitFade, PillarHeading, SafeBlock } from "../components/Ornaments";
import { HEADINGS, ITHABA, indexOfWord } from "../content";
import { CONTENT_TOP, EASE_IN_OUT, SAFE_BOX, fitFontSize, mix, progress } from "../theme";
import { sceneFrames, wordFrame } from "../timings";

/** النصف الثاني يبدأ عند «ويعاقبُ» */
const TURN = indexOfWord(ITHABA, "ويعاقبُ");
const WARM_TEXT = "#F6E7C9";
const COOL_TEXT = "#D3D6DC";

export const S6Ithaba: React.FC = () => {
  const frame = useCurrentFrame();
  const total = sceneFrames("ithaba");
  const warm = progress(frame, 0, 30);
  const cool = progress(frame, wordFrame(TURN) - 4, 45, EASE_IN_OUT);
  const width = SAFE_BOX.w - 40;
  const boxH = SAFE_BOX.y + SAFE_BOX.h - CONTENT_TOP;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        {/* إضاءة دافئة… */}
        <AbsoluteFill
          style={{
            opacity: warm * (1 - cool),
            background:
              "radial-gradient(ellipse 75% 45% at 50% 52%, rgba(214,170,90,0.24) 0%, rgba(201,164,92,0.08) 50%, rgba(201,164,92,0) 80%)",
          }}
        />
        {/* …تبرد وتخفت */}
        <AbsoluteFill
          style={{
            opacity: cool,
            background:
              "radial-gradient(ellipse 75% 45% at 50% 52%, rgba(122,134,153,0.14) 0%, rgba(122,134,153,0.04) 50%, rgba(0,0,0,0) 80%), rgba(3,6,12,0.38)",
          }}
        />
        <PillarHeading text={HEADINGS.ithaba} />
        <SafeBlock top={CONTENT_TOP}>
          <RevealText
            text={ITHABA}
            mode="line"
            fontSize={fitFontSize(ITHABA, width, boxH)}
            width={width}
            maxHeight={boxH - 20}
            style={{ filter: `brightness(${1 - 0.12 * cool})` }}
            wordStyle={(i) => ({
              color:
                i < TURN
                  ? mix(WARM_TEXT, COOL_TEXT, cool * 0.6)
                  : mix(WARM_TEXT, COOL_TEXT, cool),
              textShadow: `0 0 22px rgba(201,164,92,${0.22 * warm * (1 - cool)})`,
            })}
          />
        </SafeBlock>
      </AbsoluteFill>
    </ExitFade>
  );
};

