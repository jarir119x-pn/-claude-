import { renderFilm, texts, subs, DUR } from './film.js';
const cv = document.getElementById('c'), g = cv.getContext('2d');
await Promise.all(['400 40px Ruqaa', '700 40px Ruqaa', '400 40px Amiri', '700 40px Amiri', '400 20px "Plex Arabic"', '600 20px "Plex Arabic"',
  '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"'].map(f => document.fonts.load(f, 'عربي 0123')));
window.DUR = DUR;
window.EV = [];                                  // silent film: no sound events
window.SUBS = subs();
window.render = t => renderFilm(g, t);
window.TEXTS = t => texts(g, t);
window.READY = true;
