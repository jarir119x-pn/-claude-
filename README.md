# طريقة ابن المقفع في محاسبة النفس — Remotion

1080×1920، ‏30fps، بلا صوت. الهوية: Light Academia — دفتر محاسبة على مكتب كتّاني في ضوء نافذة صباحية؛
كل مشهد صفحة، والانتقال تقليب صفحة.

## المدة (`src/timings.ts`)
- مدة كتابة الصفحة وتثبيتها = (عدد كلماتها × `SECONDS_PER_WORD`) + `HOLD_SECONDS`.
- لمزامنة إلقاء صوتي عدّل `SECONDS_PER_WORD` وحده؛ كل ظهور ومؤثر مربوط بترتيب كلمته.
- ثوابت إضافية صريحة: `PILLAR_UNDERLINE_SECONDS` (0.7 لكل ركن)، `PAGE_TURN_SECONDS` (0.6)،
  `BOOK_CLOSE_SECONDS` (2.5)، `OUTRO_FADE_SECONDS` (1.5).

```bash
npm install
npm run studio        # معاينة
npm run stills        # لقطات مراجعة مع إطار المنطقة الآمنة → out/stills (انظر رأس scripts/stills.mjs)
npm run render        # H.264، crf 18، yuv420p → out/muhasaba.mp4 (بلا إطار المنطقة الآمنة)
```

- النصوص في `src/content.ts`، وكسر الأسطر يدوي بـ `\n` عند الوقفات المعنوية.
- كل صفحة مكوّن في `src/scenes/` داخل `<TransitionSeries>` في `src/Root.tsx`.
- خلف وكيل شبكة يمكن تمرير متصفح مخصّص: `REMOTION_BROWSER=/path/to/chrome npm run stills`.
