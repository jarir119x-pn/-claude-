'use strict';

// هيكل التطبيق: الافتتاح، والتنقل بين الشاشات، والرئيسية، والنسخ الاحتياطي.
(function (hifz) {
  const { toHindiDigits } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  const SPLASH_KEY = 'hifz.splashDay';
  const SPLASH_MS = 950;

  const MINUTES_KEY = 'hifz.minutes';
  const today = () => hifz.srs.today();

  // ———— الافتتاح: أول فتح في اليوم وحده، ويُتخطّى بأي لمسة ————
  function initSplash() {
    const splash = $('splash');
    let timer = 0;
    const hide = () => {
      clearTimeout(timer);
      splash.classList.add('is-leaving');
      timer = setTimeout(() => { splash.hidden = true; }, 150);
    };
    let seenToday = false;
    try {
      seenToday = localStorage.getItem(SPLASH_KEY) === today();
      localStorage.setItem(SPLASH_KEY, today());
    } catch (e) { /* التخزين غير متاح: يظهر الافتتاح في كل فتح */ }
    if (seenToday) {
      splash.hidden = true;
      return;
    }
    splash.addEventListener('click', hide);
    splash.addEventListener('keydown', hide);
    splash.focus({ preventScroll: true });
    timer = setTimeout(() => { splash.hidden = true; }, SPLASH_MS);
  }

  // ———— التنقل: كل شاشة قسم في index.html، والعنوان بعد # يختارها ————
  // #home و#poems و#backup، و#add لقصيدة جديدة، و#edit/<المعرّف> لتعديل قصيدة،
  // و#review/<الدقائق> لجلسة مراجعة، و#done لخاتمتها
  const VIEWS = ['home', 'poems', 'edit', 'review', 'done', 'backup'];

  function showView() {
    const [name, param] = location.hash.slice(1).split('/');
    const current = name === 'add' ? 'edit' : (VIEWS.includes(name) ? name : 'home');
    for (const view of VIEWS) $(`view-${view}`).hidden = view !== current;
    window.scrollTo(0, 0);
    if (current === 'home') renderHome();
    if (current === 'poems') hifz.library.render();
    if (current === 'edit') hifz.entry.open(name === 'edit' && param ? decodeURIComponent(param) : null);
    if (current === 'review') hifz.review.start(Number(param) || 0);
    if (current === 'done') hifz.review.renderDone();
  }

  // ———— الرئيسية: ما حان موعده، واختيار مدة الجلسة ————
  let minutes = 0;
  let dueCount = 0;
  try { minutes = Number(localStorage.getItem(MINUTES_KEY)) || 0; } catch (e) { /* التخزين غير متاح */ }

  function renderDuration() {
    for (const btn of document.querySelectorAll('#duration [data-minutes]')) {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.minutes) === minutes));
    }
    const limit = minutes > 0 ? Math.round((minutes * 60) / hifz.srs.SECONDS_PER_BAYT) : dueCount;
    const inSession = Math.min(limit, dueCount);
    $('duration-note').textContent = inSession < dueCount
      ? `في الجلسة: ${toHindiDigits(inSession)} من ${toHindiDigits(dueCount)}، الأهمّ أولًا`
      : `في الجلسة: ${toHindiDigits(dueCount)}`;
    $('start-btn').href = `#review/${minutes}`;
  }

  // التنبيه: العدد على الرئيسية، وشارة على أيقونة التطبيق حيث يدعمها الهاتف
  function setBadge(count) {
    if (!('setAppBadge' in navigator)) return;
    (count ? navigator.setAppBadge(count) : navigator.clearAppBadge()).catch(() => { /* غير مدعوم */ });
  }

  async function renderHome() {
    try {
      await hifz.srs.ensureSchedule(today());
      const [session, poems, abyat] = await Promise.all([
        hifz.srs.buildSession(today()),
        hifz.db.count('poems'),
        hifz.db.count('abyat'),
      ]);
      dueCount = session.length;
      $('due-count').textContent = toHindiDigits(dueCount);
      $('stat-poems').textContent = `القصائد: ${toHindiDigits(poems)}`;
      $('stat-abyat').textContent = `الأبيات: ${toHindiDigits(abyat)}`;
      $('home-empty').hidden = poems > 0;
      // زرّ رئيس واحد في الشاشة: المراجعة إن حان شيء، وإلا الإضافة
      $('start').hidden = !dueCount;
      $('start-btn').hidden = !dueCount;
      $('add-btn').classList.toggle('zh-btn--secondary', dueCount > 0);
      renderDuration();
      setBadge(dueCount);
    } catch (e) {
      showStatus('home-status', 'تعذّر فتح المحفوظات على هذا الجهاز. تأكد أن المتصفح لا يمنع حفظ البيانات.', true);
    }
  }

  $('duration').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-minutes]');
    if (!btn) return;
    minutes = Number(btn.dataset.minutes);
    try { localStorage.setItem(MINUTES_KEY, String(minutes)); } catch (e) { /* التخزين غير متاح */ }
    renderDuration();
  });

  // ———— النسخ الاحتياطي ————
  function showStatus(id, text, isError = false) {
    const el = $(id);
    el.textContent = text;
    el.classList.toggle('is-error', isError);
  }

  function initBackup() {
    $('export-btn').addEventListener('click', async () => {
      try {
        const data = await hifz.backup.downloadExport();
        showStatus('backup-status', `حُفظ الملف ${hifz.backup.fileName()}: القصائد ${toHindiDigits(data.poems.length)}، والأبيات ${toHindiDigits(data.abyat.length)}.`);
      } catch (e) {
        showStatus('backup-status', `تعذّر التصدير: ${e.message}`, true);
      }
    });

    $('import-input').addEventListener('change', async (event) => {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      try {
        const n = await hifz.backup.importFile(file);
        showStatus('backup-status', `تمّ الاستيراد: القصائد ${toHindiDigits(n.poems)}، والأبيات ${toHindiDigits(n.abyat)}، والمراجعات ${toHindiDigits(n.reviews)}.`);
      } catch (e) {
        showStatus('backup-status', e.message, true);
      }
    });
  }

  // ———— العمل دون إنترنت: لا يعمل Service Worker إلا من استضافة ————
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
    navigator.serviceWorker.register('sw.js').catch(() => { /* يعمل التطبيق دونه، لكن لا يُخزَّن للعمل دون إنترنت */ });
  }


  initSplash();
  initBackup();
  window.addEventListener('hashchange', showView);
  showView();
  registerServiceWorker();
})(window.hifz = window.hifz || {});
