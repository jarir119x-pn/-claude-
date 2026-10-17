'use strict';

// استيراد قصائد كثيرة من ملف نصي يُجهَّز على الحاسوب. الصيغة:
//
//   # عنوان القصيدة
//   الشاعر: المتنبي
//   البحر: البسيط
//   الأرض: الأندلس          (اختياري: المشرق افتراضيًّا)
//   الحالة: أريد حفظها      (اختياري: أحفظها افتراضيًّا)
//   الْخَيْلُ وَاللَّيْلُ ... * وَالسَّيْفُ ...
//
// كل قصيدة تبدأ بسطر أوله #، ثم حقولها «الاسم: القيمة»، ثم أبياتها بفواصل اللصق نفسها.
(function (hifz) {
  const { fromHindiDigits, toHindiDigits } = hifz.arabic;

  // أسماء الحقول كما يكتبها المستخدم ← اسمها في السجل
  const KEYS = {
    'الشاعر': 'poet', 'البحر': 'bahr', 'القافية': 'qafiya', 'العصر': 'era', 'الغرض': 'gharad',
    'الكتاب': 'book', 'الصفحة': 'page', 'الأرض': 'ard', 'الحالة': 'status', 'المقطع': 'sectionSize',
  };
  const ARD = { 'المشرق': 'mashriq', 'مشرق': 'mashriq', 'الأندلس': 'andalus', 'أندلس': 'andalus', 'الاندلس': 'andalus', 'المغرب': 'andalus', 'مغرب': 'andalus' };
  const STATUS = { 'أحفظها': 'memorized', 'احفظها': 'memorized', 'محفوظة': 'memorized', 'أريد حفظها': 'wishlist', 'اريد حفظها': 'wishlist' };
  const FIELD_LINE = /^\s*([^:：*\t]{2,12}?)\s*[:：]\s*(.*)$/;

  // يقرأ الملف بترميزه: UTF-8، أو UTF-16 (حفظ «Unicode» في المفكرة)، أو Windows-1256 (حفظ «ANSI» العربي)
  function decode(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes[0] === 0xFF && bytes[1] === 0xFE) return new TextDecoder('utf-16le').decode(bytes);
    if (bytes[0] === 0xFE && bytes[1] === 0xFF) return new TextDecoder('utf-16be').decode(bytes);
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (e) {
      return new TextDecoder('windows-1256').decode(bytes);
    }
  }

  function finish(entry) {
    const { abyat, problems } = hifz.parse.parsePoemText(entry.lines.join('\n'));
    const issues = [...entry.issues];
    for (const p of problems) issues.push(`السطر ${toHindiDigits(p.line + entry.firstLine - 1)}: ${p.reason}`);
    if (!entry.fields.poet) issues.push('لا اسم للشاعر: أضف سطر «الشاعر: …».');
    if (!abyat.length) issues.push('لا أبيات.');
    return { title: entry.title, fields: entry.fields, abyat, issues };
  }

  function parseLibraryText(text) {
    const lines = String(text).replace(/^﻿/, '').split(/\r?\n/);
    const poems = [];
    let entry = null;
    lines.forEach((raw, i) => {
      const line = raw.trim();
      if (line.startsWith('#')) {
        if (entry) poems.push(finish(entry));
        entry = { title: line.replace(/^#+\s*/, ''), fields: { ard: 'mashriq', status: 'memorized', source: { book: '', page: '' } }, lines: [], issues: [], firstLine: i + 2 };
        return;
      }
      if (!entry) return; // ما قبل أول قصيدة يُتجاهل
      if (!line && !entry.lines.length) {
        entry.firstLine = i + 2; // الأسطر الفارغة قبل الأبيات لا تُعدّ
        return;
      }
      const field = !entry.lines.some((l) => l.trim()) && line.match(FIELD_LINE);
      if (field && KEYS[field[1].trim()]) {
        const key = KEYS[field[1].trim()];
        const value = field[2].trim();
        if (key === 'ard') {
          if (ARD[value]) entry.fields.ard = ARD[value];
          else entry.issues.push(`الأرض «${value}» غير معروفة: اكتب المشرق أو الأندلس.`);
        } else if (key === 'status') {
          if (STATUS[value]) entry.fields.status = STATUS[value];
          else entry.issues.push(`الحالة «${value}» غير معروفة: اكتب أحفظها أو أريد حفظها.`);
        } else if (key === 'sectionSize') {
          const n = Number(fromHindiDigits(value));
          if (Number.isInteger(n) && n > 0) entry.fields.sectionSize = n;
          else entry.issues.push(`طول المقطع «${value}» ليس عددًا صحيحًا.`);
        } else if (key === 'book' || key === 'page') {
          entry.fields.source[key] = value;
        } else {
          entry.fields[key] = value;
        }
        entry.firstLine = i + 2;
        return;
      }
      entry.lines.push(raw);
    });
    if (entry) poems.push(finish(entry));
    return poems;
  }

  // يحفظ القصائد السليمة وحدها، ويُرجع عددها وعدد أبياتها
  async function importPoems(parsed) {
    let poems = 0;
    let abyat = 0;
    for (const p of parsed.filter((x) => !x.issues.length)) {
      await hifz.poems.savePoem({ ...p.fields, title: p.title }, p.abyat);
      poems += 1;
      abyat += p.abyat.length;
    }
    return { poems, abyat };
  }

  hifz.textImport = { decode, parseLibraryText, importPoems };
})(window.hifz = window.hifz || {});
