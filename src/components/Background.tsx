import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { COLORS, H, W } from "../theme";

/** نجمة ثمانية من مربعين متراكبين */
export const octagramPath = (cx: number, cy: number, r: number) => {
  const pts = (offset: number) =>
    [0, 1, 2, 3]
      .map((k) => {
        const a = offset + (k * Math.PI) / 2;
        return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
      })
      .join(" L ");
  return `M ${pts(0)} Z M ${pts(Math.PI / 4)} Z`;
};

const TILE = 200;

/** زخرفة هندسية: نجوم ثمانية متصلة بشبكة، بخط ذهبي 2.4px */
const GeometricPattern: React.FC<{ t: number }> = ({ t }) => {
  const c = TILE / 2;
  const R = 64;
  const d = R / Math.SQRT2;
  const pw = W * 1.7;
  const ph = H * 1.7;
  return (
    <AbsoluteFill
      style={{
        opacity: 0.14,
        // أخفّ قليلًا في الوسط حيث النص (≈10%) وأوضح عند الأطراف (14%)
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 55% at 50% 47%, rgba(0,0,0,0.72) 0%, #000 100%)",
      }}
    >
      <svg
        width={pw}
        height={ph}
        style={{
          position: "absolute",
          left: (W - pw) / 2,
          top: (H - ph) / 2,
          transform: `rotate(${t * 4}deg) translate(${t * 60}px, ${-t * 90}px)`,
        }}
      >
        <defs>
          <pattern id="girih" width={TILE} height={TILE} patternUnits="userSpaceOnUse">
            <g fill="none" stroke={COLORS.gold} strokeWidth={2.4} strokeLinejoin="round">
              <path d={octagramPath(c, c, R)} />
              <circle cx={c} cy={c} r={24} />
              <path d={octagramPath(c, c, 13)} />
              {/* وصلات المحاور إلى منتصف الحواف */}
              <path
                d={`M ${c + R} ${c} L ${TILE} ${c} M ${c - R} ${c} L 0 ${c} M ${c} ${c + R} L ${c} ${TILE} M ${c} ${c - R} L ${c} 0`}
              />
              {/* وصلات الأقطار إلى الزوايا */}
              <path
                d={`M ${c + d} ${c + d} L ${TILE} ${TILE} M ${c - d} ${c - d} L 0 0 M ${c + d} ${c - d} L ${TILE} 0 M ${c - d} ${c + d} L 0 ${TILE}`}
              />
              {/* معيّنات عند الزوايا ومنتصفات الحواف */}
              {[
                [0, 0],
                [TILE, 0],
                [0, TILE],
                [TILE, TILE],
              ].map(([x, y], i) => (
                <path key={i} d={`M ${x} ${y - 22} L ${x + 22} ${y} L ${x} ${y + 22} L ${x - 22} ${y} Z`} />
              ))}
              {[
                [c, 0],
                [c, TILE],
                [0, c],
                [TILE, c],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={9} />
              ))}
            </g>
          </pattern>
        </defs>
        <rect width={pw} height={ph} fill="url(#girih)" />
      </svg>
    </AbsoluteFill>
  );
};

/** الخلفية الثابتة عبر المقطع كله، بتكبير بطيء 1.0 → 1.06 */
export const Background: React.FC<{ total: number }> = ({ total }) => {
  const frame = useCurrentFrame();
  const t = frame / total;
  const zoom = interpolate(frame, [0, total], [1, 1.06]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(172deg, ${COLORS.navy} 0%, #151E32 48%, ${COLORS.navyDeep} 100%)`,
          }}
        />
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 80% 45% at 50% 40%, rgba(201,164,92,0.06) 0%, rgba(201,164,92,0) 70%)",
          }}
        />
        <GeometricPattern t={t} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 95% 75% at 50% 46%, rgba(0,0,0,0) 55%, rgba(4,7,14,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** grain ثابت البذرة: بلاطة ضوضاء حتمية تمنع التخطيط اللوني بعد الضغط */
const GRAIN_SEED = "muhasaba-grain";
const GRAIN_TILE = 256;

const useGrainUrl = () =>
  useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = GRAIN_TILE;
    canvas.height = GRAIN_TILE;
    const ctx = canvas.getContext("2d")!;
    const img = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
    for (let i = 0; i < GRAIN_TILE * GRAIN_TILE; i++) {
      const v = Math.floor(random(`${GRAIN_SEED}-${i}`) * 256);
      img.data[i * 4] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    return canvas.toDataURL("image/png");
  }, []);

export const Grain: React.FC = () => {
  const url = useGrainUrl();
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize: `${GRAIN_TILE}px ${GRAIN_TILE}px`,
        mixBlendMode: "overlay",
        opacity: 0.09,
        pointerEvents: "none",
      }}
    />
  );
};
