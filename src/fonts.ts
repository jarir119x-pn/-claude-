import { loadFont as loadMarkazi } from "@remotion/google-fonts/MarkaziText";
import { loadFont as loadMessiri } from "@remotion/google-fonts/ElMessiri";

// الأوزان المستخدمة فقط. loadFont يؤخّر العرض (delayRender) حتى يكتمل التحميل.
const markazi = loadMarkazi("normal", { weights: ["400", "600"], subsets: ["arabic", "latin"] });
const messiri = loadMessiri("normal", { weights: ["600"], subsets: ["arabic", "latin"] });

export const MARKAZI = markazi.fontFamily;
export const MESSIRI = messiri.fontFamily;

export const fontsReady: Promise<void> = Promise.all([
  markazi.waitUntilDone(),
  messiri.waitUntilDone(),
]).then(() => document.fonts.ready.then(() => undefined));
