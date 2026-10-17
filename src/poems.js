'use strict';

// حفظ القصائد وأبياتها وحذفها. التعديل يحافظ على معرّف كل بيت، فلا يضيع سجل مراجعته:
// يُطابَق البيت القديم بنصّ صدره أو عجزه أولًا (فيصحّ إدراج بيت في الوسط)،
// ثم بموضعه (فيصحّ تصحيح حرف في الشطرين معًا).
(function (hifz) {
  const { db, model } = hifz;
  const key = (text) => hifz.arabic.normalizeForSearch(text);

  // يُرجع لكل بيت جديد البيتَ القديم المقابل له أو null
  function matchOld(parsedAbyat, oldAbyat) {
    const used = new Set();
    const matches = parsedAbyat.map((b) => {
      const old = oldAbyat.find((o) => !used.has(o.id) && (key(o.sadr) === key(b.sadr) || key(o.ajuz) === key(b.ajuz)));
      if (old) used.add(old.id);
      return old || null;
    });
    parsedAbyat.forEach((b, i) => {
      const old = oldAbyat[i];
      if (!matches[i] && old && !used.has(old.id)) {
        matches[i] = old;
        used.add(old.id);
      }
    });
    return { matches, unused: oldAbyat.filter((o) => !used.has(o.id)) };
  }

  // يحفظ القصيدة وأبياتها. poemId للتعديل، ويُترك فارغًا للإضافة.
  async function savePoem(fields, parsedAbyat, poemId = null) {
    if (!parsedAbyat.length) throw new Error('القصيدة بلا أبيات.');
    if (!String(fields.poet || '').trim()) throw new Error('اكتب اسم الشاعر.');

    const existing = poemId ? await db.get('poems', poemId) : null;
    if (poemId && !existing) throw new Error('لم أجد القصيدة. لعلها حُذفت.');
    const title = String(fields.title || '').trim() || parsedAbyat[0].sadr;
    const poem = existing
      ? { ...existing, ...fields, title }
      : model.createPoem({ ...fields, title });

    const oldAbyat = existing ? await db.abyatOfPoem(poem.id) : [];
    const { matches, unused } = matchOld(parsedAbyat, oldAbyat);
    const abyat = parsedAbyat.map((b, i) => (matches[i]
      ? { ...matches[i], sadr: b.sadr, ajuz: b.ajuz, order: i + 1 }
      : model.createBayt({ poemId: poem.id, order: i + 1, sadr: b.sadr, ajuz: b.ajuz })));
    // ما لم يقابله بيت جديد يُحذف مع مراجعاته
    const removedIds = unused.map((b) => b.id);

    await db.commit({
      put: { poems: [poem], abyat },
      remove: { abyat: removedIds, reviews: removedIds },
    });
    return { poem, abyat, removed: removedIds.length };
  }

  async function deletePoem(poemId) {
    const ids = (await db.abyatOfPoem(poemId)).map((b) => b.id);
    await db.commit({ remove: { poems: [poemId], abyat: ids, reviews: ids } });
  }

  // القصائد مع عدد أبيات كلٍّ منها، الأحدث أولًا
  async function listPoems() {
    const [poems, abyat] = await Promise.all([db.getAll('poems'), db.getAll('abyat')]);
    const counts = new Map();
    for (const b of abyat) counts.set(b.poemId, (counts.get(b.poemId) || 0) + 1);
    return poems
      .map((p) => ({ ...p, abyatCount: counts.get(p.id) || 0 }))
      .sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)));
  }

  // ———— البحث والتصنيف ————
  const { normalizeForSearch } = hifz.arabic;
  const UNSET = 'غير محدد';

  const facetValue = (poem, facet) => String((facet === 'book' ? poem.source && poem.source.book : poem[facet]) || '').trim() || UNSET;

  // تطابق القصيدة إن وُجدت الكلمة في عنوانها أو شاعرها أو قافيتها أو بحرها أو عصرها أو غرضها أو كتابها،
  // أو في أحد أبياتها، فيُرجَع أول بيت مطابق ليُعرض تحتها
  function matchPoem(poem, abyat, query) {
    const q = normalizeForSearch(query);
    if (!q) return { poem, bayt: null };
    const fields = [poem.title, poem.poet, poem.qafiya, poem.bahr, poem.era, poem.gharad, poem.source && poem.source.book];
    if (fields.some((f) => normalizeForSearch(f || '').includes(q))) return { poem, bayt: null };
    const bayt = abyat.find((b) => normalizeForSearch(b.sadr).includes(q) || normalizeForSearch(b.ajuz).includes(q));
    return bayt ? { poem, bayt } : null;
  }

  // يجمع النتائج في مجموعات بحسب الحقل، مرتبة أبجديًّا و«غير محدد» آخرها. بلا حقل: مجموعة واحدة
  function groupResults(results, facet) {
    if (!facet) return [{ name: '', items: results }];
    const groups = new Map();
    for (const r of results) {
      const name = facetValue(r.poem, facet);
      if (!groups.has(name)) groups.set(name, []);
      groups.get(name).push(r);
    }
    return [...groups.entries()]
      .map(([name, items]) => ({ name, items }))
      .sort((a, b) => (a.name === UNSET) - (b.name === UNSET) || a.name.localeCompare(b.name, 'ar'));
  }

  hifz.poems = { savePoem, deletePoem, listPoems, matchPoem, groupResults, UNSET };
})(window.hifz = window.hifz || {});
