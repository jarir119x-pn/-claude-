import React from "react";
import { NotebookPage } from "../components/NotebookPage";
import { HEADINGS, KHUSUMA, words } from "../content";
import { C } from "../theme";
import { wordFrame } from "../timings";

const N = words(KHUSUMA).length;
/** «معاذيرَها وعِلَلَها وشُبُهاتِها» = آخر ثلاث كلمات: يُشطب عليها بخط حبر ثم تبهت */
const TARGETS = [N - 3, N - 2, N - 1];

export const S4Khusuma: React.FC = () => (
  <NotebookPage
    id="khusuma"
    heading={HEADINGS.khusuma}
    pageNo={5}
    maxFs={66}
    blocks={[{ kind: "text", text: KHUSUMA, mode: "line" }]}
    marks={(i) => {
      const k = TARGETS.indexOf(i);
      if (k < 0) return undefined;
      return {
        color: C.ink,
        tintAt: null,
        underlineAt: null,
        strikeAt: wordFrame(N) + 2 + k * 10,
        fadeTo: 0.35,
      };
    }}
  />
);
