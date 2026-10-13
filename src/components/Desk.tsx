import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { C, PAPER } from "../theme";
import { deckledPath, grainTexture, leatherTexture, linenTexture } from "./textures";

/** المكتب: كتّان بملمس نسيج خفيف، بتكبير بطيء جدًّا */
export const Linen: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, total], [1, 1.06]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.linen, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          backgroundImage: `url(${linenTexture()})`,
          backgroundSize: "256px 256px",
          mixBlendMode: "overlay",
          opacity: 0.32,
        }}
      />
    </AbsoluteFill>
  );
};

export const LEATHER = "#8C5230";

/** سطح جلدي (للغلاف الخلفي والأمامي) */
export const Leather: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      borderRadius: 14,
      backgroundColor: LEATHER,
      backgroundImage: `url(${leatherTexture()})`,
      backgroundSize: "256px 256px",
      backgroundBlendMode: "multiply",
      ...style,
    }}
  >
    {children}
  </div>
);

/** الدفتر تحت الصفحة: الغلاف الخلفي وطبقتا ورق، وشريط الإشارة */
export const BookStack: React.FC = () => {
  const frame = useCurrentFrame();
  const sheets = [
    { dx: -9, dy: 11, color: "#EFE7D9", seed: "s2" },
    { dx: -4.5, dy: 5.5, color: "#F5EFE3", seed: "s1" },
  ];
  const sway = Math.sin(frame / 70) * 1.2;
  return (
    <AbsoluteFill>
      <Leather
        style={{
          left: PAPER.x - 18,
          top: PAPER.y - 6,
          width: PAPER.w + 26,
          height: PAPER.h + 30,
          boxShadow: "0 30px 50px rgba(74,53,40,0.22), 0 4px 8px rgba(74,53,40,0.18)",
        }}
      />
      {sheets.map((s) => (
        <SheetEdge key={s.seed} dx={s.dx} dy={s.dy} color={s.color} seed={s.seed} />
      ))}
      {/* شريط الإشارة يتدلّى من أسفل الصفحة */}
      <div
        style={{
          position: "absolute",
          left: 690,
          top: PAPER.y + PAPER.h - 30,
          width: 36,
          height: 262,
          transformOrigin: "50% 0",
          transform: `rotate(${sway}deg)`,
          background: "linear-gradient(90deg, #6F3F24 0%, #8C5230 45%, #7A4528 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 88%, 0 100%)",
          filter: "drop-shadow(0 6px 6px rgba(74,53,40,0.25))",
        }}
      />
    </AbsoluteFill>
  );
};

const SheetEdge: React.FC<{ dx: number; dy: number; color: string; seed: string }> = ({
  dx,
  dy,
  color,
  seed,
}) => {
  const clip = useMemo(() => deckledPath(PAPER.w, PAPER.h, seed), [seed]);
  return (
    <div
      style={{
        position: "absolute",
        left: PAPER.x + dx,
        top: PAPER.y + dy,
        width: PAPER.w,
        height: PAPER.h,
        filter: "drop-shadow(0 2px 2px rgba(74,53,40,0.12))",
      }}
    >
      <div style={{ position: "absolute", inset: 0, clipPath: `path('${clip}')`, background: color }} />
    </div>
  );
};

/** ضوء نافذة صباحية: ظل إطارها (عمودان مائلان) يعبر ببطء، وذرّات غبار في الشعاع */
export const WindowLight: React.FC<{ total: number; warmth?: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const shift = interpolate(frame, [0, total], [-240, 240]);
  const BEAM = 900;
  const box = 3000;
  const inner: React.CSSProperties = {
    position: "absolute",
    left: (1080 - box) / 2 + shift,
    top: (1920 - box) / 2,
    width: box,
    height: box,
    transform: "rotate(-22deg)",
  };
  const beamLeft = (box - BEAM) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* الظلال: خارج الشعاع أغمق قليلًا، وعمودا الإطار داخله */}
      <AbsoluteFill style={{ mixBlendMode: "multiply" }}>
        <div style={inner}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, rgba(120,92,66,0.13) 0, rgba(120,92,66,0.13) ${beamLeft - 120}px, rgba(120,92,66,0) ${beamLeft + 80}px, rgba(120,92,66,0) ${beamLeft + BEAM - 80}px, rgba(120,92,66,0.13) ${beamLeft + BEAM + 120}px)`,
            }}
          />
          {[0.36, 0.68].map((f) => (
            <div
              key={f}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: beamLeft + BEAM * f - 26,
                width: 52,
                background: "rgba(110,84,60,0.13)",
                filter: "blur(16px)",
              }}
            />
          ))}
        </div>
      </AbsoluteFill>
      {/* الضوء الدافئ وذرّات الغبار */}
      <AbsoluteFill style={{ mixBlendMode: "screen" }}>
        <div style={inner}>
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: beamLeft,
              width: BEAM,
              background: "rgba(255,236,206,0.10)",
              filter: "blur(40px)",
            }}
          />
          <Dust frame={frame} left={beamLeft} width={BEAM} height={box} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const DUST = 70;
const Dust: React.FC<{ frame: number; left: number; width: number; height: number }> = ({
  frame,
  left,
  width,
  height,
}) => (
  <>
    {Array.from({ length: DUST }).map((_, i) => {
      const s = `dust-${i}`;
      const x0 = left + random(`${s}-x`) * width;
      const y0 = height * 0.3 + random(`${s}-y`) * height * 0.4;
      const speed = 0.12 + random(`${s}-v`) * 0.25;
      const y = y0 - ((frame * speed) % 500);
      const x = x0 + Math.sin(frame / (40 + random(`${s}-p`) * 50) + i) * 18;
      const size = 2 + random(`${s}-s`) * 3;
      const tw = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 23 + i * 1.7));
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "#FFF3DF",
            opacity: tw,
            boxShadow: "0 0 6px rgba(255,240,215,0.8)",
          }}
        />
      );
    })}
  </>
);

/** vignette دافئة خفيفة جدًّا */
export const WarmVignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background:
        "radial-gradient(ellipse 85% 70% at 50% 48%, rgba(140,100,60,0) 62%, rgba(140,100,60,0.13) 100%)",
    }}
  />
);

export const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage: `url(${grainTexture()})`,
      backgroundSize: "256px 256px",
      mixBlendMode: "overlay",
      opacity: 0.06,
    }}
  />
);

export const FadeToLinen: React.FC<{ from: number; duration: number }> = ({ from, duration }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ backgroundColor: C.linen, opacity: o }} />;
};
