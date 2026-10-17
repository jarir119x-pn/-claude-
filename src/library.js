'use strict';

// قائمة القصائد: المحفوظ و«أريد حفظه»، وكل قصيدة رابط إلى تعديلها.
(function (hifz) {
  const { toHindiDigits } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  let status = 'memorized';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function row(poem) {
    const li = el('li');
    const link = el('a', `poem-row${poem.ard === 'andalus' ? ' poem-row--andalus' : ''}`);
    link.href = `#edit/${encodeURIComponent(poem.id)}`;
    const meta = [poem.poet, poem.bahr, `الأبيات: ${toHindiDigits(poem.abyatCount)}`].filter(Boolean).join(' · ');
    link.append(el('span', 'poem-row__title', poem.title), el('span', 'poem-row__meta', meta));
    li.append(link);
    return li;
  }

  async function render() {
    $('poems-status').textContent = hifz.flash || '';
    hifz.flash = '';
    for (const btn of document.querySelectorAll('[data-status]')) {
      btn.setAttribute('aria-pressed', String(btn.dataset.status === status));
    }
    let poems;
    try {
      poems = await hifz.poems.listPoems();
    } catch (e) {
      $('poems-status').textContent = 'تعذّر فتح المحفوظات على هذا الجهاز.';
      return;
    }
    const counts = { memorized: 0, wishlist: 0 };
    for (const p of poems) counts[p.status] += 1;
    $('count-memorized').textContent = `(${toHindiDigits(counts.memorized)})`;
    $('count-wishlist').textContent = `(${toHindiDigits(counts.wishlist)})`;

    const shown = poems.filter((p) => p.status === status);
    $('poem-list').replaceChildren(...shown.map(row));
    $('poems-empty').hidden = shown.length > 0;
    $('poems-empty').textContent = status === 'memorized'
      ? 'لا قصائد محفوظة بعد.'
      : 'قائمة «أريد حفظه» فارغة. أضف إليها ما تنوي حفظه لاحقًا.';
  }

  document.querySelector('#view-poems .seg').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-status]');
    if (!btn) return;
    status = btn.dataset.status;
    render();
  });

  hifz.library = { render };
})(window.hifz = window.hifz || {});
