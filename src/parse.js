'use strict';

// تقسيم القصيدة الملصوقة إلى أبيات وأشطر.
// كل سطر بيت، والشطران يفصل بينهما: علامة جدولة، أو * ، أو ... (أو …)، أو ثلاث مسافات فأكثر.
// وفي وضع «كل شطر في سطر» يُقرن كل سطرين متتاليين بيتًا.
(function (hifz) {
  // بالترتيب: الأوضح أولًا. المسافة غير المنقسمة (U+00A0) تُعدّ مسافة.
  const SEPARATORS = [
    /\t+/,
    /\s*\*+\s*/,
    /\s*(?:\.{3,}|…+)\s*/,
    /[  ]{3,}/,
  ];
  // ترقيم في أول السطر: «١- » أو «12. » أو «(٣) »
  const LINE_NUMBER = /^\s*\(?[0-9٠-٩]+\)?\s*[-.:)،]?\s+/;

  function cleanLine(line) {
    return line.replace(LINE_NUMBER, '').replace(/\s+$/, '').replace(/^\s+/, '');
  }

  const tidy = (shatr) => shatr.replace(/[  ]+/g, ' ').trim();

  function splitLine(line) {
    for (const separator of SEPARATORS) {
      const parts = line.split(separator).map(tidy).filter(Boolean);
      if (parts.length === 2) return { sadr: parts[0], ajuz: parts[1] };
      if (parts.length > 2) return { problem: 'في السطر أكثر من فاصل واحد.' };
    }
    return { problem: 'لم أجد فاصلًا بين الشطرين. افصل بينهما بـ * مثلًا.' };
  }

  // يُرجع الأبيات السليمة، ومشكلات بأرقام أسطرها في النص الأصلي
  function parsePoemText(text, { shatrPerLine = false } = {}) {
    const lines = String(text).split(/\r?\n/)
      .map((raw, i) => ({ number: i + 1, text: cleanLine(raw) }))
      .filter((line) => line.text);
    const abyat = [];
    const problems = [];

    if (shatrPerLine) {
      for (let i = 0; i < lines.length; i += 2) {
        const sadr = lines[i];
        const ajuz = lines[i + 1];
        if (!ajuz) {
          problems.push({ line: sadr.number, text: sadr.text, reason: 'شطر بلا شطر ثانٍ في آخر القصيدة.' });
          break;
        }
        abyat.push({ sadr: tidy(sadr.text), ajuz: tidy(ajuz.text), line: sadr.number });
      }
      return { abyat, problems };
    }

    for (const line of lines) {
      const result = splitLine(line.text);
      if (result.problem) problems.push({ line: line.number, text: line.text, reason: result.problem });
      else abyat.push({ sadr: result.sadr, ajuz: result.ajuz, line: line.number });
    }
    return { abyat, problems };
  }

  // يحوّل الأبيات إلى نص يُعرض في الحقل للتعديل، بفاصل * بين الشطرين
  function abyatToText(abyat) {
    return abyat.map((b) => `${b.sadr} * ${b.ajuz}`).join('\n');
  }

  hifz.parse = { parsePoemText, abyatToText };
})(window.hifz = window.hifz || {});
