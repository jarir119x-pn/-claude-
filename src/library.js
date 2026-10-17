'use strict';

// قائمة القصائد: المحفوظ و«أريد حفظه»، والبحث بأي كلمة أو بالقافية، والتصنيف.
// كل قصيدة رابط إلى تعديلها.
(function (hifz) {
  const { toHindiDigits } = hifz.arabic;
  const { matchPoem, groupResults } = hifz.poems;
  const $ = (id) => document.getElementById(id);
  let status = 'memorized';
  let searchTimer = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function row({ poem, bayt }) {
    const li = el('li');
    const link = el('a', `poem-row${poem.ard === 'andalus' ? ' poem-row--andalus' : ''}`);
    link.href = `#edit/${encodeURIComponent(poem.id)}`;
    const meta = [poem.poet, poem.bahr, `الأبيات: ${toHindiDigits(poem.abyatCount)}`].filter(Boolean).join(' · ');
    link.append(el('span', 'poem-row__title', poem.title), el('span', 'poem-row__meta', meta));
    if (bayt) link.append(el('span', 'poem-row__bayt', `${bayt.sadr} ✻ ${bayt.ajuz}`));
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
    let abyat;
    try {
      [poems, abyat] = await Promise.all([hifz.poems.listPoems(), hifz.db.getAll('abyat')]);
    } catch (e) {
      $('poems-status').textContent = 'تعذّر فتح المحفوظات على هذا الجهاز.';
      return;
    }
    const counts = { memorized: 0, wishlist: 0 };
    for (const p of poems) counts[p.status] += 1;
    $('count-memorized').textContent = `(${toHindiDigits(counts.memorized)})`;
    $('count-wishlist').textContent = `(${toHindiDigits(counts.wishlist)})`;

    const abyatOf = new Map();
    for (const b of abyat.sort((x, y) => x.order - y.order)) {
      if (!abyatOf.has(b.poemId)) abyatOf.set(b.poemId, []);
      abyatOf.get(b.poemId).push(b);
    }
    const query = $('poems-search').value;
    const results = poems
      .filter((p) => p.status === status)
      .map((p) => matchPoem(p, abyatOf.get(p.id) || [], query))
      .filter(Boolean);
    const groups = groupResults(results, $('poems-group').value);

    $('poem-groups').replaceChildren(...groups.map((g) => {
      const section = el('section', 'poem-group');
      if (g.name) section.append(el('h2', 'poem-group__name', `${g.name} (${toHindiDigits(g.items.length)})`));
      const list = el('ul', 'poem-list');
      list.append(...g.items.map(row));
      section.append(list);
      return section;
    }));

    const empty = !results.length;
    $('poems-empty').hidden = !empty;
    if (query.trim() && counts[status]) $('poems-empty').textContent = `لا نتائج لـ«${query.trim()}».`;
    else $('poems-empty').textContent = status === 'memorized'
      ? 'لا قصائد محفوظة بعد.'
      : 'قائمة «أريد حفظه» فارغة. أضف إليها ما تنوي حفظه لاحقًا.';
  }

  document.querySelector('#view-poems .seg').addEventListener('click', (event) => {
    const btn = event.target.closest('[data-status]');
    if (!btn) return;
    status = btn.dataset.status;
    render();
  });
  $('poems-search').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(render, 200);
  });
  $('poems-group').addEventListener('change', render);

  hifz.library = { render };
})(window.hifz = window.hifz || {});
