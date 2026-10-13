import React from "react";
import { useCurrentFrame } from "remotion";
import { NotebookPage, PageGeometry, PlacedBlock } from "../components/NotebookPage";
import { HEADINGS, QADAA, words } from "../content";
import { C, EASE_IN_OUT, PAPER, TEXT_LEFT, TEXT_W, progress } from "../theme";
import { wordFrame } from "../timings";

const nIntro = words(QADAA.intro).length;
const nBad = words(QADAA.bad).length;
const BAD_START = nIntro;
const GOOD_START = nIntro + nBad;
const BAD_STRONG = [BAD_START + 1, BAD_START + 3, BAD_START + 4, BAD_START + 5]; // السيئة + أوصافها
const GOOD_RUST = [GOOD_START, GOOD_START + 2, GOOD_START + 3, GOOD_START + 4]; // الحسنة + أوصافها

/** ميزان بخط حبر رفيع يميل نحو الحسنة عند ظهورها */
const Scale: React.FC<{ b: PlacedBlock }> = ({ b }) => {
  const frame = useCurrentFrame();
  const draw = progress(frame, 0, 34, EASE_IN_OUT);
  const tilt = 8 * progress(frame, wordFrame(GOOD_START), 34, EASE_IN_OUT);
  const cx = TEXT_LEFT + TEXT_W / 2;
  const py = b.top + 26;
  const L = 170;
  const t = (tilt * Math.PI) / 180;
  // اليمين = السيئة، اليسار = الحسنة (تنزل)
  const right = { x: cx + L * Math.cos(t), y: py - L * Math.sin(t) };
  const left = { x: cx - L * Math.cos(t), y: py + L * Math.sin(t) };
  const drop = Math.min(96, b.height * 0.42);
  const pan = (e: { x: number; y: number }, fill: string) => (
    <g>
      <path d={`M ${e.x} ${e.y} L ${e.x - 52} ${e.y + drop} M ${e.x} ${e.y} L ${e.x + 52} ${e.y + drop}`} />
      <path
        d={`M ${e.x - 62} ${e.y + drop} Q ${e.x} ${e.y + drop + 34} ${e.x + 62} ${e.y + drop} Z`}
        fill={fill}
      />
    </g>
  );
  const baseY = b.top + b.height - 10;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <g
        fill="none"
        stroke={C.ink}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
        style={{
          clipPath: `inset(0 0 ${(1 - draw) * 100}% 0)`,
        }}
      >
        <path d={`M ${cx} ${py - 14} L ${cx} ${baseY} M ${cx - 46} ${baseY} L ${cx + 46} ${baseY}`} />
        <circle cx={cx} cy={py - 20} r={6} />
        <path d={`M ${left.x} ${left.y} L ${right.x} ${right.y}`} />
        {pan(right, "rgba(157,165,156,0.35)")}
        {pan(left, "rgba(201,143,107,0.35)")}
      </g>
    </svg>
  );
};

/** ظلّ مريمية باهت خلف السيئة، وظل تيراكوتا خفيف خلف الحسنة */
const Bands: React.FC<{ g: PageGeometry }> = ({ g }) => {
  const frame = useCurrentFrame();
  const textBlocks = g.blocks.filter((b) => b.kind === "text");
  const bad = textBlocks[1];
  const good = textBlocks[2];
  const band = (b: PlacedBlock, rgb: string, at: number) => {
    const o = progress(frame, at, 30);
    const pad = g.P * 0.35;
    return (
      <div
        style={{
          position: "absolute",
          left: PAPER.x + 8,
          width: PAPER.w - 16,
          top: b.top - pad,
          height: b.height + pad * 2,
          opacity: o,
          background: `linear-gradient(180deg, rgba(${rgb},0) 0%, rgba(${rgb},0.2) 22%, rgba(${rgb},0.2) 78%, rgba(${rgb},0) 100%)`,
        }}
      />
    );
  };
  return (
    <>
      {band(bad, "157,165,156", wordFrame(BAD_START) - 6)}
      {band(good, "201,143,107", wordFrame(GOOD_START) - 6)}
    </>
  );
};

export const S5Qadaa: React.FC = () => (
  <NotebookPage
    id="qadaa"
    heading={HEADINGS.qadaa}
    pageNo={6}
    maxFs={62}
    blocks={[
      { kind: "figure", rows: 2, key: "scale" },
      { kind: "text", text: QADAA.intro, mode: "line" },
      { kind: "gap", rows: 1 },
      { kind: "text", text: QADAA.bad, mode: "word", color: C.inkLight },
      { kind: "gap", rows: 1 },
      { kind: "text", text: QADAA.good, mode: "word" },
    ]}
    marks={(i) => {
      if (BAD_STRONG.includes(i)) return { tintAt: null, underlineAt: null };
      if (GOOD_RUST.includes(i)) return {};
      return undefined;
    }}
    underlay={(g) => <Bands g={g} />}
    figure={(_, b) => <Scale b={b} />}
  />
);
