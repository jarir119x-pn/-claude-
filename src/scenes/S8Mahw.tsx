import React from "react";
import { random, useCurrentFrame } from "remotion";
import { NotebookPage, PageGeometry, PlacedBlock } from "../components/NotebookPage";
import { MAHW, indexOfWord } from "../content";
import { C, EASE_IN_OUT, LINEAR, MARGIN_X, TEXT_RIGHT, progress } from "../theme";
import { wordFrame } from "../timings";

const MAHAHU = indexOfWord(MAHW, "مَحاه");
const ISTABSHARA = indexOfWord(MAHW, "استبشرَ");
const IKTAABA = indexOfWord(MAHW, "اكتأبَ");

// قائمة من خمسة سطور حبر: يُشطب أربعة ويبقى الرابع
const LENGTHS = [600, 500, 640, 460, 560];
const STRIKES: Record<number, number> = {
  0: wordFrame(MAHAHU) + 4,
  2: wordFrame(MAHAHU) + 14,
  4: wordFrame(ISTABSHARA) + 4,
  1: wordFrame(ISTABSHARA) + 14,
};
const SURVIVOR = 3;

/** سطر «مكتوب» بخط يد غير مقروء: أسنان وحلقات وألفات ونزولات، من اليمين إلى اليسار */
const scribble = (row: number, x0: number, y: number, len: number, fs: number) => {
  const paths: string[] = [];
  const dots: [number, number][] = [];
  let x = x0;
  let w = 0;
  while (x0 - x < len - 40) {
    const seg = 60 + random(`sc-${row}-${w}-len`) * 120;
    const end = Math.max(x0 - len, x - seg);
    const pts: [number, number][] = [[x, y]];
    let k = 0;
    let xx = x;
    while (xx > end) {
      const r = random(`sc-${row}-${w}-${k}`);
      const step = 9 + random(`sc-${row}-${w}-${k}-s`) * 12;
      if (r > 0.86) {
        // ألف/لام: صعود رفيع ثم عودة
        pts.push([xx - 2, y - fs * (0.38 + 0.12 * r)], [xx - 4, y]);
      } else if (r < 0.18) {
        // سن صغيرة
        pts.push([xx - step / 2, y - fs * 0.09], [xx - step, y]);
      } else if (r < 0.3) {
        // حلقة (ه/م)
        pts.push([xx - step * 0.3, y - fs * 0.16], [xx - step * 0.8, y - fs * 0.1], [xx - step * 0.5, y + 2], [xx - step, y]);
        if (random(`sc-${row}-${w}-${k}-d`) > 0.6) dots.push([xx - step / 2, y - fs * 0.3]);
      } else {
        pts.push([xx - step, y - fs * 0.02 * (r - 0.5)]);
        if (random(`sc-${row}-${w}-${k}-d`) > 0.85) dots.push([xx - step / 2, y + fs * 0.16]);
      }
      xx -= step;
      k++;
    }
    // نزول في آخر الكلمة أحيانًا (ر/و)
    if (random(`sc-${row}-${w}-tail`) > 0.5) pts.push([xx - 8, y + fs * 0.2], [xx - 20, y + fs * 0.24]);
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2;
      const my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q ${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
    }
    const lastPt = pts[pts.length - 1];
    d += ` L ${lastPt[0].toFixed(1)} ${lastPt[1].toFixed(1)}`;
    paths.push(d);
    x = xx - 26 - random(`sc-${row}-${w}-gap`) * 12;
    w++;
  }
  return { d: paths.join(" "), dots };
};

const Ledger: React.FC<{ b: PlacedBlock; g: PageGeometry }> = ({ b, g }) => {
  const frame = useCurrentFrame();
  const sad = progress(frame, wordFrame(IKTAABA) + 6, 20);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {b.baselines.map((y, r) => {
        const x0 = TEXT_RIGHT - 8;
        const len = LENGTHS[r];
        const { d, dots } = scribble(r, x0, y, len, g.fs);
        const write = progress(frame, r * 7, 22, LINEAR);
        const s = STRIKES[r];
        const strike = s === undefined ? 0 : progress(frame, s, 12, EASE_IN_OUT);
        const dim = s === undefined ? 1 : 1 - 0.55 * progress(frame, s + 12, 20);
        const sy = y - g.fs * 0.2;
        return (
          <g key={r} opacity={dim}>
            <path
              d={d}
              fill="none"
              stroke={C.ink}
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.82}
              style={{ clipPath: `inset(0 0 0 ${(1 - write) * 100}%)` }}
            />
            {dots.map(([dx, dy], k) => (
              <circle key={k} cx={dx} cy={dy} r={2.6} fill={C.ink} opacity={write >= 1 ? 0.8 : 0} />
            ))}
            {strike > 0 ? (
              <path
                d={`M ${x0 + 14} ${sy + 5} C ${x0 - len * 0.3} ${sy - 4}, ${x0 - len * 0.7} ${sy + 6}, ${x0 - len - 14} ${sy - 6}`}
                fill="none"
                stroke={C.ink}
                strokeWidth={3.4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - strike}
              />
            ) : null}
            {r === SURVIVOR && sad > 0 ? (
              // علامة صغيرة في الهامش للسطر الثابت
              <path
                d={`M ${MARGIN_X + 26} ${y - g.fs * 0.45} Q ${MARGIN_X + 16} ${y - g.fs * 0.15} ${MARGIN_X + 26} ${y + 4}`}
                fill="none"
                stroke={C.rust}
                strokeWidth={3}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - sad}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
};

export const S8Mahw: React.FC = () => (
  <NotebookPage
    id="mahw"
    pageNo={9}
    maxFs={68}
    blocks={[
      { kind: "figure", rows: 5, key: "ledger" },
      { kind: "gap", rows: 1 },
      { kind: "text", text: MAHW, mode: "line" },
    ]}
    marks={(i) => {
      if (i === MAHAHU || i === ISTABSHARA) return {};
      if (i === IKTAABA) return { tintTo: C.warmGray, underlineAt: null };
      return undefined;
    }}
    figure={(_, b, g) => <Ledger b={b} g={g} />}
  />
);
