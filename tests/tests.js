'use strict';

// اختبارات تعمل في المتصفح بلا أدوات: افتح tests/index.html من استضافة.
(async function () {
  const { arabic, model, db, backup } = window.hifz;
  const results = [];
  const check = (name, condition, detail = '') => results.push({ name, ok: Boolean(condition), detail });
  const throws = async (fn) => { try { await fn(); return null; } catch (e) { return e; } };

  // ———— النص العربي ————
  check('الأرقام الهندية', arabic.toHindiDigits('19 من 360') === '١٩ من ٣٦٠');
  check('إخفاء التشكيل يحذف الحركات والشدّة والتنوين', arabic.stripTashkeel('مِكَرٍّ مِفَرٍّ') === 'مكر مفر');
  check('البحث: «الخيل» تطابق «الْخَيْلُ»', arabic.normalizeForSearch('الْخَيْلُ') === arabic.normalizeForSearch('الخيل'));
  check('البحث يتجاهل الهمزات', arabic.normalizeForSearch('أَنْباءً') === arabic.normalizeForSearch('انباء'));
  check('البحث يتجاهل التطويل', arabic.normalizeForSearch('الشـــعر') === 'الشعر');

  // ———— السجلات ————
  const poem = model.createPoem({ title: 'النونية', poet: 'ابن زيدون', ard: 'andalus' });
  check('القصيدة تحمل كل الحقول', ['id', 'title', 'poet', 'era', 'ard', 'bahr', 'qafiya', 'gharad', 'source', 'occasion', 'status', 'notes', 'addedAt'].every((k) => k in poem));
  check('الأرض الافتراضية مشرق', model.createPoem().ard === 'mashriq');
  check('أرض غير معروفة تُرفض', await throws(() => model.createPoem({ ard: 'misr' })));
  const bayt = model.createBayt({ poemId: poem.id, order: 1, sadr: 'أَضْحَى التَّنائِي بَدِيلًا مِنْ تَدانِينا', ajuz: 'وَنابَ عَنْ طِيبِ لُقْيانا تَجافِينا' });
  check('البيت يحمل كل الحقول', ['id', 'poemId', 'order', 'sadr', 'ajuz', 'vocabulary', 'irab', 'notes', 'troubleWords', 'relatedIds'].every((k) => k in bayt));
  const review = model.createReview({ baytId: bayt.id, nextDue: '2026-10-17' });

  // ———— التخزين والنسخ الاحتياطي ————
  await new Promise((resolve) => { const r = indexedDB.deleteDatabase(window.HIFZ_DB_NAME); r.onsuccess = r.onerror = r.onblocked = resolve; });
  await db.putMany({ poems: [poem], abyat: [bayt], reviews: [review] });
  check('الحفظ والقراءة', (await db.get('poems', poem.id)).title === 'النونية');
  check('التشكيل يُحفظ كما أُدخل', (await db.get('abyat', bayt.id)).sadr === bayt.sadr);
  check('المستحق اليوم', (await db.dueReviews('2026-10-17')).length === 1);
  check('غير المستحق قبل موعده', (await db.dueReviews('2026-10-16')).length === 0);

  const exported = await backup.exportData();
  check('ملف التصدير برقم إصدار', exported.format === 'hifz-alshir' && exported.version === 1);
  check('التصدير يحمل السجلات الثلاثة', exported.poems.length === 1 && exported.abyat.length === 1 && exported.reviews.length === 1);

  await db.remove('poems', poem.id);
  const counts = await backup.importData(JSON.parse(JSON.stringify(exported)));
  check('الاستيراد يعيد ما حُذف', counts.poems === 1 && (await db.get('poems', poem.id)).poet === 'ابن زيدون');
  await backup.importData(exported);
  check('الاستيراد مرتين لا يكرّر', (await db.count('poems')) === 1);

  const partial = JSON.parse(JSON.stringify(exported));
  delete partial.poems[0].notes;
  await backup.importData(partial);
  check('الاستيراد يكمل الحقول الناقصة', (await db.get('poems', poem.id)).notes === '');

  check('ملف غريب يُرفض', await throws(() => backup.importData({ hello: 1 })));
  check('إصدار أحدث يُرفض', await throws(() => backup.importData({ ...exported, version: 99 })));
  const badArd = JSON.parse(JSON.stringify(exported));
  badArd.poems[0].ard = 'misr';
  check('أرض غير معروفة في الملف تُرفض', await throws(() => backup.importData(badArd)));

  // ———— العرض ————
  const list = document.getElementById('results');
  for (const r of results) {
    const li = document.createElement('li');
    li.className = r.ok ? 'pass' : 'fail';
    li.textContent = `${r.ok ? '✓' : '✗'} ${r.name}`;
    list.appendChild(li);
  }
  const failed = results.filter((r) => !r.ok).length;
  document.getElementById('summary').textContent = failed
    ? `فشل ${arabic.toHindiDigits(failed)} من ${arabic.toHindiDigits(results.length)}`
    : `نجحت الاختبارات كلها (${arabic.toHindiDigits(results.length)})`;
  window.TEST_RESULT = { failed, total: results.length, results };
})().catch((e) => {
  document.getElementById('summary').textContent = `توقّفت الاختبارات: ${e.message}`;
  window.TEST_RESULT = { failed: -1, error: e.message };
});
