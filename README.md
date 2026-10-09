# الترجمة في الوطن العربي — حين تتكلم الأرقام

فيديو موشن غرافيك (1920×1080، 30 إطارًا/ث، نحو 100 ثانية) مبني بـ [Remotion](https://www.remotion.dev).

## المشاهد

| # | المشهد | الملف |
|---|--------|-------|
| 1 | مسح «بيت الحكمة» من الذاكرة | `src/scenes/Intro.tsx` |
| 2 | العنوان | `src/scenes/Title.tsx` |
| 3 | 4.4 كتاب لكل مليون نسمة | `src/scenes/Stats.tsx` |
| 4 | تقرير 2002: 330 كتابًا (شبكة كتب) | `src/scenes/Stats.tsx` |
| 5 | France 24: ~3000 كتاب سنويًا (تقدير) | `src/scenes/Stats.tsx` |
| 6 | ملاحظة: ولا إحصائية دقيقة واحدة | `src/scenes/Stats.tsx` |
| 7 | باب المقارنة | `src/scenes/Compare.tsx` |
| 8 | الثمانينات: العرب × المجر × إسبانيا | `src/scenes/Compare.tsx` |
| 9 | العرب × فرنسا | `src/scenes/Compare.tsx` |
| 10 | العرب × البرازيل | `src/scenes/Compare.tsx` |
| 11 | العرب × إسرائيل | `src/scenes/Compare.tsx` |
| 12 | الحصيلة والخاتمة | `src/scenes/Outro.tsx` |

الخطوط: Reem Kufi للعناوين، Amiri للنص الأدبي، Cairo للأرقام (من حزم `@fontsource`، فلا يحتاج التصيير إلى الإنترنت).
الموسيقى الخلفية `public/ambient.m4a` نغمة هادئة مولّدة بـ ffmpeg؛ استبدلها بأي ملف بالاسم نفسه.

## التشغيل

```bash
npm install
npm run dev      # معاينة وتعديل في Remotion Studio
npm run render   # تصدير out/translation-stats.mp4
```

مدد المشاهد معرّفة كثوابت في أعلى كل ملف مشهد، وترتيبها في `src/Video.tsx`.
