import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { AMIRI, fontsReady } from "../fonts";
import { COLORS, LINE_HEIGHT, MIN_FONT, reveal } from "../theme";
import { FRAMES_PER_WORD } from "../timings";

export type WordCtx = {
  frame: number;
  /** لحظة ظهور الكلمة نفسها بحسب ترتيبها (للمزامنة) */
  wordAt: number;
  /** لحظة ظهور سطرها (أو الكلمة في وضع كلمةً كلمة) */
  appear: number;
  line: number;
};

type Props = {
  text: string;
  /** line: سطرًا سطرًا (الأسطر تُقاس فعليًّا بعد تحميل الخط) — word: كلمةً كلمة */
  mode: "line" | "word";
  start?: number;
  fontSize: number;
  width: number;
  /** إن فاض النص عن هذا الارتفاع صغُر الخط (حتى MIN_FONT) */
  maxHeight?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number;
  revealFrames?: number;
  style?: CSSProperties;
  wordStyle?: (i: number, ctx: WordCtx) => CSSProperties | undefined;
  /** نمط على نصّ الكلمة وحده (لا يشمل الزخارف المرفقة بها) */
  innerStyle?: (i: number, ctx: WordCtx) => CSSProperties | undefined;
  wordDecor?: (i: number, ctx: WordCtx) => ReactNode;
};

/**
 * لا تُقسَّم الكلمة أبدًا: كل كلمة (بعلامة ترقيمها الملتصقة) في span واحد.
 * المسافات نصّ حقيقي بين الـ spans فيبقى التفاف الأسطر طبيعيًّا.
 */
export const RevealText: React.FC<Props> = ({
  text,
  mode,
  start = 0,
  fontSize,
  width,
  maxHeight,
  color = COLORS.ivory,
  fontFamily = AMIRI,
  fontWeight = 400,
  revealFrames,
  style,
  wordStyle,
  innerStyle,
  wordDecor,
}) => {
  const frame = useCurrentFrame();
  const boxRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(fontSize);
  const [lineOf, setLineOf] = useState<number[] | null>(null);
  const [handle] = useState(() => delayRender(`measure: ${text.slice(0, 24)}`));
  const done = useRef(false);

  const rows = text.split("\n").map((l) => l.trim().split(/\s+/).filter(Boolean));

  useLayoutEffect(() => {
    let cancelled = false;
    fontsReady.then(() => {
      if (cancelled || !boxRef.current) return;
      const box = boxRef.current;
      if (maxHeight && box.offsetHeight > maxHeight && fs > MIN_FONT) {
        setFs((f) => Math.max(MIN_FONT, f - 2));
        return;
      }
      const spans = Array.from(box.querySelectorAll<HTMLSpanElement>("[data-w]"));
      const tops: number[] = [];
      const lines = spans.map((s) => {
        const top = s.offsetTop;
        let li = tops.findIndex((t) => Math.abs(t - top) < fs * 0.6);
        if (li < 0) li = tops.push(top) - 1;
        return li;
      });
      setLineOf(lines);
      if (!done.current) {
        done.current = true;
        continueRender(handle);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fs, text, maxHeight, handle]);

  useEffect(
    () => () => {
      if (!done.current) continueRender(handle);
    },
    [handle],
  );

  const fpw = FRAMES_PER_WORD;
  const dur = revealFrames ?? (mode === "word" ? Math.max(10, Math.round(fpw)) : 22);
  const firstOfLine = (li: number) => (lineOf ? lineOf.indexOf(li) : 0);

  let idx = 0;
  return (
    <div
      ref={boxRef}
      style={{
        position: "relative",
        width,
        direction: "rtl",
        textAlign: "center",
        fontFamily,
        fontWeight,
        fontSize: fs,
        lineHeight: LINE_HEIGHT,
        color,
        // لا كلمة يتيمة في السطر الأخير
        textWrap: "pretty",
        ...style,
      }}
    >
      {rows.map((row, r) => (
        <React.Fragment key={r}>
          {row.map((w, k) => {
            const i = idx++;
            const line = lineOf ? lineOf[i] : 0;
            const wordAt = start + Math.round(i * fpw);
            const appear =
              mode === "word" ? wordAt : start + Math.round(firstOfLine(line) * fpw);
            const ctx: WordCtx = { frame, wordAt, appear, line };
            const base = lineOf ? reveal(frame, appear, dur) : { opacity: 0 };
            const extra = wordStyle?.(i, ctx) ?? {};
            const filter = [base.filter, extra.filter].filter(Boolean).join(" ");
            const opacity = (base.opacity as number) * ((extra.opacity as number) ?? 1);
            return (
              <React.Fragment key={k}>
                <span
                  data-w={i}
                  style={{
                    display: "inline-block",
                    position: "relative",
                    ...base,
                    ...extra,
                    transform: [base.transform, extra.transform].filter(Boolean).join(" "),
                    filter: filter || undefined,
                    opacity,
                  }}
                >
                  {innerStyle ? (
                    <span style={{ display: "inline-block", ...innerStyle(i, ctx) }}>{w}</span>
                  ) : (
                    w
                  )}
                  {wordDecor?.(i, ctx)}
                </span>
                {k < row.length - 1 ? " " : null}
              </React.Fragment>
            );
          })}
          {r < rows.length - 1 ? <br /> : null}
        </React.Fragment>
      ))}
    </div>
  );
};
