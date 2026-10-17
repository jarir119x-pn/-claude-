'use strict';

// أدوات النص العربي: الأرقام الهندية، وإخفاء التشكيل للعرض، وتطبيع البحث.
(function (hifz) {
  const HINDI_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const HARAKAT = /[ً-ْٰ]/g;
  const TATWEEL = /ـ/g;

  // ١٢٣ من النطاق U+0660–U+0669
  function toHindiDigits(value) {
    return String(value).replace(/\d/g, (d) => HINDI_DIGITS[d]);
  }

  // ما يكتبه المستخدم بالأرقام الهندية يُقرأ رقمًا
  function fromHindiDigits(value) {
    return String(value).replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  }

  // للعرض فقط: البيانات تبقى بتشكيلها
  function stripTashkeel(text) {
    return String(text).replace(HARAKAT, '');
  }

  // البحث يتجاهل التشكيل والتطويل والهمزات، فيُطابق «الخيل» «الخَيْلُ» و«أنباء» «انباء»
  function normalizeForSearch(text) {
    return stripTashkeel(text)
      .replace(TATWEEL, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي')
      .replace(/ء/g, '')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ')
      .trim();
  }

  hifz.arabic = { toHindiDigits, fromHindiDigits, stripTashkeel, normalizeForSearch };
})(window.hifz = window.hifz || {});
