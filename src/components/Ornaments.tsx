import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KUFI } from "../fonts";
import { octagramPath } from "./Background";
import { COLORS, H, LINE_HEIGHT, SAFE, SAFE_BOX, W, progress, reveal } from "../theme";
import { EXIT_FRAMES } from "../timings";

/** فاصل زخرفي: خطّان يمتدّان من نجمة ثمانية في الوسط */
export const Divider: React.FC<{ p: number; width?: number; color?: string }> = ({
  p,
  width = 360,
  color = COLORS.gold,
}) => {
  const c = width / 2;
  const half = (c - 22) * p;
  return (
    <svg width={width} height={28} style={{ display: "block", margin: "0 auto", overflow: "visible" }}>
      <g stroke={color} strokeWidth={2} fill="none" strokeLinecap="round">
        <line x1={c - 20} y1={14} x2={c - 20 - half} y2={14} opacity={0.8} />
        <line x1={c + 20} y1={14} x2={c + 20 + half} y2={14} opacity={0.8} />
        <path
          d={octagramPath(c, 14, 11)}
          transform={`rotate(${(1 - p) * -45} ${c} 14)`}
          opacity={p}
        />
      </g>
      <circle cx={c - 22 - half} cy={14} r={2.5} fill={color} opacity={p} />
      <circle cx={c + 22 + half} cy={14} r={2.5} fill={color} opacity={p} />
    </svg>
  );
};

/** عنوان الركن بالكوفي الذهبي، ثابت أعلى المنطقة الآمنة */
export const PillarHeading: React.FC<{ text: string; start?: number }> = ({
  text,
  start = 0,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: SAFE.top + 12,
        left: SAFE_BOX.x,
        width: SAFE_BOX.w,
        direction: "rtl",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: KUFI,
          fontWeight: 700,
          fontSize: 56,
          lineHeight: LINE_HEIGHT,
          color: COLORS.gold,
          ...reveal(frame, start, 24),
        }}
      >
        {text}
      </div>
      <div style={{ marginTop: -6 }}>
        <Divider p={progress(frame, start + 8, 36)} />
      </div>
    </div>
  );
};

/** تلاشٍ عند الخروج في آخر الوحدة */
export const ExitFade: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, duration - EXIT_FRAMES, EXIT_FRAMES);
  return (
    <AbsoluteFill
      style={{
        opacity: 1 - p,
        filter: p > 0 ? `blur(${p * 6}px)` : undefined,
        transform: `translateY(${-p * 12}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** صندوق ضمن المنطقة الآمنة يضع المحتوى في وسطه عموديًّا */
export const SafeBlock: React.FC<{
  top?: number;
  bottom?: number;
  children: React.ReactNode;
}> = ({ top = SAFE_BOX.y, bottom = SAFE_BOX.y + SAFE_BOX.h, children }) => (
  <div
    style={{
      position: "absolute",
      left: SAFE_BOX.x,
      width: SAFE_BOX.w,
      top,
      height: bottom - top,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    {children}
  </div>
);

/** إطار المنطقة الآمنة (للقطات المراجعة فقط) */
export const SafeAreaGuide: React.FC = () => {
  const shade = "rgba(220, 40, 60, 0.22)";
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: SAFE.top, background: shade }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, width: W, height: SAFE.bottom, background: shade }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: SAFE.top,
          width: SAFE.left,
          height: H - SAFE.top - SAFE.bottom,
          background: shade,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: SAFE.top,
          width: SAFE.right,
          height: H - SAFE.top - SAFE.bottom,
          background: shade,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE_BOX.x,
          top: SAFE_BOX.y,
          width: SAFE_BOX.w,
          height: SAFE_BOX.h,
          border: "3px dashed rgba(255, 90, 100, 0.9)",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE_BOX.x + 8,
          top: SAFE_BOX.y - 40,
          font: "600 24px monospace",
          color: "rgba(255,140,150,0.95)",
        }}
      >
        SAFE AREA 850×1290 (top 250 / bottom 380 / right 150 / left 80)
      </div>
    </AbsoluteFill>
  );
};

export const FadeToBlack: React.FC<{ from: number; duration: number }> = ({
  from,
  duration,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: "#000", opacity: o }} />;
};
