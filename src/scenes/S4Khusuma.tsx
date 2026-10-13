import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { ExitFade, PillarHeading, SafeBlock } from "../components/Ornaments";
import { HEADINGS, KHUSUMA, words } from "../content";
import { COLORS, CONTENT_TOP, SAFE_BOX, fitFontSize, progress } from "../theme";
import { sceneFrames, wordFrame } from "../timings";

const N = words(KHUSUMA).length;
/** «معاذيرَها وعِلَلَها وشُبُهاتِها» = آخر ثلاث كلمات */
const TARGETS = [N - 3, N - 2, N - 1];
const STAGGER = 7;
const CRUMBLE = 34;
const crumbleStart = (k: number) => wordFrame(N) + 2 + k * STAGGER;

/** مرشّح التفتّت: تشويه متزايد + قناع ضوضاء يأكل الكلمة تدريجيًّا */
const CrumbleFilters: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={0} height={0} style={{ position: "absolute" }}>
      <defs>
        {TARGETS.map((_, k) => {
          const p = progress(frame, crumbleStart(k), CRUMBLE, (t) => t);
          return (
            <filter
              key={k}
              id={`crumble-${k}`}
              x="-30%"
              y="-60%"
              width="160%"
              height="220%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={3 + k} result="warp" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="warp"
                scale={p * 46}
                xChannelSelector="R"
                yChannelSelector="G"
                result="moved"
              />
              <feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves={2} seed={11 + k} result="noise" />
              <feColorMatrix
                in="noise"
                type="matrix"
                values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  7 0 0 0 ${3.2 - 10 * p}`}
                result="mask"
              />
              <feComposite in="moved" in2="mask" operator="in" />
            </filter>
          );
        })}
      </defs>
    </svg>
  );
};

const DUST = 18;

const Dust: React.FC<{ k: number; frame: number }> = ({ k, frame }) => {
  const s = crumbleStart(k);
  if (frame < s) return null;
  return (
    <span style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: DUST }).map((_, j) => {
        const seed = `dust-${k}-${j}`;
        const delay = random(`${seed}-d`) * 18;
        const life = 26 + random(`${seed}-l`) * 20;
        const t = interpolate(frame, [s + delay, s + delay + life], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        if (t <= 0 || t >= 1) return null;
        const x0 = 8 + random(`${seed}-x`) * 84;
        const y0 = 25 + random(`${seed}-y`) * 50;
        const dx = (random(`${seed}-dx`) - 0.65) * 90 * t;
        const dy = (24 + random(`${seed}-dy`) * 70) * t;
        const size = 2.5 + random(`${seed}-s`) * 3.5;
        const o = interpolate(t, [0, 0.15, 1], [0, 0.85, 0]);
        return (
          <span
            key={j}
            style={{
              position: "absolute",
              left: `${x0}%`,
              top: `${y0}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: j % 3 === 0 ? COLORS.ivory : COLORS.cold,
              opacity: o,
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </span>
  );
};

export const S4Khusuma: React.FC = () => {
  const total = sceneFrames("khusuma");
  const width = SAFE_BOX.w - 40;
  const boxH = SAFE_BOX.y + SAFE_BOX.h - CONTENT_TOP;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        <CrumbleFilters />
        <PillarHeading text={HEADINGS.khusuma} />
        <SafeBlock top={CONTENT_TOP}>
          <RevealText
            text={KHUSUMA}
            mode="line"
            fontSize={fitFontSize(KHUSUMA, width, boxH)}
            width={width}
            maxHeight={boxH - 20}
            wordStyle={(i) =>
              TARGETS.includes(i) ? { color: COLORS.cold, fontWeight: 700 } : undefined
            }
            innerStyle={(i, { frame }) => {
              const k = TARGETS.indexOf(i);
              if (k < 0) return undefined;
              const p = progress(frame, crumbleStart(k), CRUMBLE, (t) => t);
              return {
                filter: p > 0 ? `url(#crumble-${k}) blur(${p * 2.5}px)` : undefined,
                opacity: 1 - progress(frame, crumbleStart(k) + CRUMBLE * 0.55, CRUMBLE * 0.45),
                transform: p > 0 ? `translateY(${p * 10}px)` : undefined,
              };
            }}
            wordDecor={(i, { frame }) => {
              const k = TARGETS.indexOf(i);
              return k < 0 ? null : <Dust k={k} frame={frame} />;
            }}
          />
        </SafeBlock>
      </AbsoluteFill>
    </ExitFade>
  );
};
