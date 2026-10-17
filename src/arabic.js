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

  // كلمات الشطر بالترتيب، للإخفاء التدريجي والحروف الأولى (كلمةً كلمة لا حرفًا حرفًا)
  function words(text) {
    return String(text).split(/\s+/).filter(Boolean);
  }

  // أول حرف من الكلمة مع حركاته، وبقيتها: { awwal, baqi }
  function firstLetter(word) {
    const match = String(word).match(/^[^\u064B-\u0652\u0670][\u064B-\u0652\u0670]*/);
    const awwal = match ? match[0] : '';
    return { awwal, baqi: String(word).slice(awwal.length) };
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

  hifz.arabic = { toHindiDigits, fromHindiDigits, stripTashkeel, normalizeForSearch, words, firstLetter };
})(window.hifz = window.hifz || {});
