import React, { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { MARKAZI } from "../fonts";
import { C, EASE_IN_OUT, LINEAR, TEXT_LEFT, TEXT_W, mix, progress } from "../theme";
import { FRAMES_PER_WORD, wordFrame } from "../timings";

/** ❦ — مخطط الرمز من خط DejaVu Sans (رخصة حرّة) حتى يُرسم متطابقًا في كل بيئة */
const FLEURON_D =
  "M919 1127Q929 1175 929 1219Q929 1282 900 1323Q876 1356 822 1356Q792 1356 770 1338Q751 1323 751 1296Q751 1238 794 1204Q868 1147 919 1127ZM979 1007Q958 933 912 854Q1006 921 1092 921Q1216 921 1275 840Q1320 778 1320 684Q1320 466 1011 348Q858 290 858 213Q858 114 963 114Q1079 114 1095 156Q1146 288 1200 288Q1263 288 1263 198Q1263 42 948 42Q744 42 558 195Q360 358 360 612Q360 969 621 969Q723 969 804 828Q881 979 897 1046Q796 1094 566 1264Q497 1315 423 1315Q340 1315 277 1237Q237 1186 237 1133Q237 1096 258.0 1077.0Q279 1058 279 1029Q279 1006 253 986Q217 958 197 958Q165 958 140 1003Q126 1028 126 1103Q126 1219 241 1311Q334 1386 452 1386Q556 1386 606 1349Q606 1349 681 1292Q681 1375 722 1406Q764 1438 842 1438Q918 1438 967 1376Q1018 1310 1018 1223Q1018 1145 1002 1084Q1062 1067 1148 1067Q1224 1067 1266 1100Q1311 1136 1311 1167Q1311 1230 1290 1248Q1248 1284 1248 1305Q1248 1361 1269 1389Q1300 1429 1356 1429Q1421 1429 1463 1359Q1483 1326 1483 1273Q1483 1150 1340 1056Q1245 993 1125 993Q1060 993 979 1007Z";

export const Fleuron: React.FC<{ size: number; color?: string; style?: CSSProperties }> = ({
  size,
  color = C.terracotta,
  style,
}) => (
  <svg
    width={(size * 1357) / 1396}
    height={size}
    viewBox="126 -1438 1357 1396"
    style={{ display: "block", ...style }}
  >
    <path d={FLEURON_D} transform="scale(1,-1)" fill={color} />
  </svg>
);

/** قناع يمسح من اليمين إلى اليسار (كأن القلم يكتب) بحافة ناعمة */
export const wipeMask = (p: number): CSSProperties => {
  if (p >= 1) return {};
  const F = 14;
  const b = p * (100 + F);
  const a = b - F;
  const g = `linear-gradient(to left, #000 ${a}%, transparent ${b}%)`;
  return { WebkitMaskImage: g, maskImage: g };
};

/** خط يدوي رفيع: تحت الكلمة أو شطبًا عليها، يُرسم من اليمين */
export const HandStroke: React.FC<{
  p: number;
  kind: "under" | "strike";
  top: number;
  color?: string;
  width?: number;
  extendLeft?: number;
  seed?: number;
}> = ({ p, kind, top, color = C.terracotta, width = 2.4, extendLeft = 0, seed = 0 }) => {
  if (p <= 0) return null;
  const wob = ((seed * 37) % 5) - 2;
  const d =
    kind === "under"
      ? `M 100 ${4 + wob * 0.3} C 72 ${6.5}, 38 ${2 + wob * 0.4}, 0 ${5.2}`
      : `M 100 ${7} C 70 ${4 + wob * 0.5}, 35 ${6.5}, 0 ${2.5}`;
  return (
    <svg
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        right: -4,
        left: -4 - extendLeft,
        top,
        height: 12,
        width: `calc(100% + ${8 + extendLeft}px)`,
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - p}
      />
    </svg>
  );
};

export type Mark = {
  weight?: number;
  /** لون الكلمة قبل التحوّل */
  color?: string;
  /** لحظة التحوّل إلى اللون tintTo (افتراضيًّا: بعد ظهور الكلمة). null = بلا تحوّل */
  tintAt?: number | null;
  tintTo?: string;
  /** لحظة رسم الخط اليدوي تحتها (افتراضيًّا مع التحوّل). null = بلا خط */
  underlineAt?: number | null;
  underlineColor?: string;
  /** شطب بخط حبر يدوي ثم بهتان */
  strikeAt?: number;
  fadeTo?: number;
};

