import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../theme';
import {BarRow} from '../components/BarRow';
import {Counter, Kicker, Reveal, Scene, SourceTag, WordReveal, clamp, useSpring} from '../components/ui';

export const COMPARE_INTRO_DURATION = 170;
export const EIGHTIES_DURATION = 420;
export const NEXT_ERA_DURATION = 110;
export const FRANCE_DURATION = 300;
export const BRAZIL_DURATION = 300;
export const ISRAEL_DURATION = 360;

export const CompareIntro: React.FC = () => (
  <Scene>
    <Reveal delay={0}>
      <div style={{fontFamily: fonts.kufi, fontWeight: 700, fontSize: 130, color: colors.goldBright}}>
        باب المقارنة
      </div>
    </Reveal>
    <WordReveal
      delay={22}
      stagger={3}
      text="لكي يكون القارئ على بيّنة وفهم، لأن التطبيق العملي يكشف له عِظَم هذه المصيبة"
      highlight={['المصيبة']}
      highlightColor={colors.red}
      style={{fontFamily: fonts.naskh, fontSize: 56, lineHeight: 1.7, marginTop: 30, maxWidth: 1400}}
    />
  </Scene>
);

// دائرة سكانية: المساحة تتناسب مع عدد السكان
const PopCircle: React.FC<{
  pop: number;
  maxPop: number;
  maxSize: number;
  label: string;
  color: string;
  delay: number;
}> = ({pop, maxPop, maxSize, label, color, delay}) => {
  const p = useSpring(delay, 14);
  const size = maxSize * Math.sqrt(pop / maxPop);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
      <div style={{height: maxSize, display: 'flex', alignItems: 'flex-end'}}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            transform: `scale(${p})`,
            transformOrigin: 'bottom center',
            background: `radial-gradient(circle at 35% 30%, ${color}, ${color}55)`,
            boxShadow: `0 0 50px ${color}44`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: Math.max(size / 4.2, 34),
            lineHeight: 1,
            color: colors.ink,
          }}
        >
          {pop}
          <span style={{fontSize: Math.max(size / 11, 18), fontWeight: 700, marginTop: 6}}>مليون</span>
        </div>
      </div>
      <div style={{fontFamily: fonts.kufi, fontSize: 40, opacity: p}}>{label}</div>
    </div>
  );
};

export const Eighties: React.FC = () => {
  const frame = useCurrentFrame();
  const phaseA = interpolate(frame, [205, 225], [1, 0], clamp);
  const phaseB = interpolate(frame, [215, 240], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Scene style={{opacity: phaseA, justifyContent: 'flex-start', paddingTop: 110}}>
        <Kicker>الثمانينات</Kicker>
        <Reveal delay={6}>
          <div style={{fontFamily: fonts.naskh, fontSize: 50, marginTop: 18, color: colors.ivoryDim}}>
            عدد الكتب المترجمة لكل مليون نسمة
          </div>
        </Reveal>
        <div style={{display: 'flex', flexDirection: 'column', gap: 54, width: '100%', marginTop: 70}}>
          <BarRow label="إسبانيا" sub="39 مليون نسمة" value={920} max={920} delay={20} color={colors.teal} />
          <BarRow label="المجر" sub="10 ملايين نسمة" value={519} max={920} delay={40} color={colors.slate} />
          <BarRow
            label="العالم العربي"
            sub="250 مليون نسمة"
            value={4.4}
            decimals={1}
            max={920}
            delay={80}
            color={colors.red}
            emphasize
          />
        </div>
        <SourceTag delay={60}>المصدر: تقرير التنمية الإنسانية العربية (UNDP)</SourceTag>
      </Scene>

      <Scene style={{opacity: phaseB}}>
        {frame > 210 ? (
          <>
            <div style={{display: 'flex', alignItems: 'flex-end', gap: 160}}>
              <PopCircle pop={39} maxPop={250} maxSize={340} label="إسبانيا" color={colors.teal} delay={225} />
              <PopCircle pop={250} maxPop={250} maxSize={340} label="الوطن العربي" color={colors.red} delay={235} />
            </div>
            <WordReveal
              delay={265}
              stagger={2}
              text="أي أن دولة واحدة بسكان أقل بست مرات كانت تنتج ستة أضعاف إنتاج الوطن العربي الذي تعداده 250 مليون نسمة"
              highlight={['ست', 'ستة', 'أضعاف']}
              style={{fontFamily: fonts.naskh, fontSize: 54, lineHeight: 1.7, marginTop: 60, maxWidth: 1500}}
            />
          </>
        ) : null}
      </Scene>
    </AbsoluteFill>
  );
};

