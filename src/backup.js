'use strict';

// النسخ الاحتياطي: ملف JSON واحد يحمل كل البيانات، برقم إصدار للصيغة.
(function (hifz) {
  const FORMAT = 'hifz-alshir';
  const FORMAT_VERSION = 1;

  async function exportData() {
    const [poems, abyat, reviews] = await Promise.all(hifz.db.STORES.map((s) => hifz.db.getAll(s)));
    return {
      format: FORMAT,
      version: FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      poems,
      abyat,
      reviews,
    };
  }

  function fileName(date = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `hafiz-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
  }

  async function downloadExport() {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return data;
  }

  // يتحقق من الملف قبل أن يُكتب منه شيء، ويرمي خطأً مفهومًا للمستخدم
  function validate(data) {
    if (!data || data.format !== FORMAT) throw new Error('هذا ليس ملف نسخة احتياطية من حافظ.');
    if (typeof data.version !== 'number' || data.version > FORMAT_VERSION) {
      throw new Error('الملف من إصدار أحدث من التطبيق. حدّث التطبيق ثم أعد الاستيراد.');
    }
    for (const store of hifz.db.STORES) {
      if (!Array.isArray(data[store])) throw new Error(`الملف ناقص: لا يحوي «${store}».`);
    }
    for (const poem of data.poems) {
      if (!poem.id) throw new Error('في الملف قصيدة بلا معرّف.');
      if (!hifz.model.ARD.includes(poem.ard)) throw new Error(`قصيدة «${poem.title}» أرضها غير معروفة.`);
    }
    for (const bayt of data.abyat) if (!bayt.id || !bayt.poemId) throw new Error('في الملف بيت بلا معرّف أو بلا قصيدة.');
    for (const review of data.reviews) if (!review.baytId) throw new Error('في الملف مراجعة بلا بيت.');
    return data;
  }

  // ترقية ملفات الإصدارات القديمة تُضاف هنا حين تتغير الصيغة
  function migrate(data) {
    return data;
  }

  // الاستيراد يدمج بالمعرّف: يضيف الجديد ويحدّث الموجود، ولا يحذف شيئًا
  async function importData(data) {
    const valid = migrate(validate(data));
    const fill = { poems: hifz.model.createPoem, abyat: hifz.model.createBayt, reviews: hifz.model.createReview };
    const records = {};
    for (const store of hifz.db.STORES) {
      // يكمل الحقول الناقصة بقيمها الافتراضية مع الإبقاء على المعرّف الأصلي
      records[store] = valid[store].map((r) => fill[store](r));
    }
    await hifz.db.putMany(records);
    return { poems: records.poems.length, abyat: records.abyat.length, reviews: records.reviews.length };
  }

  async function importFile(file) {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch (e) {
      throw new Error('تعذّرت قراءة الملف: ليس ملف JSON سليمًا.');
    }
    return importData(data);
  }

  hifz.backup = { FORMAT, FORMAT_VERSION, exportData, downloadExport, validate, importData, importFile, fileName };
})(window.hifz = window.hifz || {});
