import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { SafeBlock } from "../components/Ornaments";
import { ATTRIBUTION, KHATIMA, words } from "../content";
import { AMIRI } from "../fonts";
import { COLORS, LINE_HEIGHT, MIN_FONT, SAFE_BOX, fitFontSize, progress, reveal } from "../theme";
import { wordFrame } from "../timings";

const N = words(KHATIMA).length;
/** «أفضلُ ذوي الألبابِ» بالذهبي */
const GOLD = [0, 1, 2];

const Attribution: React.FC = () => {
  const frame = useCurrentFrame();
  const at = wordFrame(N);
  const dash = progress(frame, at + 8, 20);
  return (
    <div
      style={{
        marginTop: 46,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 22,
        direction: "rtl",
        fontFamily: AMIRI,
        fontSize: MIN_FONT,
        lineHeight: LINE_HEIGHT,
        color: COLORS.gold,
        ...reveal(frame, at, 24),
      }}
    >
      <span>{ATTRIBUTION[0]}</span>
      <span
        style={{
          display: "inline-block",
          width: 46,
          height: 2,
          background: COLORS.gold,
          transform: `scaleX(${dash})`,
          opacity: 0.85,
        }}
      />
      <span>{ATTRIBUTION[1]}</span>
    </div>
  );
};

export const S9Khatima: React.FC = () => {
  const width = SAFE_BOX.w - 60;
  return (
    <AbsoluteFill>
      <SafeBlock>
        <RevealText
          text={KHATIMA}
          mode="line"
          fontSize={fitFontSize(KHATIMA, width, SAFE_BOX.h * 0.45, { max: 76 })}
          width={width}
          maxHeight={SAFE_BOX.h * 0.7}
          fontWeight={700}
          style={{ textWrap: "balance" }}
          wordStyle={(i) => (GOLD.includes(i) ? { color: COLORS.gold } : undefined)}
        />
        <Attribution />
      </SafeBlock>
    </AbsoluteFill>
  );
};
