import '@fontsource/cairo/arabic-400.css';
import '@fontsource/cairo/arabic-700.css';
import '@fontsource/cairo/arabic-900.css';
import '@fontsource/cairo/latin-400.css';
import '@fontsource/cairo/latin-700.css';
import '@fontsource/cairo/latin-900.css';
import '@fontsource/amiri/arabic-400.css';
import '@fontsource/amiri/arabic-700.css';
import '@fontsource/reem-kufi/arabic-400.css';
import '@fontsource/reem-kufi/arabic-700.css';
import '@fontsource/reem-kufi/latin-700.css';

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const colors = {
  ink: '#0a0f1c',
  inkSoft: '#121a2e',
  ivory: '#f4ead5',
  ivoryDim: 'rgba(244, 234, 213, 0.62)',
  gold: '#d9a84e',
  goldBright: '#f3c96b',
  goldDeep: '#9c7130',
  red: '#e2553f',
  redSoft: 'rgba(226, 85, 63, 0.18)',
  teal: '#5fb3a8',
  slate: '#8a93a8',
  line: 'rgba(244, 234, 213, 0.12)',
};

export const fonts = {
  // عناوين بالخط الكوفي
  kufi: '"Reem Kufi", "Cairo", sans-serif',
  // النص الأدبي والاقتباسات بخط النسخ
  naskh: '"Amiri", "Cairo", serif',
  // الأرقام والنصوص الوظيفية
  sans: '"Cairo", sans-serif',
};

export const fontFaces = [
  '400 40px "Cairo"',
  '700 40px "Cairo"',
  '900 40px "Cairo"',
  '400 40px "Amiri"',
  '700 40px "Amiri"',
  '400 40px "Reem Kufi"',
  '700 40px "Reem Kufi"',
];
