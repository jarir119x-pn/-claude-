// لقطات مراجعة مع إطار المنطقة الآمنة (NO_GUIDE=1 لإخفائه).
// SHOTS: قائمة مفصولة بفواصل، كل عنصر من:
//   <page>:full  آخر لحظة قبل تقليب الصفحة (النص كاملًا)
//   <page>:mid   منتصف كتابة الصفحة وتثبيتها
//   turn:<page>  أثناء تقليب الصفحة السابقة إلى <page>
//   cover        الغلاف بعد إغلاق الدفتر
//   f<N>         إطار بعينه
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { build } from "esbuild";
import path from "node:path";
import fs from "node:fs";

const outDir = path.resolve(process.env.OUT ?? "out/stills");
fs.mkdirSync(outDir, { recursive: true });

const built = await build({ entryPoints: ["src/timings.ts"], bundle: true, format: "esm", write: false });
const T = await import(
  "data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64")
);
const timeline = T.pageTimeline();
const byId = Object.fromEntries(timeline.map((p) => [p.id, p]));
const last = timeline[timeline.length - 1];
const lastWriting = last.content - T.BOOK_CLOSE_FRAMES - T.OUTRO_FADE_FRAMES;

const resolve = (shot) => {
  if (shot === "cover") return T.TOTAL_FRAMES - T.OUTRO_FADE_FRAMES - 2;
  if (shot.startsWith("f")) return Number(shot.slice(1));
  if (shot.startsWith("turn:")) return byId[shot.slice(5)].start + Math.floor(T.TURN_FRAMES * 0.35);
  const [id, kind] = shot.split(":");
  const p = byId[id];
  const writing = p.id === last.id ? lastWriting : p.content;
  return kind === "mid" ? p.contentStart + Math.floor(writing / 2) : p.contentStart + writing - 4;
};

const shots = (
  process.env.SHOTS ??
  "title:full,muhasaba-a:full,qadaa:full,mahw:full,khatima:full,cover"
).split(",");

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const inputProps = { showSafeArea: !process.env.NO_GUIDE };
const browserExecutable = process.env.REMOTION_BROWSER ?? null;
const composition = await selectComposition({ serveUrl, id: "Muhasaba", inputProps, browserExecutable });

let n = 0;
for (const shot of shots) {
  const frame = resolve(shot);
  const file = path.join(outDir, `${String(++n).padStart(2, "0")}-${shot.replace(/:/g, "-")}-f${frame}.png`);
  await renderStill({ composition, serveUrl, frame, output: file, inputProps, browserExecutable });
  console.log(file);
}
console.log(`total ${composition.durationInFrames} frames = ${(composition.durationInFrames / 30).toFixed(1)}s`);
