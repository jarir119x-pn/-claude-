// يولّد أيقونات التطبيق من design/ornaments/shamsa.svg: التِّبر على lazaward-deep.
// أداة لـClaude في بيئة فيها Playwright، لا تُشغَّل على حاسوب المستخدم.
// الاستعمال: node tools/make-icons.js (من جذر المستودع). أعد تشغيلها إن تغيّرت زخرفة الأيقونة.
const { chromium } = require(process.env.PW || 'playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TIBR = '#D9AE5C';
const LAZAWARD_DEEP = '#132953';
const svg = fs.readFileSync(path.join(ROOT, 'design/ornaments/shamsa.svg'), 'utf8').replace(/#1E1912/g, TIBR);

// الشمسة ٦٢٪ من المربع للأيقونة العادية، و٥٢٪ للقابلة للقصّ لتبقى داخل دائرة الأمان
const ICONS = [['shamsa-192', 192, 0.62], ['shamsa-512', 512, 0.62], ['shamsa-maskable-512', 512, 0.52]];

(async () => {
  const browser = await chromium.launch();
  for (const [name, size, ratio] of ICONS) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    const s = Math.round(size * ratio);
    await page.setContent(`<body style="margin:0;background:${LAZAWARD_DEEP};width:${size}px;height:${size}px;display:grid;place-items:center">${svg.replace('width="120" height="120"', `width="${s}" height="${s}"`)}</body>`);
    await page.screenshot({ path: path.join(ROOT, 'icons', `${name}.png`) });
    await page.close();
  }
  await browser.close();
})();
