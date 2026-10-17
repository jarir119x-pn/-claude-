'use strict';

// المراجعة المتباعدة: الخوارزمية الموافَق عليها (انظر CLAUDE.md)، والمقاطع، وبناء جلسة المراجعة.
(function (hifz) {
  const { db, model } = hifz;

  const RATINGS = ['nasitu', 'taraddadtu', 'ataqtu'];
  const MIN_EASE = 1.3;
  const MAX_EASE = 3;
  const RASIKH_DAYS = 3;
  const SECONDS_PER_BAYT = 20;
  const DEFAULT_SECTION_SIZE = 4;

  // الأيام بصيغة YYYY-MM-DD بالتوقيت المحلي
  const pad = (n) => String(n).padStart(2, '0');
  const formatDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => formatDay(new Date());

  function addDays(day, n) {
    const [y, m, d] = day.split('-').map(Number);
    return formatDay(new Date(y, m - 1, d + n));
  }

  // يُرجع سجل المراجعة بعد التقييم، ولا يغيّر الأصل
  function rate(review, rating, day = today()) {
    if (!RATINGS.includes(rating)) throw new Error(`تقييم غير معروف: ${rating}`);
    const next = { ...review };
    const interval = review.intervalDays || 0;
    if (rating === 'nasitu') {
      next.intervalDays = 1;
      next.ease = Math.max(MIN_EASE, review.ease - 0.2);
      next.lapses = (review.lapses || 0) + 1;
    } else if (rating === 'taraddadtu') {
      next.intervalDays = Math.max(1, Math.round(interval * 1.2));
      next.ease = Math.max(MIN_EASE, review.ease - 0.15);
    } else {
      next.intervalDays = interval === 0 ? 1 : interval === 1 ? 3 : Math.round(interval * review.ease);
      next.ease = Math.min(MAX_EASE, review.ease + 0.1);
    }
    next.ease = Math.round(next.ease * 100) / 100;
    next.lastReviewed = day;
    next.nextDue = addDays(day, next.intervalDays);
    return next;
  }

  const isRasikh = (review) => Boolean(review) && review.intervalDays >= RASIKH_DAYS;

  function sectionsOf(abyat, size) {
    const n = Math.max(1, Number(size) || DEFAULT_SECTION_SIZE);
    const sorted = [...abyat].sort((a, b) => a.order - b.order);
    const sections = [];
    for (let i = 0; i < sorted.length; i += n) sections.push(sorted.slice(i, i + n));
    return sections;
  }

  // يفتح المقاطع: الأول دائمًا، وكل مقطع بعده حين ترسخ أبيات الذي قبله كلها.
  // أبيات المقطع المفتوح بلا سجل مراجعة تُجدول لليوم. قصائد «أريد حفظه» لا تُجدول.
  async function ensureSchedule(day = today()) {
    const [poems, abyat, reviews] = await Promise.all(['poems', 'abyat', 'reviews'].map((s) => db.getAll(s)));
    const reviewOf = new Map(reviews.map((r) => [r.baytId, r]));
    const abyatOf = new Map();
    for (const b of abyat) {
      if (!abyatOf.has(b.poemId)) abyatOf.set(b.poemId, []);
      abyatOf.get(b.poemId).push(b);
    }
    const created = [];
    const unlocked = [];
    for (const poem of poems) {
      if (poem.status !== 'memorized') continue;
      const sections = sectionsOf(abyatOf.get(poem.id) || [], poem.sectionSize);
      for (let i = 0; i < sections.length; i += 1) {
        const missing = sections[i].filter((b) => !reviewOf.has(b.id));
        for (const b of missing) created.push(model.createReview({ baytId: b.id, nextDue: day }));
        if (missing.length && i > 0 && missing.length === sections[i].length) {
          unlocked.push({ poem, section: i + 1 });
        }
        if (!sections[i].every((b) => isRasikh(reviewOf.get(b.id)))) break;
      }
    }
    if (created.length) await db.putMany({ reviews: created });
    return { created: created.length, unlocked };
  }

  // الجلسة: المستحق حتى اليوم من القصائد المحفوظة، الأقدم تأخرًا أولًا.
  // minutes يحدّ عدد الأبيات بتقدير ٢٠ ثانية للبيت، و٠ أو فارغ يعني الكل.
  async function buildSession(day = today(), minutes = 0) {
    const [due, abyat, poems] = await Promise.all([db.dueReviews(day), db.getAll('abyat'), db.getAll('poems')]);
    const baytOf = new Map(abyat.map((b) => [b.id, b]));
    const poemOf = new Map(poems.map((p) => [p.id, p]));
    const items = [];
    for (const review of due) {
      const bayt = baytOf.get(review.baytId);
      const poem = bayt && poemOf.get(bayt.poemId);
      if (!poem || poem.status !== 'memorized') continue;
      items.push({ review, bayt, poem });
    }
    items.sort((a, b) => a.review.nextDue.localeCompare(b.review.nextDue)
      || String(a.poem.addedAt).localeCompare(String(b.poem.addedAt))
      || a.bayt.order - b.bayt.order);
    const limit = minutes > 0 ? Math.max(1, Math.round((minutes * 60) / SECONDS_PER_BAYT)) : items.length;
    return items.slice(0, limit);
  }

  async function saveRating(review, rating, day = today()) {
    const next = rate(review, rating, day);
    await db.put('reviews', next);
    return next;
  }

  hifz.srs = {
    RATINGS, RASIKH_DAYS, SECONDS_PER_BAYT, DEFAULT_SECTION_SIZE,
    today, addDays, rate, isRasikh, sectionsOf, ensureSchedule, buildSession, saveRating,
  };
})(window.hifz = window.hifz || {});
