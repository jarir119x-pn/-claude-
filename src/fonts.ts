import { loadFont as loadAmiri } from "@remotion/google-fonts/Amiri";
import { loadFont as loadKufi } from "@remotion/google-fonts/NotoKufiArabic";

// الأوزان المستخدمة فقط، والمجموعة العربية فقط.
// loadFont يؤخّر العرض (delayRender) حتى يكتمل التحميل.
const amiri = loadAmiri("normal", { weights: ["400", "700"], subsets: ["arabic"] });
const kufi = loadKufi("normal", { weights: ["700"], subsets: ["arabic"] });

export const AMIRI = amiri.fontFamily;
export const KUFI = kufi.fontFamily;

/** يُنتظر قبل قياس الأسطر */
export const fontsReady: Promise<void> = Promise.all([
  amiri.waitUntilDone(),
  kufi.waitUntilDone(),
]).then(() => document.fonts.ready.then(() => undefined));
