'use strict';

// جلسة المراجعة: بطاقة البيت بثوب أرضه، وكشف العجز، والتقييم، ثم الخاتمة بوسام الشمسة.
(function (hifz) {
  const { toHindiDigits, stripTashkeel } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  const TASHKEEL_KEY = 'hifz.tashkeel';
  const RATING_NAMES = { nasitu: 'نسيت', taraddadtu: 'تردّدت', ataqtu: 'أتقنت' };

  let session = [];
  let index = 0;
  let tally = {};
  let busy = false;
  let showTashkeel = true;
  let lastSession = null;

  try { showTashkeel = localStorage.getItem(TASHKEEL_KEY) !== 'off'; } catch (e) { /* التخزين غير متاح */ }

  const display = (text) => (showTashkeel ? text : stripTashkeel(text));

  function setRevealed(revealed) {
    $('card-slot').classList.toggle('is-shown', revealed);
    $('reveal').hidden = revealed;
    $('rate').hidden = !revealed;
  }

  // الثوب من أرض القصيدة وحدها: إطار بالظلّ للمشرق، ومذهّب بشمستيه للأندلس
  function renderCard() {
    const { bayt, poem } = session[index];
    const andalus = poem.ard === 'andalus';
    $('card').classList.toggle('zh-lawh--abbasi', !andalus);
    $('card').classList.toggle('card--andalus', andalus);
    $('card-foot').classList.toggle('naqsh-hashiya--andalus', andalus);
    $('card-poet').textContent = poem.poet;
    $('card-bahr').textContent = poem.bahr;
    $('card-bahr').hidden = !poem.bahr;
    $('card-count').textContent = `${toHindiDigits(index + 1)} من ${toHindiDigits(session.length)}`;
    $('card-title').textContent = poem.title;
    $('card-sadr').textContent = display(bayt.sadr);
    $('card-ajuz').textContent = display(bayt.ajuz);
  }

  function showCard() {
    renderCard();
    setRevealed(false);
    $('reveal').focus({ preventScroll: true });
  }

  // يبدأ جلسة بالمدة المختارة بالدقائق (٠ للكل)
  async function start(minutes = 0) {
    $('review-status').textContent = '';
    tally = { nasitu: 0, taraddadtu: 0, ataqtu: 0 };
    try {
      await hifz.srs.ensureSchedule();
      session = await hifz.srs.buildSession(hifz.srs.today(), minutes);
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
    try {
      ({ unlocked } = await hifz.srs.ensureSchedule());
    } catch (e) { /* تُفتح المقاطع في الجلسة القادمة */ }
    lastSession = { count: index, tally, unlocked };
    location.hash = '#done';
  }

  function renderDone() {
    if (!lastSession) {
      location.hash = '#home';
      return;
    }
    const { count, tally: t, unlocked } = lastSession;
    $('done-count').textContent = toHindiDigits(count);
    $('done-summary').textContent = Object.keys(RATING_NAMES)
      .reverse()
      .map((r) => `${RATING_NAMES[r]}: ${toHindiDigits(t[r])}`)
      .join('، '); // لا «·» بعد رقم: تُقرأ صفرًا هنديًّا
    const titles = [...new Set(unlocked.map((u) => u.poem.title))];
    $('done-unlocked').hidden = !titles.length;
    $('done-unlocked').textContent = titles.length
      ? `رسخ مقطع، فانفتح الذي بعده من: ${titles.map((x) => `«${x}»`).join('، ')}.`
      : '';
  }

  $('reveal').addEventListener('click', () => {
    setRevealed(true);
    $('rate').querySelector('button').focus({ preventScroll: true });
  });

  $('rate').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-rating]');
    if (!btn || busy) return;
    busy = true;
    try {
      await hifz.srs.saveRating(session[index].review, btn.dataset.rating);
      tally[btn.dataset.rating] += 1;
      index += 1;
      if (index >= session.length) await finish();
      else showCard();
    } catch (e) {
      $('review-status').textContent = `تعذّر حفظ التقييم: ${e.message}`;
    } finally {
      busy = false;
    }
  });

  function applyTashkeelButton() {
    $('tashkeel-toggle').setAttribute('aria-pressed', String(showTashkeel));
    $('tashkeel-toggle').textContent = showTashkeel ? 'التشكيل ظاهر' : 'التشكيل مخفي';
  }

  $('tashkeel-toggle').addEventListener('click', () => {
    showTashkeel = !showTashkeel;
    try { localStorage.setItem(TASHKEEL_KEY, showTashkeel ? 'on' : 'off'); } catch (e) { /* التخزين غير متاح */ }
    applyTashkeelButton();
    if (session[index]) renderCard();
  });

  applyTashkeelButton();

  hifz.review = { start, renderDone };
})(window.hifz = window.hifz || {});