export const NextEra: React.FC = () => (
  <Scene>
    <Reveal delay={0}>
      <div style={{fontFamily: fonts.naskh, fontSize: 56, color: colors.ivoryDim}}>انتهينا من الثمانينات…</div>
    </Reveal>
    <Reveal delay={30}>
      <div style={{fontFamily: fonts.kufi, fontSize: 84, marginTop: 24}}>
        فلنأتِ إلى إحصائيات <span style={{color: colors.goldBright}}>السنين التي بعدها</span>
      </div>
    </Reveal>
  </Scene>
);

export const FranceScene: React.FC = () => {
  const mult = useSpring(150, 12);
  return (
    <Scene style={{justifyContent: 'flex-start', paddingTop: 110}}>
      <Kicker>الوطن العربي × فرنسا</Kicker>
      <Reveal delay={6}>
        <div style={{fontFamily: fonts.naskh, fontSize: 50, marginTop: 18, color: colors.ivoryDim}}>
          عدد الكتب المترجمة في السنة
        </div>
      </Reveal>
      <div style={{display: 'flex', flexDirection: 'column', gap: 70, width: '100%', marginTop: 80}}>
        <BarRow
          label="الوطن العربي"
          sub="~400 مليون نسمة"
          value={3000}
          rangeFrom={300}
          valuePrefix="~"
          max={19000}
          delay={20}
          color={colors.red}
          height={80}
        />
        <BarRow
          label="فرنسا وحدها"
          sub="~68 مليون نسمة"
          value={19000}
          valuePrefix="~"
          max={19000}
          delay={55}
          color={colors.teal}
          height={80}
        />
      </div>
      <Reveal delay={100}>
        <div style={{fontFamily: fonts.sans, fontSize: 26, color: colors.ivoryDim, marginTop: 34}}>
          الجزء المخطط = «بضع مئات إلى ~3,000 كتاب»
        </div>
      </Reveal>
      <div
        style={{
          marginTop: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 30,
          opacity: mult,
          transform: `scale(${0.8 + mult * 0.2})`,
        }}
      >
        <div style={{fontFamily: fonts.naskh, fontSize: 52}}>
          بسكان أقل بنحو <span style={{color: colors.goldBright}}>6 مرات</span>، تُترجم فرنسا عدة أضعاف
        </div>
        <div
          style={{
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 72,
            color: colors.ink,
            background: colors.goldBright,
            borderRadius: 18,
            padding: '0 28px',
            direction: 'ltr',
          }}
        >
          ×<Counter to={19000 / 3000} decimals={1} delay={155} duration={30} />
        </div>
      </div>
    </Scene>
  );
};

export const BrazilScene: React.FC = () => {
  return (
    <Scene>
      <Kicker>الوطن العربي × البرازيل</Kicker>
      <WordReveal
        delay={8}
        stagger={2}
        text="إنتاج العالم العربي من الترجمة يعادل عُشر إنتاج البرازيل فقط"
        highlight={['عُشر']}
        style={{fontFamily: fonts.naskh, fontSize: 58, marginTop: 30}}
      />
      <div style={{display: 'flex', gap: 140, marginTop: 60, alignItems: 'flex-start'}}>
        <Reveal delay={40}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: fonts.kufi, fontSize: 44, color: colors.ivoryDim}}>العالم العربي</div>
            <div style={{fontFamily: fonts.sans, fontWeight: 900, fontSize: 200, color: colors.red, lineHeight: 1.1}}>
              <Counter to={26} delay={50} duration={40} />
            </div>
            <div style={{fontFamily: fonts.sans, fontSize: 32}}>عنوانًا</div>
          </div>
        </Reveal>
        <Reveal delay={55}>
          <div style={{fontFamily: fonts.kufi, fontSize: 60, color: colors.gold, marginTop: 130}}>مقابل</div>
        </Reveal>
        <Reveal delay={65}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontFamily: fonts.kufi, fontSize: 44, color: colors.ivoryDim}}>البرازيل</div>
            <div style={{fontFamily: fonts.sans, fontWeight: 900, fontSize: 200, color: colors.teal, lineHeight: 1.1}}>
              <Counter to={2291} delay={75} duration={60} />
            </div>
            <div style={{fontFamily: fonts.sans, fontSize: 32}}>عنوانًا</div>
          </div>
        </Reveal>
      </div>
      <Reveal delay={120}>
        <div style={{fontFamily: fonts.sans, fontSize: 26, color: colors.ivoryDim, marginTop: 20}}>
          في إحدى السنوات المرصودة
        </div>
      </Reveal>
      <Reveal delay={150}>
        <div
          style={{
            fontFamily: fonts.naskh,
            fontSize: 52,
            marginTop: 46,
            padding: '14px 46px',
            borderRight: `6px solid ${colors.gold}`,
            background: 'rgba(217,168,78,0.08)',
            borderRadius: 8,
          }}
        >
          رغم أن تعداد البرازيل يقارب <span style={{color: colors.goldBright}}>نصف</span> تعداد السكان العرب
        </div>
      </Reveal>
    </Scene>
  );
};

