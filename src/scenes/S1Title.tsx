import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { octagramPath } from "../components/Background";
import { ExitFade } from "../components/Ornaments";
import { TITLE } from "../content";
import { AMIRI } from "../fonts";
import { COLORS, EASE_IN_OUT, SAFE_CENTER_X, SAFE_CENTER_Y, progress } from "../theme";
import { sceneFrames } from "../timings";

const FW = 760;
const FH = 480;

/** مستطيل بزوايا مشطوفة */
const notched = (x: number, y: number, w: number, h: number, n: number) =>
  `M ${x + n} ${y} L ${x + w - n} ${y} L ${x + w} ${y + n} L ${x + w} ${y + h - n} L ${x + w - n} ${y + h} L ${x + n} ${y + h} L ${x} ${y + h - n} L ${x} ${y + n} Z`;

const OrnateFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const outer = progress(frame, 0, 62, EASE_IN_OUT);
  const inner = progress(frame, 12, 62, EASE_IN_OUT);
  const stars = progress(frame, 48, 30);
  const pad = 30;
  const corners = [
    [pad, pad],
    [FW + pad, pad],
    [pad, FH + pad],
    [FW + pad, FH + pad],
  ];
  return (
    <svg
      width={FW + pad * 2}
      height={FH + pad * 2}
      style={{
        position: "absolute",
        left: SAFE_CENTER_X - FW / 2 - pad,
        top: SAFE_CENTER_Y - FH / 2 - pad,
        overflow: "visible",
      }}
    >
      <g fill="none" stroke={COLORS.gold} strokeLinejoin="round">
        <path
          d={notched(pad, pad, FW, FH, 36)}
          strokeWidth={2.5}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - outer}
        />
        <path
          d={notched(pad + 16, pad + 16, FW - 32, FH - 32, 24)}
          strokeWidth={2}
          opacity={0.55}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - inner}
        />
        {corners.map(([x, y], i) => (
          <g key={i} opacity={stars} transform={`rotate(${(1 - stars) * 45} ${x} ${y})`}>
            <path d={octagramPath(x, y, 15)} strokeWidth={2} fill={COLORS.navyDeep} />
            <circle cx={x} cy={y} r={4} fill={COLORS.gold} stroke="none" />
          </g>
        ))}
        {[pad, FH + pad].map((y, i) => (
          <g key={i} opacity={stars}>
            <path
              d={`M ${pad + FW / 2} ${y - 13} L ${pad + FW / 2 + 13} ${y} L ${pad + FW / 2} ${y + 13} L ${pad + FW / 2 - 13} ${y} Z`}
              strokeWidth={2}
              fill={COLORS.navyDeep}
            />
          </g>
        ))}
      </g>
    </svg>
  );
};

export const S1Title: React.FC = () => {
  const total = sceneFrames("title");
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        <OrnateFrame />
        <div
          style={{
            position: "absolute",
            left: SAFE_CENTER_X - FW / 2,
            top: SAFE_CENTER_Y - FH / 2,
            width: FW,
            height: FH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RevealText
            text={TITLE}
            mode="line"
            fontSize={100}
            width={FW - 80}
            maxHeight={FH - 60}
            fontFamily={AMIRI}
            fontWeight={700}
            color={COLORS.gold}
            revealFrames={26}
            style={{ textShadow: "0 0 30px rgba(201,164,92,0.25)" }}
          />
        </div>
      </AbsoluteFill>
    </ExitFade>
  );
};
