'use strict';

// شاشة إضافة القصيدة وتعديلها: الحقول، ومعاينة التقسيم قبل الحفظ، والحذف بتأكيد.
(function (hifz) {
  const { toHindiDigits } = hifz.arabic;
  const $ = (id) => document.getElementById(id);
  const FIELDS = ['poet', 'title', 'era', 'bahr', 'qafiya', 'gharad'];

  let editingId = null;
  let parsed = { abyat: [], problems: [] };
  let previewTimer = 0;
  let deleteTimer = 0;

  const radioValue = (name) => document.querySelector(`input[name="${name}"]:checked`).value;
  const setRadio = (name, value) => { document.querySelector(`input[name="${name}"][value="${value}"]`).checked = true; };

  function readFields() {
    const fields = {};
    for (const name of FIELDS) fields[name] = $(`f-${name}`).value.trim();
    fields.ard = radioValue('ard');
    fields.status = radioValue('status');
    fields.source = { book: $('f-book').value.trim(), page: $('f-page').value.trim() };
    fields.sectionSize = Number(hifz.arabic.fromHindiDigits($('f-section').value.trim()));
    return fields;
  }

  function fillFields(poem) {
    for (const name of FIELDS) $(`f-${name}`).value = poem ? poem[name] || '' : '';
    setRadio('ard', poem ? poem.ard : 'mashriq');
    setRadio('status', poem ? poem.status : 'memorized');
    $('f-book').value = poem ? poem.source.book : '';
    $('f-page').value = poem ? poem.source.page : '';
    $('f-section').value = toHindiDigits((poem && poem.sectionSize) || 4);
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // المعاينة بثوب الأرض المختارة، كما ستظهر في البطاقة
  function renderPreview() {
    parsed = hifz.parse.parsePoemText($('f-abyat').value, { shatrPerLine: $('f-shatr-per-line').checked });
    const andalus = radioValue('ard') === 'andalus';
    const preview = $('preview');
    preview.classList.toggle('zh-lawh--abbasi', !andalus);
    preview.classList.toggle('preview--andalus', andalus);

    const problems = $('problems');
    problems.replaceChildren(...parsed.problems.map((p) => {
      const li = el('li', 'problems__item');
      li.append(el('strong', '', `السطر ${toHindiDigits(p.line)}: `), p.reason, el('span', 'problems__text', p.text));
      return li;
    }));

    const list = $('preview-abyat');
    list.replaceChildren(...parsed.abyat.map((b) => {
      const li = el('li');
      const bayt = el('div', 'zh-bayt');
      bayt.append(el('span', 'zh-bayt__shatr', b.sadr), el('span', 'zh-bayt__sep'), el('span', 'zh-bayt__shatr', b.ajuz));
      li.append(bayt);
      return li;
    }));

    const n = parsed.abyat.length;
    $('preview-count').textContent = !n && !parsed.problems.length
      ? 'اكتب الأبيات أو الصقها لترى تقسيمها هنا قبل الحفظ.'
      : `الأبيات المقسّمة: ${toHindiDigits(n)}${parsed.problems.length ? `، وأسطر تحتاج تصحيحًا: ${toHindiDigits(parsed.problems.length)}` : ''}`;
  }

  function schedulePreview() {
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 150);
  }

  function setStatus(text, isError = false) {
    $('edit-status').textContent = text;
    $('edit-status').classList.toggle('is-error', isError);
  }

  function disarmDelete() {
    clearTimeout(deleteTimer);
    deleteTimer = 0;
    $('delete-btn').textContent = 'احذف القصيدة';
  }

  // يفتح الشاشة لقصيدة جديدة (id فارغ) أو لتعديل قصيدة موجودة
  async function open(id = null) {
    editingId = id;
    setStatus('');
    disarmDelete();
    $('f-shatr-per-line').checked = false;
    $('delete-btn').hidden = !id;
    $('edit-title').textContent = id ? 'تعديل القصيدة' : 'قصيدة جديدة';
    if (!id) {
      fillFields(null);
      $('f-abyat').value = '';
      renderPreview();
      return;
    }
    const poem = await hifz.db.get('poems', id);
    if (!poem) {
      setStatus('لم أجد القصيدة. لعلها حُذفت.', true);
      return;
    }
    fillFields(poem);
    $('f-abyat').value = hifz.parse.abyatToText(await hifz.db.abyatOfPoem(id));
    renderPreview();
  }

  $('poem-form').addEventListener('input', (event) => {
    if (event.target.id === 'f-abyat') schedulePreview();
    else renderPreview();
  });

  $('poem-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    renderPreview();
    const fields = readFields();
    if (!fields.poet) {
      setStatus('اكتب اسم الشاعر.', true);
      $('f-poet').focus();
      return;
    }
    if (!Number.isInteger(fields.sectionSize) || fields.sectionSize < 1) {
      setStatus('طول المقطع عدد صحيح من ١ فأكثر.', true);
      $('f-section').focus();
      return;
    }
    if (parsed.problems.length) {
      setStatus('صحّح الأسطر المشار إليها في المعاينة قبل الحفظ.', true);
      $('f-abyat').focus();
      return;
    }
    if (!parsed.abyat.length) {
      setStatus('اكتب بيتًا واحدًا على الأقل.', true);
      $('f-abyat').focus();
      return;
    }
    try {
      const { poem, abyat } = await hifz.poems.savePoem(fields, parsed.abyat, editingId);
      hifz.flash = `حُفظت «${poem.title}»، والأبيات: ${toHindiDigits(abyat.length)}.`;
      location.hash = '#poems';
    } catch (e) {
      setStatus(`تعذّر الحفظ: ${e.message}`, true);
    }
  });

  // الحذف بلمستين: الأولى تطلب التأكيد، والثانية خلال خمس ثوانٍ تحذف
  $('delete-btn').addEventListener('click', async () => {
    if (!deleteTimer) {
      $('delete-btn').textContent = 'المس مرة أخرى للحذف: تُحذف القصيدة وأبياتها ومراجعاتها';
      deleteTimer = setTimeout(disarmDelete, 5000);
      return;
    }
    disarmDelete();
    try {
      await hifz.poems.deletePoem(editingId);
      hifz.flash = 'حُذفت القصيدة.';
      location.hash = '#poems';
    } catch (e) {
      setStatus(`تعذّر الحذف: ${e.message}`, true);
    }
  });

  hifz.entry = { open };
})(window.hifz = window.hifz || {});
