import React from "react";
import { AbsoluteFill } from "remotion";
import { H, SAFE, SAFE_BOX, W } from "../theme";

/** إطار المنطقة الآمنة — للقطات المراجعة فقط، لا يدخل التصدير */
export const SafeGuide: React.FC = () => {
  const shade = "rgba(220, 40, 60, 0.16)";
  const zones: React.CSSProperties[] = [
    { left: 0, top: 0, width: W, height: SAFE.top },
    { left: 0, bottom: 0, width: W, height: SAFE.bottom },
    { left: 0, top: SAFE.top, width: SAFE.left, height: H - SAFE.top - SAFE.bottom },
    { right: 0, top: SAFE.top, width: SAFE.right, height: H - SAFE.top - SAFE.bottom },
  ];
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {zones.map((z, i) => (
        <div key={i} style={{ position: "absolute", background: shade, ...z }} />
      ))}
      <div
        style={{
          position: "absolute",
          left: SAFE_BOX.x,
          top: SAFE_BOX.y,
          width: SAFE_BOX.w,
          height: SAFE_BOX.h,
          border: "3px dashed rgba(200, 30, 50, 0.85)",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE_BOX.x + 8,
          top: SAFE_BOX.y - 40,
          font: "600 24px monospace",
          color: "rgba(180,20,40,0.95)",
        }}
      >
        SAFE AREA 850×1290 (top 250 / bottom 380 / right 150 / left 80)
      </div>
    </AbsoluteFill>
  );
};