export type InkLayout = {
  fs: number;
  P: number;
  baseOff: number;
};

type Props = InkLayout & {
  /** أسطر الكتلة، كل سطر مصفوفة كلمات */
  lines: string[][];
  /** أعلى كل سطر (مطلق) */
  rowTops: number[];
  /** فهرس أول كلمة في الكتلة ضمن خط زمن الصفحة */
  firstIndex: number;
  mode: "line" | "word";
  align?: "start" | "center";
  family?: string;
  color?: string;
  marks?: (i: number, wordAt: number) => Mark | undefined;
};

export const InkText: React.FC<Props> = ({
  lines,
  rowTops,
  firstIndex,
  mode,
  fs,
  P,
  baseOff,
  align = "start",
  family = MARKAZI,
  color = C.ink,
  marks,
}) => {
  const frame = useCurrentFrame();
  let idx = firstIndex;
  return (
    <>
      {lines.map((line, r) => {
        const first = idx;
        const lineStart = wordFrame(first);
        const lineDur = Math.max(10, wordFrame(line.length));
        const lineP = mode === "line" ? progress(frame, lineStart, lineDur, LINEAR) : 1;
        const lineVisible = mode === "line" ? progress(frame, lineStart, 6) : 1;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              top: rowTops[r],
              left: TEXT_LEFT,
              width: TEXT_W,
              height: P,
              direction: "rtl",
              textAlign: align === "center" ? "center" : "right",
              whiteSpace: "nowrap",
              fontFamily: family,
              // ccmp في Markazi يزيح الشدّة المركّبة مع حركتها عن حرفها؛ إطفاؤه يضعها في مكانها
              fontFeatureSettings: family === MARKAZI ? '"ccmp" 0' : undefined,
              fontSize: fs,
              lineHeight: `${P}px`,
              color,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "0 6px",
                opacity: lineVisible,
                ...wipeMask(lineP),
              }}
            >
              {line.map((w, k) => {
                const i = idx++;
                const wordAt = wordFrame(i);
                const m = marks?.(i, wordAt);
                const shownAt = wordAt + Math.round(FRAMES_PER_WORD);
                const wordP =
                  mode === "word"
                    ? progress(frame, wordAt, Math.max(8, Math.round(FRAMES_PER_WORD * 0.9)), LINEAR)
                    : 1;
                const wordVisible = mode === "word" ? progress(frame, wordAt, 5) : 1;
                const base = m?.color ?? color;
                const tintAt = m?.tintAt === undefined ? shownAt : m.tintAt;
                const tint =
                  m && tintAt !== null ? progress(frame, tintAt, 12, EASE_IN_OUT) : 0;
                const underAt =
                  m?.underlineAt === undefined ? tintAt : m.underlineAt;
                const underP =
                  m && underAt !== null && underAt !== undefined
                    ? progress(frame, underAt, 16, EASE_IN_OUT)
                    : 0;
                const strikeP =
                  m?.strikeAt !== undefined ? progress(frame, m.strikeAt, 12, EASE_IN_OUT) : 0;
                const fade =
                  m?.strikeAt !== undefined && m.fadeTo !== undefined
                    ? 1 - (1 - m.fadeTo) * progress(frame, m.strikeAt + 12, 20)
                    : 1;
                return (
                  <React.Fragment key={k}>
                    <span
                      style={{
                        display: "inline-block",
                        position: "relative",
                        fontWeight: m?.weight ?? (m ? 600 : 400),
                        color: m && tint > 0 ? mix(base, m.tintTo ?? C.rust, tint) : base,
                        opacity: wordVisible * fade,
                        ...wipeMask(wordP),
                      }}
                    >
                      {w}
                      <HandStroke
                        p={underP}
                        kind="under"
                        top={baseOff + fs * 0.12}
                        color={m?.underlineColor ?? C.terracotta}
                        seed={i}
                      />
                      <HandStroke
                        p={strikeP}
                        kind="strike"
                        top={baseOff - fs * 0.36}
                        color={C.ink}
                        width={3}
                        extendLeft={k < line.length - 1 ? fs * 0.28 : 0}
                        seed={i}
                      />
                    </span>
                    {k < line.length - 1 ? " " : null}
                  </React.Fragment>
                );
              })}
            </span>
          </div>
        );
      })}
    </>
  );
};
