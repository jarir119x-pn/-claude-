import React, { useMemo } from "react";
import { C, H, MARGIN_X, PAPER, W } from "../theme";
import { deckledPath, paperTexture } from "./textures";

/** ورقة الدفتر: حافة غير مستوية، حبيبات، سطور، هامش وردي، وظل ناعم */
export const Paper: React.FC<{
  rules?: number[];
  margin?: boolean;
  seed?: string;
  rect?: { x: number; y: number; w: number; h: number };
  color?: string;
  shadow?: boolean;
  children?: React.ReactNode;
}> = ({ rules = [], margin = true, seed = "page", rect = PAPER, color = C.paper, shadow = true, children }) => {
  const clip = useMemo(() => deckledPath(rect.w, rect.h, seed), [rect.w, rect.h, seed]);
  const grain = paperTexture();
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        filter: shadow
          ? "drop-shadow(0 22px 26px rgba(74,53,40,0.16)) drop-shadow(0 2px 3px rgba(74,53,40,0.14))"
          : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `path('${clip}')`,
          backgroundColor: color,
          backgroundImage: `url(${grain})`,
          backgroundSize: "256px 256px",
          backgroundBlendMode: "multiply",
        }}
      >
        <svg width={rect.w} height={rect.h} style={{ position: "absolute", left: 0, top: 0 }}>
          {rules.map((y, i) => (
            <line
              key={i}
              x1={0}
              x2={rect.w}
              y1={y - rect.y}
              y2={y - rect.y}
              stroke={C.rule}
              strokeWidth={2}
            />
          ))}
          {margin ? (
            <line
              x1={MARGIN_X - rect.x}
              x2={MARGIN_X - rect.x}
              y1={0}
              y2={rect.h}
              stroke={C.marginRose}
              strokeWidth={2}
            />
          ) : null}
        </svg>
        {/* ظل خفيف عند الكعب (اليمين) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            width: 70,
            background: "linear-gradient(to left, rgba(74,53,40,0.10), rgba(74,53,40,0))",
          }}
        />
        {children ? (
          <div style={{ position: "absolute", left: -rect.x, top: -rect.y, width: W, height: H }}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
};
