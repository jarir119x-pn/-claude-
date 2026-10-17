'use strict';

// اختبارات تعمل في المتصفح بلا أدوات: افتح tests/index.html من استضافة.
(async function () {
  const { arabic, model, db, backup, parse, poems, srs, textImport } = window.hifz;
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

  // ———— الخوارزمية ————
  check('الأرقام الهندية تُقرأ رقمًا', Number(arabic.fromHindiDigits('١٢')) === 12);
  check('إضافة الأيام عبر الشهر', srs.addDays('2026-10-31', 1) === '2026-11-01' && srs.addDays('2026-12-30', 3) === '2027-01-02');
  const fresh = model.createReview({ baytId: 'x' });
  const r1 = srs.rate(fresh, 'ataqtu', '2026-10-17');
  check('أتقنته أول مرة: يوم', r1.intervalDays === 1 && r1.nextDue === '2026-10-18' && r1.ease === 2.6 && r1.lastReviewed === '2026-10-17');
  const r2 = srs.rate(r1, 'ataqtu', '2026-10-18');
  check('أتقنته ثانيًا: ٣ أيام', r2.intervalDays === 3 && r2.ease === 2.7);
  const r3 = srs.rate(r2, 'ataqtu', '2026-10-21');
  check('أتقنته بعدها: الفاصل × السهولة', r3.intervalDays === 8 && r3.nextDue === '2026-10-29');
  const r4 = srs.rate(r3, 'taraddadtu', '2026-10-29');
  check('تردّدت: الفاصل × ١٫٢ والسهولة تنقص ٠٫١٥', r4.intervalDays === 10 && r4.ease === 2.65);
  const r5 = srs.rate(r4, 'nasitu', '2026-11-08');
  check('نسيته: يوم، والسهولة تنقص ٠٫٢، والنسيان يزيد', r5.intervalDays === 1 && r5.ease === 2.45 && r5.lapses === 1);
  check('تردّدت في بيت جديد: يوم', srs.rate(fresh, 'taraddadtu', '2026-10-17').intervalDays === 1);
  let low = fresh;
  for (let i = 0; i < 10; i += 1) low = srs.rate(low, 'nasitu', '2026-10-17');
  check('السهولة لا تنزل عن ١٫٣', low.ease === 1.3 && low.lapses === 10);
  let high = fresh;
  for (let i = 0; i < 10; i += 1) high = srs.rate(high, 'ataqtu', '2026-10-17');
  check('السهولة لا تتجاوز ٣', high.ease === 3);
  check('التقييم لا يغيّر السجل الأصلي', fresh.intervalDays === 0 && fresh.ease === 2.5);
  check('تقييم غير معروف يُرفض', await throws(() => srs.rate(fresh, 'maybe')));
  check('الرسوخ عند ٣ أيام', !srs.isRasikh(r1) && srs.isRasikh(r2) && !srs.isRasikh(undefined));

  // ———— المقاطع والجلسة ————
  check('تقسيم المقاطع', srs.sectionsOf([1, 2, 3, 4, 5, 6].map((order) => ({ order })), 4).map((x) => x.length).join() === '4,2');
  const six = parse.parsePoemText('ص1 * ع1\nص2 * ع2\nص3 * ع3\nص4 * ع4\nص5 * ع5\nص6 * ع6').abyat;
  const sp = await poems.savePoem({ poet: 'زهير', ard: 'mashriq', status: 'memorized', sectionSize: 4 }, six);
  const wish = await poems.savePoem({ poet: 'ابن زيدون', ard: 'andalus', status: 'wishlist' }, six.slice(0, 2));
  const mine = (items) => items.filter((it) => it.poem.id === sp.poem.id);
  const s1 = await srs.ensureSchedule('2026-10-17');
  check('المقطع الأول يُجدول لليوم وحده', s1.created === 4 && !s1.unlocked.length, JSON.stringify(s1));
  check('قصائد «أريد حفظه» لا تُجدول', !(await db.get('reviews', wish.abyat[0].id)));
  check('الجدولة لا تتكرر', (await srs.ensureSchedule('2026-10-17')).created === 0);
  check('المقطع الثاني مغلق قبل الرسوخ', !(await db.get('reviews', sp.abyat[4].id)));
  const firstFour = sp.abyat.slice(0, 4).map((b) => b.id);
  for (const [i, id] of firstFour.entries()) {
    const rev = await db.get('reviews', id);
    await db.put('reviews', { ...rev, intervalDays: i === 3 ? 1 : 3, nextDue: '2026-10-2' + i });
  }
  check('لا يُفتح المقطع وبيت واحد لم يرسخ', (await srs.ensureSchedule('2026-10-17')).created === 0);
  const last = await db.get('reviews', firstFour[3]);
  await db.put('reviews', { ...last, intervalDays: 3 });
  const s2 = await srs.ensureSchedule('2026-10-17');
  check('رسوخ المقطع يفتح الذي بعده', s2.created === 2 && s2.unlocked.length === 1 && s2.unlocked[0].section === 2);

  const session = mine(await srs.buildSession('2026-10-21'));
  check('الجلسة: المستحق حتى اليوم فقط', session.length === 2 + 2, String(session.length));
  check('الجلسة: الأقدم تأخرًا أولًا', session[0].review.nextDue <= session[session.length - 1].review.nextDue && session[session.length - 1].review.nextDue === '2026-10-21');
  check('الجلسة حسب الوقت: دقيقة واحدة ثلاثة أبيات', (await srs.buildSession('2026-10-21', 1)).length === 3);
  await poems.savePoem({ poet: 'زهير', ard: 'mashriq', status: 'wishlist', sectionSize: 4 }, six, sp.poem.id);
  check('نقل القصيدة إلى «أريد حفظه» يُخرجها من الجلسة', mine(await srs.buildSession('2026-10-21')).length === 0);
  const saved1 = await srs.saveRating(session[0].review, 'ataqtu', '2026-10-21');
  check('حفظ التقييم', (await db.get('reviews', saved1.baytId)).lastReviewed === '2026-10-21');
  await poems.deletePoem(sp.poem.id);
  await poems.deletePoem(wish.poem.id);

  // ———— البحث والتصنيف ————
  const qPoem = { title: 'واحرّ قلباه', poet: 'المتنبي', qafiya: 'الميم', bahr: 'البسيط', era: 'العباسي', gharad: 'العتاب', source: { book: 'الديوان' } };
  const qAbyat = [{ sadr: 'الْخَيْلُ وَاللَّيْلُ وَالْبَيْداءُ تَعْرِفُنِي', ajuz: 'وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطاسُ وَالْقَلَمُ' }];
  check('البحث بالشاعر', poems.matchPoem(qPoem, qAbyat, 'المتنبي') && !poems.matchPoem(qPoem, qAbyat, 'المتنبي').bayt);
  check('البحث بالقافية', Boolean(poems.matchPoem(qPoem, qAbyat, 'الميم')));
  const inBayt = poems.matchPoem(qPoem, qAbyat, 'القرطاس');
  check('البحث بكلمة من البيت يُرجع البيت', inBayt && inBayt.bayt === qAbyat[0]);
  check('البحث يتجاهل التشكيل والهمزة', Boolean(poems.matchPoem(qPoem, qAbyat, 'البيداء')) && Boolean(poems.matchPoem({ ...qPoem, title: 'أنباء' }, [], 'انباء')));
  check('لا تطابق', poems.matchPoem(qPoem, qAbyat, 'زهير') === null);
  check('البحث الفارغ يطابق الكل', Boolean(poems.matchPoem(qPoem, qAbyat, '  ')));
  const grouped = poems.groupResults([
    { poem: { poet: 'المتنبي', bahr: 'الطويل', source: {} } },
    { poem: { poet: 'أبو تمام', bahr: '', source: {} } },
    { poem: { poet: 'المتنبي', bahr: 'البسيط', source: {} } },
  ], 'poet');
  check('التصنيف بالشاعر', grouped.length === 2 && grouped.find((g) => g.name === 'المتنبي').items.length === 2);
  const byBahr = poems.groupResults([{ poem: { bahr: '', source: {} } }, { poem: { bahr: 'الطويل', source: {} } }], 'bahr');
  check('«غير محدد» آخر المجموعات', byBahr[byBahr.length - 1].name === poems.UNSET);
  check('بلا تصنيف: مجموعة واحدة', poems.groupResults([1, 2].map(() => ({ poem: {} })), '').length === 1);

  // ———— أساليب الاختبار ————
  check('الكلمات', arabic.words(' الْخَيْلُ  وَاللَّيْلُ ').length === 2);
  const fl = arabic.firstLetter('الْخَيْلُ');
  check('الحرف الأول', fl.awwal === 'ا' && fl.baqi === 'لْخَيْلُ');
  check('الحرف الأول بحركاته', arabic.firstLetter('مِكَرٍّ').awwal === 'مِ' && arabic.firstLetter('وَالسَّيْفُ').awwal === 'وَ');
  const rp = await poems.savePoem({ poet: 'عشوائي', ard: 'mashriq', status: 'memorized', sectionSize: 2 }, parse.parsePoemText('ع1 * ع1\nع2 * ع2\nع3 * ع3').abyat);
  await srs.ensureSchedule('2026-10-17');
  const before = await db.get('reviews', rp.abyat[0].id);
  const randomItems = (await srs.randomSession(50)).filter((it) => it.poem.id === rp.poem.id);
  check('العشوائية من المجدول وحده', randomItems.length === 2);
  check('العشوائية لا تغيّر المواعيد', JSON.stringify(await db.get('reviews', rp.abyat[0].id)) === JSON.stringify(before));
  check('عدد المجدول', (await srs.scheduledCount()) >= 2);
  await poems.deletePoem(rp.poem.id);

  // ———— الاستيراد من ملف نصي ————
  const library = [
    'ملاحظة قبل أول قصيدة تُتجاهل',
    '# واحرّ قلباه',
    'الشاعر: المتنبي',
    'البحر: البسيط',
    'الكتاب: الديوان',
    'الصفحة: ٣٣١',
    '',
    'الْخَيْلُ وَاللَّيْلُ وَالْبَيْداءُ تَعْرِفُنِي * وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطاسُ وَالْقَلَمُ',
    '',
    '# النونية',
    'الشاعر: ابن زيدون',
    'الأرض: الأندلس',
    'الحالة: أريد حفظها',
    'المقطع: ٢',
    'أَضْحَى التَّنائِي بَدِيلًا مِنْ تَدانِينا * وَنابَ عَنْ طِيبِ لُقْيانا تَجافِينا',
    '#',
    'البحر: الطويل',
    'بيت بلا فاصل',
    '# أرض خطأ',
    'الشاعر: س',
    'الأرض: مصر',
    'ص * ع',
  ].join('\r\n');
  const lib = textImport.parseLibraryText(library);
  check('الملف النصي: أربع قصائد', lib.length === 4, JSON.stringify(lib.map((x) => x.title)));
  check('الحقول تُقرأ', lib[0].fields.poet === 'المتنبي' && lib[0].fields.bahr === 'البسيط' && lib[0].fields.source.book === 'الديوان' && lib[0].fields.source.page === '٣٣١');
  check('الأبيات تُقسَّم والقصيدة سليمة', lib[0].abyat.length === 1 && !lib[0].issues.length);
  check('الأرض والحالة والمقطع', lib[1].fields.ard === 'andalus' && lib[1].fields.status === 'wishlist' && lib[1].fields.sectionSize === 2);
  check('بلا شاعر وسطر بلا فاصل: مشكلات برقم السطر الصحيح', lib[2].issues.length === 3 && lib[2].issues.some((x) => x.startsWith('السطر ١٨:')), JSON.stringify(lib[2].issues));
  check('أرض غير معروفة مشكلة', lib[3].issues.length === 1);
  const imported = await textImport.importPoems(lib);
  check('يُحفظ السليم وحده', imported.poems === 2 && imported.abyat === 2);
  const allPoems = await poems.listPoems();
  const nuniya = allPoems.find((x) => x.poet === 'ابن زيدون' && x.title === 'النونية');
  check('القصيدة المستوردة كاملة الحقول', nuniya && nuniya.ard === 'andalus' && nuniya.status === 'wishlist' && nuniya.sectionSize === 2);
  for (const x of allPoems.filter((y) => y.poet === 'المتنبي' || (y.poet === 'ابن زيدون' && y.title === 'النونية'))) await poems.deletePoem(x.id);
  check('ترميز UTF-8', textImport.decode(new TextEncoder().encode('الميم').buffer) === 'الميم');
  check('ترميز Windows-1256 (ANSI)', textImport.decode(new Uint8Array([0xC7, 0xE1, 0xE3, 0xED, 0xE3]).buffer) === 'الميم');
  check('ترميز UTF-16 (Unicode)', textImport.decode(new Uint8Array([0xFF, 0xFE, 0x27, 0x06, 0x44, 0x06]).buffer) === 'ال');

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