// شبكة 50 شخصًا: واحد منهم فقط يمثل سكان إسرائيل
const Person: React.FC<{color: string; glow?: boolean}> = ({color, glow}) => (
  <svg width="40" height="56" viewBox="0 0 40 56" style={{filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined}}>
    <circle cx="20" cy="11" r="9" fill={color} />
    <path d="M4 54 C4 30 12 24 20 24 C28 24 36 30 36 54 Z" fill={color} />
  </svg>
);

export const IsraelScene: React.FC = () => {
  const frame = useCurrentFrame();
  const phaseA = interpolate(frame, [160, 180], [1, 0], clamp);
  const phaseB = interpolate(frame, [172, 195], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Scene style={{opacity: phaseA}}>
        <Kicker>الوطن العربي × إسرائيل — أو «الكيان»</Kicker>
        <Reveal delay={8}>
          <div style={{fontFamily: fonts.naskh, fontSize: 50, marginTop: 22, color: colors.ivoryDim}}>
            تعداد إسرائيل 4.5 مليون نسمة — أي <span style={{color: colors.goldBright}}>1/50</span> من تعداد السكان العرب
          </div>
        </Reveal>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 40px)',
            gap: '18px 34px',
            marginTop: 50,
          }}
        >
          {new Array(50).fill(0).map((_, i) => {
            const d = 20 + i * 1.6;
            const p = interpolate(frame, [d, d + 10], [0, 1], clamp);
            const isOne = i === 0;
            return (
              <div key={i} style={{opacity: p, transform: `scale(${0.6 + 0.4 * p})`}}>
                <Person color={isOne ? colors.goldBright : 'rgba(226,85,63,0.75)'} glow={isOne && frame > 110} />
              </div>
            );
          })}
        </div>
        <Reveal delay={110}>
          <div style={{display: 'flex', gap: 60, marginTop: 34, fontFamily: fonts.sans, fontSize: 30}}>
            <span style={{color: colors.goldBright}}>● إسرائيل</span>
            <span style={{color: colors.red}}>● السكان العرب</span>
          </div>
        </Reveal>
      </Scene>

      <Scene style={{opacity: phaseB, justifyContent: 'flex-start', paddingTop: 150}}>
        {frame > 168 ? (
          <>
            <Kicker>حجم الترجمة</Kicker>
            <div style={{display: 'flex', flexDirection: 'column', gap: 70, width: '100%', marginTop: 90}}>
              <BarRow label="إسرائيل وحدها" sub="4.5 مليون نسمة" value={100} max={100} delay={185} color={colors.goldBright} height={80} valueLabel="1" />
              <BarRow
                label="كل الدول العربية"
                sub="مجتمعةً"
                value={50}
                max={100}
                delay={205}
                color={colors.red}
                height={80}
                valueLabel="½"
              />
            </div>
            <WordReveal
              delay={250}
              stagger={2}
              text="إنتاج كل الدول العربية مجتمعة من الترجمة لا يتجاوز نصف ما تنتجه إسرائيل وحدها"
              highlight={['نصف']}
              style={{fontFamily: fonts.naskh, fontSize: 56, lineHeight: 1.7, marginTop: 70, maxWidth: 1500}}
            />
          </>
        ) : null}
      </Scene>
    </AbsoluteFill>
  );
};
