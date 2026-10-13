import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { RevealText } from "../components/RevealText";
import { ExitFade, SafeBlock } from "../components/Ornaments";
import { MAHW, indexOfWord } from "../content";
import { COLORS, SAFE_BOX, SAFE_CENTER_Y, fitFontSize, mix, progress } from "../theme";
import { sceneFrames, wordFrame } from "../timings";

const MAHAHU = indexOfWord(MAHW, "مَحاه");
const ISTABSHARA = indexOfWord(MAHW, "استبشرَ");
const IKTAABA = indexOfWord(MAHW, "اكتأبَ");

// قائمة مجرّدة من خمسة أسطر: يُشطب أربعة ويبقى الرابع
const ROWS = [560, 470, 600, 430, 520];
const STRIKES: Record<number, number> = {
  0: wordFrame(MAHAHU),
  2: wordFrame(MAHAHU) + 10,
  4: wordFrame(ISTABSHARA),
  1: wordFrame(ISTABSHARA) + 10,
};
const SURVIVOR = 3;
const ROW_GAP = 104;
const STRIKE = 12;
const VANISH = 20;

const LIST_TOP = SAFE_BOX.y;
const LIST_BOTTOM = SAFE_CENTER_Y;
const RIGHT = SAFE_BOX.x + SAFE_BOX.w - 70; // بداية السطر من اليمين

/** يقسم السطر إلى مقاطع كالكلمات (حتمي البذرة) */
const segments = (row: number, len: number): [number, number][] => {
  const out: [number, number][] = [];
  let x = 0;
  let j = 0;
  while (x < len - 30) {
    const w = 40 + random(`ledger-${row}-${j++}`) * 90;
    out.push([x, Math.min(len, x + w)]);
    x += w + 18;
  }
  return out;
};

const Ledger: React.FC = () => {
  const frame = useCurrentFrame();
  const firstY =
    (LIST_TOP + LIST_BOTTOM) / 2 - ((ROWS.length - 1) * ROW_GAP) / 2;
  const sad = progress(frame, wordFrame(IKTAABA), 22);
  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      {ROWS.map((len, i) => {
        const y = firstY + i * ROW_GAP;
        const inP = progress(frame, 4 + i * 6, 22);
        const strikeAt = STRIKES[i];
        const sP = strikeAt === undefined ? 0 : progress(frame, strikeAt, STRIKE);
        const vP =
          strikeAt === undefined ? 0 : progress(frame, strikeAt + STRIKE + 2, VANISH);
        const isSurvivor = i === SURVIVOR;
        const color = isSurvivor ? mix(COLORS.gold, COLORS.cold, sad) : COLORS.gold;
        const x0 = RIGHT;
        return (
          <g
            key={i}
            opacity={inP * (1 - vP)}
            style={{
              transform: `translate(${-vP * 24}px, ${(1 - inP) * 20}px)`,
              filter: vP > 0 ? `blur(${vP * 6}px)` : inP < 1 ? `blur(${(1 - inP) * 8}px)` : undefined,
            }}
          >
            <path
              d={`M ${x0 + 22} ${y - 11} L ${x0 + 33} ${y} L ${x0 + 22} ${y + 11} L ${x0 + 11} ${y} Z`}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
            />
            {/* «كلمات» السطر: مقاطع ذهبية بلا نص */}
            {segments(i, len).map(([a, b], j) => {
              const shown = (len + 34) * inP;
              if (a > shown) return null;
              return (
                <line
                  key={j}
                  x1={x0 - 6 - a}
                  y1={y}
                  x2={x0 - 6 - Math.min(b, shown)}
                  y2={y}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={isSurvivor ? 1 - 0.25 * sad : 0.85}
                />
              );
            })}
            {/* الشطب: خطّ مائل قليلًا يعبر السطر من اليمين إلى اليسار */}
            {sP > 0 ? (
              <line
                x1={x0 + 46}
                y1={y + 13}
                x2={x0 + 46 - (len + 110) * sP}
                y2={y + 13 - 26 * sP}
                stroke={COLORS.ivory}
                strokeWidth={3.5}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(242,235,221,0.5))" }}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const S8Mahw: React.FC = () => {
  const total = sceneFrames("mahw");
  const width = SAFE_BOX.w - 40;
  const top = SAFE_CENTER_Y + 10;
  const boxH = SAFE_BOX.y + SAFE_BOX.h - top;
  return (
    <ExitFade duration={total}>
      <AbsoluteFill>
        <Ledger />
        <SafeBlock top={top}>
          <RevealText
            text={MAHW}
            mode="line"
            fontSize={fitFontSize(MAHW, width, boxH, { max: 70 })}
            width={width}
            maxHeight={boxH - 10}
            style={{ textWrap: "balance" }}
            wordStyle={(i, { frame, wordAt }) => {
              if (i === MAHAHU || i === ISTABSHARA) {
                const g = progress(frame, wordAt, 14);
                return {
                  color: mix(COLORS.ivory, COLORS.gold, g),
                  fontWeight: 700,
                  textShadow:
                    i === ISTABSHARA
                      ? `0 0 ${24 * g}px rgba(201,164,92,${0.45 * g})`
                      : undefined,
                };
              }
              if (i === IKTAABA) {
                const c = progress(frame, wordAt, 22);
                return { color: mix(COLORS.ivory, COLORS.cold, c), fontWeight: 700 };
              }
              return undefined;
            }}
          />
        </SafeBlock>
      </AbsoluteFill>
    </ExitFade>
  );
};
