import {
  ATTRIBUTION,
  IHSAA,
  ITHABA,
  KHATIMA,
  KHUSUMA,
  MAHW,
  MUHASABA_CARDS,
  PILLARS,
  QADAA,
  TITLE,
  words,
} from "./content";

export const FPS = 30;

/** ثوانٍ لكل كلمة — عدّله وحده عند المزامنة مع الإلقاء الصوتي */
export const SECONDS_PER_WORD = 0.5;
/** تثبيت بعد اكتمال ظهور المشهد */
export const HOLD_SECONDS = 2;
/** التلاشي إلى الأسود في آخر المقطع (يُضاف بعد تثبيت الخاتمة) */
export const OUTRO_FADE_SECONDS = 1.5;

export const FRAMES_PER_WORD = SECONDS_PER_WORD * FPS;
/** لحظة ظهور الكلمة رقم i من بداية وحدتها */
export const wordFrame = (i: number) => Math.round(i * FRAMES_PER_WORD);

export const countWords = (...texts: string[]) =>
  texts.reduce((n, t) => n + words(t).length, 0);

/** مدة الوحدة = (الكلمات × SECONDS_PER_WORD) + HOLD_SECONDS */
export const unitFrames = (wordCount: number) =>
  Math.round((wordCount * SECONDS_PER_WORD + HOLD_SECONDS) * FPS);

// العناوين الثابتة (الخصومة، القضاء…) لا تُعدّ: تظهر مع أول كلمة ولا تُلقى.
// بطاقات المحاسبة الثلاث تُعامَل كل منها وحدةً لها تثبيتها قبل أن تُستبدل.
export const CARD_FRAMES = MUHASABA_CARDS.map((t) => unitFrames(countWords(t)));

export const SCENES = [
  { id: "title", frames: unitFrames(countWords(TITLE)) },
  { id: "pillars", frames: unitFrames(countWords(PILLARS)) },
  { id: "muhasaba", frames: CARD_FRAMES.reduce((a, b) => a + b, 0) },
  { id: "khusuma", frames: unitFrames(countWords(KHUSUMA)) },
  {
    id: "qadaa",
    frames: unitFrames(
      countWords(QADAA.intro, QADAA.badLabel, QADAA.bad, QADAA.goodLabel, QADAA.good),
    ),
  },
  { id: "ithaba", frames: unitFrames(countWords(ITHABA)) },
  { id: "ihsaa", frames: unitFrames(countWords(IHSAA)) },
  { id: "mahw", frames: unitFrames(countWords(MAHW)) },
  {
    id: "khatima",
    frames:
      unitFrames(countWords(KHATIMA, ...ATTRIBUTION)) +
      Math.round(OUTRO_FADE_SECONDS * FPS),
  },
] as const;

export type SceneId = (typeof SCENES)[number]["id"];

export const sceneFrames = (id: SceneId) =>
  SCENES.find((s) => s.id === id)!.frames;

export const sceneStart = (id: SceneId) => {
  let f = 0;
  for (const s of SCENES) {
    if (s.id === id) return f;
    f += s.frames;
  }
  throw new Error(id);
};

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.frames, 0);
export const OUTRO_FADE_FRAMES = Math.round(OUTRO_FADE_SECONDS * FPS);

/** تلاشي الخروج في آخر كل مشهد (ضمن مدة التثبيت) */
export const EXIT_FRAMES = 10;
