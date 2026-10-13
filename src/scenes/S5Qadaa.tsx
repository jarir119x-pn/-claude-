import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { Divider, ExitFade, PillarHeading, SafeBlock } from "../components/Ornaments";
import { HEADINGS, QADAA, words } from "../content";
import { KUFI } from "../fonts";
import { COLORS, CONTENT_TOP, EASE_IN_OUT, LINE_HEIGHT, SAFE_BOX, W, progress, reveal } from "../theme";
import { sceneFrames, wordFrame } from "../timings";

// ترتيب الكلمات: المقدمة ← «السيئة» ← أوصافها ← «الحسنة» ← أوصافها
const nIntro = words(QADAA.intro).length;
const nBad = words(QADAA.bad).length;
const BAD_LABEL_AT = nIntro;
const BAD_AT = BAD_LABEL_AT + 1;
const GOOD_LABEL_AT = BAD_AT + nBad;
const GOOD_AT = GOOD_LABEL_AT + 1;

const INTRO_H = 130;
const SPLIT_Y = Math.round(
  (CONTENT_TOP + INTRO_H + SAFE_BOX.y + SAFE_BOX.h) / 2,
); // منتصف ما تحت المقدمة

const Label: React.FC<{ text: string; at: number; color: string }> = ({ text, at, color }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: KUFI,
        fontWeight: 700,
        fontSize: 48,
        lineHeight: LINE_HEIGHT,
        color,
        ...reveal(frame, at, 18),
      }}
    >
      {text}
    </div>
  );
};

export const S5Qadaa: React.FC = () => {
  const frame = useCurrentFrame();
  const total = sceneFrames("qadaa");
  const split = wordFrame(BAD_LABEL_AT) - 6;
  const line = progress(frame, split, 26, EASE_IN_OUT);
  const coldOpen = progress(frame, split + 6, 40);
  const warmOpen = progress(frame, wordFrame(GOOD_LABEL_AT) - 4, 40);
  const width = SAFE_BOX.w - 40;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        {/* النصف الأعلى: بارد */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: W,
            top: 0,
            height: SPLIT_Y,
            background: `linear-gradient(0deg, rgba(122,134,153,${0.2 * coldOpen}) 0%, rgba(122,134,153,${0.07 * coldOpen}) 45%, rgba(122,134,153,0) 85%)`,
          }}
        />
        {/* النصف الأسفل: ذهبي دافئ */}
        <div
          style={{
            position: "absolute",
            left: 0,
            width: W,
            top: SPLIT_Y,
            bottom: 0,
            background: `linear-gradient(180deg, rgba(201,164,92,${0.22 * warmOpen}) 0%, rgba(201,164,92,${0.08 * warmOpen}) 45%, rgba(201,164,92,0) 85%)`,
          }}
        />
        {/* خط الانقسام */}
        <div
          style={{
            position: "absolute",
            top: SPLIT_Y - 14,
            left: 0,
            width: W,
          }}
        >
          <Divider p={line} width={W - 40} />
        </div>

        <PillarHeading text={HEADINGS.qadaa} />
        <SafeBlock top={CONTENT_TOP} bottom={CONTENT_TOP + INTRO_H}>
          <RevealText text={QADAA.intro} mode="word" fontSize={62} width={width} />
        </SafeBlock>

        <SafeBlock top={CONTENT_TOP + INTRO_H} bottom={SPLIT_Y - 20}>
          <Label text={QADAA.badLabel} at={wordFrame(BAD_LABEL_AT)} color={COLORS.cold} />
          <RevealText
            text={QADAA.bad}
            mode="word"
            start={wordFrame(BAD_AT)}
            fontSize={84}
            fontWeight={700}
            width={width}
            color={COLORS.cold}
          />
        </SafeBlock>

        <SafeBlock top={SPLIT_Y + 20} bottom={SAFE_BOX.y + SAFE_BOX.h}>
          <Label text={QADAA.goodLabel} at={wordFrame(GOOD_LABEL_AT)} color={COLORS.gold} />
          <RevealText
            text={QADAA.good}
            mode="word"
            start={wordFrame(GOOD_AT)}
            fontSize={84}
            fontWeight={700}
            width={width}
            color={COLORS.gold}
            style={{ textShadow: "0 0 28px rgba(201,164,92,0.35)" }}
          />
        </SafeBlock>
      </AbsoluteFill>
    </ExitFade>
  );
};
