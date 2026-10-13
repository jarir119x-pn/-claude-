import {
  ATTRIBUTION,
  IHSAA,
  ITHABA,
  KHATIMA,
  KHUSUMA,
  MAHW,
  MUHASABA_CARDS,
  PILLARS,
  PILLAR_WORDS,
  QADAA,
  TITLE,
  words,
} from "./content";

export const FPS = 30;

/** ثوانٍ لكل كلمة — عدّله وحده عند المزامنة مع الإلقاء الصوتي */
export const SECONDS_PER_WORD = 0.5;
/** تثبيت بعد اكتمال ظهور الصفحة */
export const HOLD_SECONDS = 2;
/** خط يدوي تحت كل ركن بعد اكتمال الفقرة (خارج التثبيت) */
export const PILLAR_UNDERLINE_SECONDS = 0.7;
/** تقليب الصفحة بين المشاهد */
export const PAGE_TURN_SECONDS = 0.6;
/** إغلاق الدفتر وظهور الغلاف بعد تثبيت الخاتمة */
export const BOOK_CLOSE_SECONDS = 2.5;
/** التلاشي إلى لون الكتّان في آخر المقطع */
export const OUTRO_FADE_SECONDS = 1.5;

const sec = (s: number) => Math.round(s * FPS);

export const FRAMES_PER_WORD = SECONDS_PER_WORD * FPS;
/** لحظة ظهور الكلمة رقم i من بداية كتابة الصفحة */
export const wordFrame = (i: number) => Math.round(i * FRAMES_PER_WORD);

export const countWords = (...texts: string[]) =>
  texts.reduce((n, t) => n + words(t).length, 0);

/** مدة الكتابة والتثبيت = (الكلمات × SECONDS_PER_WORD) + HOLD_SECONDS */
export const unitFrames = (wordCount: number) =>
  sec(wordCount * SECONDS_PER_WORD + HOLD_SECONDS);

export const TURN_FRAMES = sec(PAGE_TURN_SECONDS);
export const PILLAR_UNDERLINE_FRAMES = sec(PILLAR_UNDERLINE_SECONDS);
export const BOOK_CLOSE_FRAMES = sec(BOOK_CLOSE_SECONDS);
export const OUTRO_FADE_FRAMES = sec(OUTRO_FADE_SECONDS);

// العناوين الثابتة («الخصومة»… و«من الأدب الصغير») لا تُعدّ: تُكتب مع أول كلمة ولا تُلقى.
const DEFS = [
  { id: "title", content: unitFrames(countWords(TITLE)) },
  {
    id: "pillars",
    content:
      unitFrames(countWords(PILLARS)) + PILLAR_UNDERLINE_FRAMES * PILLAR_WORDS.length,
  },
  { id: "muhasaba-a", content: unitFrames(countWords(MUHASABA_CARDS[0])) },
  { id: "muhasaba-b", content: unitFrames(countWords(MUHASABA_CARDS[1])) },
  { id: "muhasaba-c", content: unitFrames(countWords(MUHASABA_CARDS[2])) },
  { id: "khusuma", content: unitFrames(countWords(KHUSUMA)) },
  { id: "qadaa", content: unitFrames(countWords(QADAA.intro, QADAA.bad, QADAA.good)) },
  { id: "ithaba", content: unitFrames(countWords(ITHABA)) },
  { id: "ihsaa", content: unitFrames(countWords(IHSAA)) },
  { id: "mahw", content: unitFrames(countWords(MAHW)) },
  {
    id: "khatima",
    content:
      unitFrames(countWords(KHATIMA, ...ATTRIBUTION)) + BOOK_CLOSE_FRAMES + OUTRO_FADE_FRAMES,
  },
] as const;

export type PageId = (typeof DEFS)[number]["id"];

/**
 * كل صفحة: [تمهيد تحت الصفحة المقلوبة] + كتابة وتثبيت + [تقليبها].
 * التقليب يتراكب مع تمهيد الصفحة التالية، فلا تقتطع الحركة من التثبيت.
 */
export const PAGES = DEFS.map((d, i) => {
  const lead = i === 0 ? 0 : TURN_FRAMES;
  const tail = i === DEFS.length - 1 ? 0 : TURN_FRAMES;
  return { id: d.id as PageId, content: d.content, lead, frames: lead + d.content + tail };
});

export const page = (id: PageId) => PAGES.find((p) => p.id === id)!;

/** بداية تسلسل الصفحة وبداية كتابتها في الخط الزمني الكلي */
export const pageTimeline = () => {
  let start = 0;
  return PAGES.map((p) => {
    const row = { ...p, start, contentStart: start + p.lead };
    start += p.frames - TURN_FRAMES;
    return row;
  });
};

export const TOTAL_FRAMES =
  PAGES.reduce((a, p) => a + p.frames, 0) - TURN_FRAMES * (PAGES.length - 1);
