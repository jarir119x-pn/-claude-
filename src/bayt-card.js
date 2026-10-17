'use strict';

// نموذج بطاقة البيت: عرض فقط، لا تخزين ولا خوارزمية مراجعة.
(function () {
  const ABYAT = [
    { poet: 'المتنبي', bahr: 'البسيط', title: 'واحرّ قلباه', ard: 'mashriq',
      sadr: 'الْخَيْلُ وَاللَّيْلُ وَالْبَيْداءُ تَعْرِفُنِي',
      ajuz: 'وَالسَّيْفُ وَالرُّمْحُ وَالْقِرْطاسُ وَالْقَلَمُ' },
    { poet: 'ابن زيدون', bahr: 'البسيط', title: 'النونية', ard: 'andalus',
      sadr: 'أَضْحَى التَّنائِي بَدِيلًا مِنْ تَدانِينا',
      ajuz: 'وَنابَ عَنْ طِيبِ لُقْيانا تَجافِينا' },
    { poet: 'امرؤ القيس', bahr: 'الطويل', title: 'قفا نبك', ard: 'mashriq',
      sadr: 'مِكَرٍّ مِفَرٍّ مُقْبِلٍ مُدْبِرٍ مَعًا',
      ajuz: 'كَجُلْمُودِ صَخْرٍ حَطَّهُ السَّيْلُ مِنْ عَلِ' },
    { poet: 'ابن خفاجة', bahr: 'البسيط', title: 'يا أهل أندلس', ard: 'andalus',
      sadr: 'يا أَهْلَ أَنْدَلُسٍ لِلَّهِ دَرُّكُمُ',
      ajuz: 'ماءٌ وَظِلٌّ وَأَنْهارٌ وَأَشْجارُ' },
    { poet: 'المتنبي', bahr: 'الطويل', title: 'على قدر أهل العزم', ard: 'mashriq',
      sadr: 'وَتَعْظُمُ فِي عَيْنِ الصَّغِيرِ صِغارُها',
      ajuz: 'وَتَصْغُرُ فِي عَيْنِ الْعَظِيمِ الْعَظائِمُ' },
    { poet: 'أبو البقاء الرندي', bahr: 'البسيط', title: 'رثاء الأندلس', ard: 'andalus',
      sadr: 'لِكُلِّ شَيْءٍ إِذا ما تَمَّ نُقْصانُ',
      ajuz: 'فَلا يُغَرَّ بِطِيبِ الْعَيْشِ إِنْسانُ' },
    { poet: 'أبو تمام', bahr: 'البسيط', title: 'فتح عمّورية', ard: 'mashriq',
      sadr: 'السَّيْفُ أَصْدَقُ أَنْباءً مِنَ الْكُتُبِ',
      ajuz: 'فِي حَدِّهِ الْحَدُّ بَيْنَ الْجِدِّ وَاللَّعِبِ' },
    { poet: 'زهير بن أبي سلمى', bahr: 'الطويل', title: 'أمن أمّ أوفى', ard: 'mashriq',
      sadr: 'وَمَهْما تَكُنْ عِنْدَ امْرِئٍ مِنْ خَلِيقَةٍ',
      ajuz: 'وَإِنْ خالَها تَخْفَى عَلَى النّاسِ تُعْلَمِ' },
    { poet: 'زهير بن أبي سلمى', bahr: 'الطويل', title: 'أمن أمّ أوفى', ard: 'mashriq',
      sadr: 'وَمَنْ لَمْ يُصانِعْ فِي أُمُورٍ كَثِيرَةٍ',
      ajuz: 'يُضَرَّسْ بِأَنْيابٍ وَيُوطَأْ بِمَنْسِمِ' },
  ];

  const SIZES = [18, 19, 20, 24];
  const RABAT_SIZE = 24;
  const LINE_RATIO = 1.85;
  const HARAKAT = /[ً-ْٰ]/g;
  const THEMES = [
    { value: null, label: 'تلقائي' },
    { value: 'light', label: 'نهار' },
    { value: 'dark', label: 'ليل' },
  ];
  const THEME_KEY = 'hifz.theme';

  const state = { index: 0, tashkeel: true, size: 19, themeIndex: 0 };
  const $ = (id) => document.getElementById(id);
  const els = {
    page: $('page'), card: $('card'), poet: $('card-poet'), bahr: $('card-bahr'),
    count: $('card-count'), title: $('card-title'),
    rabatSadr: $('rabat-sadr'), rabatAjuz: $('rabat-ajuz'),
    sadr: $('sadr'), ajuz: $('ajuz'), slot: $('ajuz-slot'), reveal: $('reveal'), rate: $('rate'),
    status: $('status'), tashkeel: $('tashkeel-toggle'), theme: $('theme-toggle'),
    sizes: $('size-picker'), compact: $('compact-toggle'), widthNote: $('width-note'),
    table: $('fit-table'),
  };

  const toArabicDigits = (value) => String(value).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const display = (text) => (state.tashkeel ? text : text.replace(HARAKAT, ''));

  function render() {
    const bayt = ABYAT[state.index];
    // الثوب من أرض القصيدة وحدها، لا من العصر ولا من الوضع الليلي
    const andalus = bayt.ard === 'andalus';
    els.card.classList.toggle('zh-lawh--abbasi', !andalus);
    els.card.classList.toggle('card--andalus', andalus);
    els.poet.textContent = bayt.poet;
    els.bahr.textContent = bayt.bahr;
    els.count.textContent = `${toArabicDigits(state.index + 1)} من ${toArabicDigits(ABYAT.length)}`;
    els.title.textContent = bayt.title;
    els.sadr.textContent = display(bayt.sadr);
    els.ajuz.textContent = display(bayt.ajuz);
    els.rabatSadr.textContent = display(bayt.sadr);
    els.rabatAjuz.textContent = display(bayt.ajuz);
  }

  function setRevealed(revealed) {
    els.slot.classList.toggle('is-shown', revealed);
    els.reveal.hidden = revealed;
    els.rate.hidden = !revealed;
  }

  function go(step) {
    state.index = (state.index + step + ABYAT.length) % ABYAT.length;
    setRevealed(false);
    render();
    measure();
  }

  function applySize() {
    els.page.style.setProperty('--bayt-size', `${state.size}px`);
    els.page.style.setProperty('--bayt-lh', `${Math.round(state.size * LINE_RATIO)}px`);
    for (const btn of els.sizes.querySelectorAll('[data-size]')) {
      btn.setAttribute('aria-pressed', String(Number(btn.dataset.size) === state.size));
    }
  }

  function applyTheme() {
    const theme = THEMES[state.themeIndex];
    if (theme.value) document.documentElement.dataset.theme = theme.value;
    else delete document.documentElement.dataset.theme;
    els.theme.textContent = `المظهر: ${theme.label}`;
  }

  // يقيس عرض كل شطر في سطر واحد بكل حجم، ويقارنه بالعرض المتاح في البطاقة
  const ruler = document.createElement('span');
  ruler.className = 'measure';
  ruler.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ruler);

  function naturalWidth(text, size, font) {
    ruler.style.fontFamily = font;
    ruler.style.fontSize = `${size}px`;
    ruler.textContent = text;
    return ruler.getBoundingClientRect().width;
  }

  function measure() {
    const available = els.sadr.getBoundingClientRect().width;
    els.page.style.setProperty('--shatr-w', `${available}px`);
    els.widthNote.textContent = `العرض المتاح للشطر الآن: ${toArabicDigits(Math.floor(available))} بكسل، وعرض الشاشة ${toArabicDigits(window.innerWidth)} بكسل.`;

    const sizes = SIZES.includes(state.size) ? SIZES : SIZES.concat(state.size);
    const columns = sizes.map((s) => ({ size: s, font: 'var(--font-matn)', label: toArabicDigits(s), current: s === state.size }))
      .concat({ size: RABAT_SIZE, font: 'var(--font-maghribi)', label: `Rabat ${toArabicDigits(RABAT_SIZE)}`, current: false });

    const head = '<tr><th scope="col">البيت</th>' +
      columns.map((c) => `<th scope="col"${c.current ? ' class="is-current"' : ''}>${c.label}</th>`).join('') + '</tr>';
    const rows = ABYAT.map((bayt, i) => {
      const cells = columns.map((c) => {
        const widest = Math.max(naturalWidth(display(bayt.sadr), c.size, c.font), naturalWidth(display(bayt.ajuz), c.size, c.font));
        const spare = Math.floor(available - widest);
        const fits = spare >= 0;
        const classes = [fits ? 'is-fit' : 'is-broken', c.current ? 'is-current' : ''].join(' ').trim();
        const mark = fits ? '✓' : '✗';
        const number = spare < 0 ? `−${toArabicDigits(-spare)}` : toArabicDigits(spare);
        return `<td class="${classes}">${mark} ${number}</td>`;
      }).join('');
      const ard = bayt.ard === 'andalus' ? 'أندلس' : 'مشرق';
      const label = `${toArabicDigits(i + 1)}. ${bayt.poet.split(' بن ')[0]}، ${ard}`;
      return `<tr${i === state.index ? ' aria-current="true"' : ''}><th scope="row">${label}</th>${cells}</tr>`;
    }).join('');
    els.table.tHead.innerHTML = head;
    els.table.tBodies[0].innerHTML = rows;
  }

  els.reveal.addEventListener('click', () => {
    setRevealed(true);
    els.rate.querySelector('button').focus({ preventScroll: true });
  });

  els.rate.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-rating]');
    if (!btn) return;
    els.status.textContent = `قيّمت البيت ${toArabicDigits(state.index + 1)}: ${btn.dataset.rating}. التقييم هنا للشكل فقط، ولا يُحفظ.`;
    go(1);
    els.reveal.focus({ preventScroll: true });
  });

  $('prev').addEventListener('click', () => go(-1));
  $('next').addEventListener('click', () => go(1));

  els.tashkeel.addEventListener('click', () => {
    state.tashkeel = !state.tashkeel;
    els.tashkeel.setAttribute('aria-pressed', String(state.tashkeel));
    els.tashkeel.textContent = state.tashkeel ? 'التشكيل ظاهر' : 'التشكيل مخفي';
    render();
    measure();
  });

  els.theme.addEventListener('click', () => {
    state.themeIndex = (state.themeIndex + 1) % THEMES.length;
    applyTheme();
    try { localStorage.setItem(THEME_KEY, String(state.themeIndex)); } catch (e) { /* التخزين غير متاح */ }
  });

  els.sizes.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-size]');
    if (!btn) return;
    state.size = Number(btn.dataset.size);
    applySize();
    measure();
  });

  els.compact.addEventListener('change', () => {
    els.page.classList.toggle('is-compact', els.compact.checked);
    measure();
  });

  window.addEventListener('resize', measure);

  try {
    const saved = Number(localStorage.getItem(THEME_KEY));
    if (saved > 0 && saved < THEMES.length) state.themeIndex = saved;
  } catch (e) { /* التخزين غير متاح */ }

  applyTheme();
  applySize();
  render();
  setRevealed(false);
  measure();
  // Rabat لا يُحمَّل حتى يُطلب، فنطلبه صراحةً قبل القياس
  if (document.fonts) {
    Promise.all([document.fonts.load('24px Rabat'), document.fonts.load('20px Kufam')]).then(measure, measure);
  }
})();
