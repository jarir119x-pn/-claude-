import React from "react";
import { NotebookPage } from "../components/NotebookPage";
import { HEADINGS, IHSAA, indexOfWord } from "../content";

/** الدين، والأخلاق، والآداب */
const MARKED = ["الدِّينِ", "الأخلاقِ", "الآدابِ"].map((w) => indexOfWord(IHSAA, w));

export const S7Ihsaa: React.FC = () => (
  <NotebookPage
    id="ihsaa"
    heading={HEADINGS.ihsaa}
    pageNo={8}
    maxFs={64}
    blocks={[{ kind: "text", text: IHSAA, mode: "line" }]}
    marks={(i) => (MARKED.includes(i) ? {} : undefined)}
  />
);
