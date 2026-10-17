'use strict';

// الإعدادات: المظهر، وحجم خط الأبيات، واستيراد القصائد من ملف نصي.
// (النسخ الاحتياطي في app.js، وأزراره في الشاشة نفسها.)
(function (hifz) {
  const { toHindiDigits } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  const THEME_KEY = 'hifz.theme';
  const SIZE_KEY = 'hifz.baytSize';
  const SIZES = [17, 19, 21, 23];
  const DEFAULT_SIZE = 19;
  let parsed = [];

  const load = (key) => { try { return localStorage.getItem(key); } catch (e) { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (e) { /* التخزين غير متاح */ } };

  // الليل وضع ألوان فقط: data-theme على <html>، و«تلقائي» يحذفه فيتبع الهاتف
  function applyTheme(choice) {
    if (choice === 'light' || choice === 'dark') document.documentElement.dataset.theme = choice;
    else delete document.documentElement.dataset.theme;
  }

  function applySize(size) {
    document.documentElement.style.setProperty('--bayt-size', `${size}px`);
  }

  function currentTheme() {
    const t = load(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'auto';
  }

  function currentSize() {
    const z = Number(load(SIZE_KEY));
    return SIZES.includes(z) ? z : DEFAULT_SIZE;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function render() {
    const theme = currentTheme();
    const size = currentSize();
    for (const btn of document.querySelectorAll('[data-theme-choice]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.themeChoice === theme));
    }
    for (const btn of document.querySelectorAll('#size-picker [data-size]')) {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.size) === size));
    }
  }

  // ———— الاستيراد من ملف نصي: يُعرض أولًا، ثم تُحفظ القصائد السليمة ————
  function renderTextPreview() {
    const ok = parsed.filter((p) => !p.issues.length);
    $('text-preview').replaceChildren(...parsed.map((p) => {
      const li = el('li', `text-preview__item${p.issues.length ? ' is-problem' : ''}`);
      const name = p.title || (p.abyat[0] && p.abyat[0].sadr) || 'بلا عنوان';
      const meta = [p.fields.poet, p.fields.ard === 'andalus' ? 'الأندلس' : 'المشرق',
        p.fields.status === 'wishlist' ? 'أريد حفظها' : '', `الأبيات: ${toHindiDigits(p.abyat.length)}`].filter(Boolean).join('، ');
      li.append(el('strong', '', name), el('span', 'text-preview__meta', meta));
      for (const issue of p.issues) li.append(el('span', 'text-preview__issue', issue));
      return li;
    }));
    $('text-import-btn').hidden = !ok.length;
    $('text-import-btn').textContent = `احفظ القصائد السليمة (${toHindiDigits(ok.length)})`;
    const bad = parsed.length - ok.length;
    $('text-status').textContent = !parsed.length
      ? 'لم أجد في الملف قصيدة: كل قصيدة تبدأ بسطر أوله #.'
      : bad ? `في الملف قصائد تحتاج تصحيحًا: ${toHindiDigits(bad)}. صحّحها في الملف وأعد اختياره، أو احفظ السليمة وحدها.` : '';
    $('text-status').classList.toggle('is-error', !parsed.length || bad > 0);
  }

  $('theme-picker').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-choice]');
    if (!btn) return;
    save(THEME_KEY, btn.dataset.themeChoice);
    applyTheme(btn.dataset.themeChoice);
    render();
  });

  $('size-picker').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-size]');
    if (!btn) return;
    save(SIZE_KEY, btn.dataset.size);
    applySize(Number(btn.dataset.size));
    render();
  });

  $('text-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      parsed = hifz.textImport.parseLibraryText(hifz.textImport.decode(await file.arrayBuffer()));
    } catch (e) {
      parsed = [];
      $('text-status').textContent = `تعذّرت قراءة الملف: ${e.message}`;
      return;
    }
    renderTextPreview();
  });

  $('text-import-btn').addEventListener('click', async () => {
    try {
      const n = await hifz.textImport.importPoems(parsed);
      parsed = [];
      $('text-preview').replaceChildren();
      $('text-import-btn').hidden = true;
      $('text-status').classList.remove('is-error');
      $('text-status').textContent = `حُفظت القصائد: ${toHindiDigits(n.poems)}، والأبيات: ${toHindiDigits(n.abyat)}.`;
    } catch (e) {
      $('text-status').classList.add('is-error');
      $('text-status').textContent = `تعذّر الحفظ: ${e.message}`;
    }
  });

  applyTheme(currentTheme());
  applySize(currentSize());

  hifz.settings = { render };
})(window.hifz = window.hifz || {});
