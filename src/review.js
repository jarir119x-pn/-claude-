'use strict';

// جلسة المراجعة: بطاقة البيت بثوب أرضه، وأساليب الاختبار، والتقييم، ثم الخاتمة بوسام الشمسة.
// الأساليب: ajuz يظهر الصدر فيُستحضر العجز، وsadr عكسه، وawail الحروف الأولى،
// وtadrij الإخفاء التدريجي كلمةً كلمة، وrabt البيت السابق ثم التالي.
// والمراجعة العشوائية تدريب حرّ لا يُحفظ تقييمه.
(function (hifz) {
  const { toHindiDigits, stripTashkeel, words, firstLetter } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  const TASHKEEL_KEY = 'hifz.tashkeel';
  const MODE_KEY = 'hifz.mode';
  const MODES = ['ajuz', 'sadr', 'awail', 'tadrij', 'rabt'];
  const RATING_NAMES = { nasitu: 'نسيت', taraddadtu: 'تردّدت', ataqtu: 'أتقنت' };
  const REVEAL_LABELS = { ajuz: 'اكشف العجز', sadr: 'اكشف الصدر', awail: 'اكشف البيت', rabt: 'اكشف البيت' };
  const SHATRS = ['sadr', 'ajuz'];

  let session = [];
  let index = 0;
  let tally = {};
  let busy = false;
  let random = false;
  let mode = 'ajuz';
  let showTashkeel = true;
  let lastSession = null;
  let abyatOf = new Map();
  let hideOrder = [];
  let hidden = 0;

  const load = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { /* التخزين غير متاح */ } };

  showTashkeel = load(TASHKEEL_KEY, 'on') !== 'off';
  const display = (text) => (showTashkeel ? text : stripTashkeel(text));

  function getMode() {
    const saved = load(MODE_KEY, 'ajuz');
    return MODES.includes(saved) ? saved : 'ajuz';
  }

  function setMode(value) {
    if (MODES.includes(value)) save(MODE_KEY, value);
  }

  // ———— عرض الشطر بحسب حاله: كامل، أو محجوب، أو حروف أولى، أو كلمات تُخفى ————
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function withSpaces(nodes) {
    const out = [];
    nodes.forEach((n, i) => { if (i) out.push(' '); out.push(n); });
    return out;
  }

  function renderShatr(name, state) {
    const text = display(session[index].bayt[name]);
    const shatr = $(`card-${name}`);
    const slot = $(`slot-${name}`);
    slot.classList.remove('is-revealing');
    slot.classList.toggle('is-hidden', state === 'hidden');
    if (state === 'awail') {
      shatr.replaceChildren(...withSpaces(words(text).map((w) => {
        const span = el('span', 'awail');
        span.append(firstLetter(w).awwal, el('span', 'awail__baqi', '…'));
        return span;
      })));
    } else if (state === 'tadrij') {
      shatr.replaceChildren(...withSpaces(words(text).map((w) => el('span', 'kalima', w))));
    } else {
      shatr.textContent = text;
    }
  }

  // ترتيب عشوائي لإخفاء كلمات البيت كله، صدره وعجزه معًا
  function prepareTadrij() {
    const all = [...document.querySelectorAll('#card .kalima')];
    hideOrder = all.map((_, i) => i);
    for (let i = hideOrder.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [hideOrder[i], hideOrder[j]] = [hideOrder[j], hideOrder[i]];
    }
    hidden = 0;
  }

  function tadrijLabel() {
    const total = hideOrder.length;
    return hidden < total
      ? `أخفِ كلمة (${toHindiDigits(hidden)} من ${toHindiDigits(total)})`
      : 'أظهر البيت';
  }

  function contextText() {
    const { bayt } = session[index];
    const list = abyatOf.get(bayt.poemId) || [];
    const prev = list.filter((b) => b.order < bayt.order).pop();
    return prev ? `${display(prev.sadr)} ✻ ${display(prev.ajuz)}` : 'مطلع القصيدة';
  }

  // الثوب من أرض القصيدة وحدها: إطار بالظلّ للمشرق، ومذهّب بشمستيه للأندلس
  function renderCard() {
    const { poem } = session[index];
    const andalus = poem.ard === 'andalus';
    $('card').classList.toggle('zh-lawh--abbasi', !andalus);
    $('card').classList.toggle('card--andalus', andalus);
    $('card-foot').classList.toggle('naqsh-hashiya--andalus', andalus);
    $('card-poet').textContent = poem.poet;
    $('card-bahr').textContent = poem.bahr;
    $('card-bahr').hidden = !poem.bahr;
    $('card-count').textContent = `${toHindiDigits(index + 1)} من ${toHindiDigits(session.length)}`;
    $('card-title').textContent = poem.title;

    const states = {
      ajuz: { sadr: 'full', ajuz: 'hidden' },
      sadr: { sadr: 'hidden', ajuz: 'full' },
      awail: { sadr: 'awail', ajuz: 'awail' },
      tadrij: { sadr: 'tadrij', ajuz: 'tadrij' },
      rabt: { sadr: 'hidden', ajuz: 'hidden' },
    }[mode];
    for (const name of SHATRS) renderShatr(name, states[name]);
    $('card-context').hidden = mode !== 'rabt';
    if (mode === 'rabt') $('card-context').textContent = `قبله: ${contextText()}`;
    if (mode === 'tadrij') prepareTadrij();
    $('reveal').textContent = mode === 'tadrij' ? tadrijLabel() : REVEAL_LABELS[mode];
  }

  function setRevealed(revealed) {
    $('reveal').hidden = revealed;
    $('rate').hidden = !revealed || random;
    $('next-btn').hidden = !revealed || !random;
  }

  function showCard() {
    renderCard();
    setRevealed(false);
    $('reveal').focus({ preventScroll: true });
  }

  // الكشف: كل شطر لم يكن كاملًا يُكتب كاملًا بحركة التذهيب
  function reveal() {
    for (const name of SHATRS) {
      const slot = $(`slot-${name}`);
      const wasFull = !slot.classList.contains('is-hidden') && !$(`card-${name}`).children.length;
      renderShatr(name, 'full');
      if (!wasFull) {
        void slot.offsetWidth;
        slot.classList.add('is-revealing');
      }
    }
    setRevealed(true);
    const next = random ? $('next-btn') : $('rate').querySelector('button');
    next.focus({ preventScroll: true });
  }

  async function loadContext() {
    abyatOf = new Map();
    if (mode !== 'rabt') return;
    const ids = [...new Set(session.map((it) => it.poem.id))];
    const lists = await Promise.all(ids.map((id) => hifz.db.abyatOfPoem(id)));
    ids.forEach((id, i) => abyatOf.set(id, lists[i]));
  }

  // يبدأ جلسة: param عدد الدقائق (٠ للكل)، أو 'random' للمراجعة العشوائية
  async function start(param = 0) {
    $('review-status').textContent = '';
    tally = { nasitu: 0, taraddadtu: 0, ataqtu: 0 };
    random = param === 'random';
    mode = getMode();
    try {
      await hifz.srs.ensureSchedule();
      session = random
        ? await hifz.srs.randomSession()
        : await hifz.srs.buildSession(hifz.srs.today(), Number(param) || 0);
      await loadContext();
    } catch (e) {
      $('review-status').textContent = 'تعذّر فتح المحفوظات على هذا الجهاز.';
      return;
    }
    if (!session.length) {
      location.hash = '#home';
      return;
    }
    index = 0;
    showCard();
  }

  async function finish() {
    let unlocked = [];
    if (!random) {
      try {
        ({ unlocked } = await hifz.srs.ensureSchedule());
      } catch (e) { /* تُفتح المقاطع في الجلسة القادمة */ }
    }
    lastSession = { count: index, tally, unlocked, random };
    location.hash = '#done';
  }

  function advance() {
    index += 1;
    if (index >= session.length) return finish();
    showCard();
    return null;
  }

  function renderDone() {
    if (!lastSession) {
      location.hash = '#home';
      return;
    }
    const { count, tally: t, unlocked, random: wasRandom } = lastSession;
    $('done-count').textContent = toHindiDigits(count);
    $('done-title').textContent = wasRandom ? 'أتممت المراجعة العشوائية' : 'أتممت المراجعة';
    // لا «·» بعد رقم: تُقرأ صفرًا هنديًّا
    $('done-summary').textContent = wasRandom
      ? 'تدريب حرّ: لا يغيّر مواعيد المراجعة.'
      : Object.keys(RATING_NAMES).reverse().map((r) => `${RATING_NAMES[r]}: ${toHindiDigits(t[r])}`).join('، ');
    const titles = [...new Set(unlocked.map((u) => u.poem.title))];
    $('done-unlocked').hidden = !titles.length;
    $('done-unlocked').textContent = titles.length
      ? `رسخ مقطع، فانفتح الذي بعده من: ${titles.map((x) => `«${x}»`).join('، ')}.`
      : '';
  }

  $('reveal').addEventListener('click', () => {
    if (mode !== 'tadrij' || hidden >= hideOrder.length) {
      reveal();
      return;
    }
    const all = document.querySelectorAll('#card .kalima');
    all[hideOrder[hidden]].classList.add('kalima--khafiya');
    hidden += 1;
    $('reveal').textContent = tadrijLabel();
  });

  $('rate').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-rating]');
    if (!btn || busy) return;
    busy = true;
    try {
      await hifz.srs.saveRating(session[index].review, btn.dataset.rating);
      tally[btn.dataset.rating] += 1;
      await advance();
    } catch (e) {
      $('review-status').textContent = `تعذّر حفظ التقييم: ${e.message}`;
    } finally {
      busy = false;
    }
  });

  $('next-btn').addEventListener('click', () => advance());

  function applyTashkeelButton() {
    $('tashkeel-toggle').setAttribute('aria-pressed', String(showTashkeel));
    $('tashkeel-toggle').textContent = showTashkeel ? 'التشكيل ظاهر' : 'التشكيل مخفي';
  }

  $('tashkeel-toggle').addEventListener('click', () => {
    showTashkeel = !showTashkeel;
    save(TASHKEEL_KEY, showTashkeel ? 'on' : 'off');
    applyTashkeelButton();
    if (!session[index]) return;
    const revealed = !$('reveal').hidden ? false : true;
    renderCard();
    if (revealed) {
      for (const name of SHATRS) renderShatr(name, 'full');
    }
    setRevealed(revealed);
  });

  applyTashkeelButton();

  hifz.review = { start, renderDone, getMode, setMode };
})(window.hifz = window.hifz || {});
