'use strict';

// اختبارات تعمل في المتصفح بلا أدوات: افتح tests/index.html من استضافة.
(async function () {
  const { arabic, model, db, backup, parse, poems } = window.hifz;
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

  // ———— تقسيم القصيدة الملصوقة ————
  const pasted = [
    '١- الْخَيْلُ وَاللَّيْلُ وَالْبَيْداءُ تَعْرِفُنِي * وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطاسُ وَالْقَلَمُ',
    '',
    'السَّيْفُ أَصْدَقُ أَنْباءً مِنَ الْكُتُبِ ... فِي حَدِّهِ الْحَدُّ بَيْنَ الْجِدِّ وَاللَّعِبِ',
    'لِكُلِّ شَيْءٍ إِذا ما تَمَّ نُقْصانُ\tفَلا يُغَرَّ بِطِيبِ الْعَيْشِ إِنْسانُ',
    'يا أَهْلَ أَنْدَلُسٍ لِلَّهِ دَرُّكُمُ     ماءٌ وَظِلٌّ وَأَنْهارٌ وَأَشْجارُ',
    'مِكَرٍّ مِفَرٍّ مُقْبِلٍ مُدْبِرٍ مَعًا … كَجُلْمُودِ صَخْرٍ حَطَّهُ السَّيْلُ مِنْ عَلِ',
    'بيت بلا فاصل بين شطريه',
  ].join('\n');
  const p1 = parse.parsePoemText(pasted);
  check('اللصق: خمسة أبيات بفواصل مختلفة', p1.abyat.length === 5, JSON.stringify(p1));
  check('اللصق: الترقيم في أول السطر يُحذف', p1.abyat[0].sadr.startsWith('الْخَيْلُ'));
  check('اللصق: السطر الفارغ يُتجاهل', p1.abyat[1].sadr.startsWith('السَّيْفُ'));
  check('اللصق: التشكيل يبقى', p1.abyat[2].ajuz === 'فَلا يُغَرَّ بِطِيبِ الْعَيْشِ إِنْسانُ');
  check('اللصق: سطر بلا فاصل مشكلة برقم سطره', p1.problems.length === 1 && p1.problems[0].line === 7);
  const p2 = parse.parsePoemText('صدر أول\nعجز أول\nصدر ثان\nعجز ثان', { shatrPerLine: true });
  check('كل شطر في سطر', p2.abyat.length === 2 && p2.abyat[1].ajuz === 'عجز ثان' && !p2.problems.length);
  const p3 = parse.parsePoemText('صدر * عجز * زيادة');
  check('أكثر من فاصل مشكلة', p3.problems.length === 1 && !p3.abyat.length);
  const roundTrip = parse.parsePoemText(parse.abyatToText(p1.abyat));
  check('النص للتعديل يُقسَّم كما كان', roundTrip.abyat.length === 5 && roundTrip.abyat[4].ajuz === p1.abyat[4].ajuz);

  // ———— حفظ القصيدة وتعديلها ————
  const fields = { poet: 'المتنبي', title: '', ard: 'mashriq', status: 'memorized' };
  const three = parse.parsePoemText('أ1 * ب1\nأ2 * ب2\nأ3 * ب3').abyat;
  const saved = await poems.savePoem(fields, three);
  check('العنوان الفارغ يُؤخذ من المطلع', saved.poem.title === 'أ1');
  const ids = saved.abyat.map((b) => b.id);
  await db.put('reviews', model.createReview({ baytId: ids[1], nextDue: '2026-10-20' }));

  const inserted = parse.parsePoemText('أ1 * ب1\nجديد * جديد\nأ2 * ب2\nأ3 * ب3').abyat;
  const edited = await poems.savePoem(fields, inserted, saved.poem.id);
  check('إدراج بيت في الوسط يحفظ معرّفات ما بعده', edited.abyat[2].id === ids[1] && edited.abyat[3].id === ids[2] && edited.abyat[1].id !== ids[1]);
  check('الترتيب يتجدد بعد الإدراج', edited.abyat.map((b) => b.order).join() === '1,2,3,4');

  const fixed = parse.parsePoemText('أ1 * ب1\nجديد * جديد\nأ2مصحح * ب2مصحح\nأ3 * ب3').abyat;
  const edited2 = await poems.savePoem(fields, fixed, saved.poem.id);
  check('تصحيح الشطرين معًا يحفظ المعرّف بالموضع', edited2.abyat[2].id === ids[1]);
  check('مراجعة البيت المصحَّح باقية', Boolean(await db.get('reviews', ids[1])));

  const shorter = parse.parsePoemText('أ1 * ب1\nأ3 * ب3').abyat;
  const edited3 = await poems.savePoem(fields, shorter, saved.poem.id);
  check('حذف بيت يحذفه مع مراجعته', edited3.removed === 2 && !(await db.get('reviews', ids[1])) && (await db.abyatOfPoem(saved.poem.id)).length === 2);
  check('حفظ بلا شاعر يُرفض', await throws(() => poems.savePoem({ ...fields, poet: ' ' }, three)));
  const listed = await poems.listPoems();
  check('القائمة تحمل عدد الأبيات', listed.find((p) => p.id === saved.poem.id).abyatCount === 2);
  await poems.deletePoem(saved.poem.id);
  check('حذف القصيدة يحذف أبياتها', !(await db.get('poems', saved.poem.id)) && !(await db.abyatOfPoem(saved.poem.id)).length);

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
