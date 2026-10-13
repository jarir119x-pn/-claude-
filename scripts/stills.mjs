// لقطات مراجعة من منتصف كل مشهد (ومنتصف كل بطاقة في مشهد المحاسبة) مع إطار المنطقة الآمنة
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { build } from "esbuild";

const outDir = path.resolve("out/stills");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { showSafeArea: process.env.NO_GUIDE ? false : true };
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({
  serveUrl,
  id: "Muhasaba",
  inputProps,
  browserExecutable,
});

// نقرأ التوقيتات من timings.ts نفسه
const built = await build({ entryPoints: ["src/timings.ts"], bundle: true, format: "esm", write: false });
const { SCENES, CARD_FRAMES } = await import(
  "data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64")
);

const shots = [];
let start = 0;
for (const s of SCENES) {
  if (s.id === "muhasaba") {
    let o = start;
    CARD_FRAMES.forEach((f, i) => {
      shots.push({ name: `muhasaba-${["a", "b", "c"][i]}`, frame: o + Math.floor(f / 2) });
      o += f;
    });
  } else {
    shots.push({ name: s.id, frame: start + Math.floor(s.frames / 2) });
  }
  start += s.frames;
}
const only = process.env.ONLY?.split(",");
const extra = process.env.FRAMES?.split(",").map((f) => ({ name: `f${f}`, frame: Number(f) })) ?? [];
const list = [...(only ? shots.filter((s) => only.includes(s.name)) : shots), ...extra];

let n = 0;
for (const { name, frame } of list) {
  const file = path.join(outDir, `${String(++n).padStart(2, "0")}-${name}-f${frame}.png`);
  await renderStill({ composition, serveUrl, frame, output: file, inputProps, browserExecutable });
  console.log(`${file}`);
}
console.log(`total ${composition.durationInFrames} frames = ${(composition.durationInFrames / 30).toFixed(1)}s`);
