# طريقة ابن المقفع في محاسبة النفس — Remotion

1080×1920، ‏30fps، بلا صوت. المدة تُحسب في `src/timings.ts`:
مدة كل مشهد = (عدد كلماته × `SECONDS_PER_WORD`) + `HOLD_SECONDS`، والمجموع الحالي 3525 إطارًا (117.5 ث).
لمزامنة إلقاء صوتي عدّل `SECONDS_PER_WORD` وحده.

```bash
npm install
npm run studio        # معاينة
npm run stills        # لقطات من منتصف كل مشهد مع إطار المنطقة الآمنة → out/stills
npm run render        # H.264، crf 18، yuv420p → out/muhasaba.mp4
```

- النصوص في `src/content.ts`، وكل مشهد مكوّن مستقل في `src/scenes/` داخل `<Series>` في `src/Root.tsx`.
- خلف وكيل شبكة يمكن تمرير متصفح مخصّص: `REMOTION_BROWSER=/path/to/chrome npm run stills`.
