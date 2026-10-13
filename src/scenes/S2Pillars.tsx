import React from "react";
import { NotebookPage } from "../components/NotebookPage";
import { PILLARS, PILLAR_WORDS, words } from "../content";
import { PILLAR_UNDERLINE_FRAMES, wordFrame } from "../timings";

const N = words(PILLARS).length;

/** بعد اكتمال الفقرة يُرسم خط يدوي تحت كل ركن، واحدًا بعد الآخر (0.7 ث لكل ركن) */
export const S2Pillars: React.FC = () => (
  <NotebookPage
    id="pillars"
    pageNo={1}
    maxFs={72}
    blocks={[{ kind: "text", text: PILLARS, mode: "line" }]}
    marks={(i) => {
      const k = PILLAR_WORDS.findIndex((ws) => ws.includes(i));
      if (k < 0) return undefined;
      const at = wordFrame(N) + k * PILLAR_UNDERLINE_FRAMES;
      return { tintAt: at, underlineAt: at };
    }}
  />
);
