'use strict';

// السجلات الثلاثة بحقولها كاملة من البداية، حتى لا يتغير شكل ملف التصدير.
// الحقول التي لا تستعملها النسخة الأولى تبقى موجودة وفارغة.
(function (hifz) {
  const ARD = ['mashriq', 'andalus'];
  const STATUS = ['memorized', 'wishlist'];

  function newId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  const nowIso = () => new Date().toISOString();

  function createPoem(fields = {}) {
    const poem = {
      id: newId(),
      title: '',
      poet: '',
      era: '',
      ard: 'mashriq',
      bahr: '',
      qafiya: '',
      gharad: '',
      source: { book: '', page: '' },
      occasion: '',
      status: 'memorized',
      notes: '',
      addedAt: nowIso(),
      ...fields,
    };
    if (!ARD.includes(poem.ard)) throw new Error(`الأرض غير معروفة: ${poem.ard}`);
    if (!STATUS.includes(poem.status)) throw new Error(`الحالة غير معروفة: ${poem.status}`);
    return poem;
  }

  function createBayt(fields = {}) {
    return {
      id: newId(),
      poemId: '',
      order: 0,
      sadr: '',
      ajuz: '',
      vocabulary: '',
      irab: '',
      notes: '',
      troubleWords: [],
      relatedIds: [],
      ...fields,
    };
  }

  // سجل المراجعة مفتاحه معرّف البيت: لكل بيت سجل واحد
  function createReview(fields = {}) {
    return {
      baytId: '',
      lastReviewed: null,
      nextDue: null,
      intervalDays: 0,
      ease: 2.5,
      lapses: 0,
      ...fields,
    };
  }

  hifz.model = { ARD, STATUS, newId, createPoem, createBayt, createReview };
})(window.hifz = window.hifz || {});
