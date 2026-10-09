import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../theme';
import {
  Counter,
  Kicker,
  Reveal,
  Scene,
  SourceTag,
  clamp,
  useSpring,
} from '../components/ui';

export const STAT_DURATION = 200;

const BigNumber: React.FC<{children: React.ReactNode; color?: string}> = ({
  children,
  color = colors.goldBright,
}) => (
  <div
    style={{
      fontFamily: fonts.sans,
      fontWeight: 900,
      fontSize: 260,
      lineHeight: 1.05,
      color,
      textShadow: `0 0 60px ${color}55`,
    }}
  >
    {children}
  </div>
);

// كتاب صغير يمتلئ جزئيًا
const Book: React.FC<{fill: number; delay: number}> = ({fill, delay}) => {
  const frame = useCurrentFrame();
  const appear = useSpring(delay);
  const f = interpolate(frame, [delay + 5, delay + 25], [0, fill], clamp);
  return (
    <div
      style={{
        position: 'relative',
        width: 74,
        height: 100,
        borderRadius: '4px 10px 10px 4px',
        border: `2px solid ${colors.gold}`,
        overflow: 'hidden',
        opacity: appear,
        transform: `translateY(${(1 - appear) * 30}px)`,
      }}
    >
      {/* الامتلاء من اليمين إلى اليسار */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: `${f * 100}%`,
          background: `linear-gradient(to bottom, ${colors.goldBright}, ${colors.goldDeep})`,
        }}
      />
      <div style={{position: 'absolute', top: 0, bottom: 0, right: 12, width: 2, background: 'rgba(10,15,28,0.5)'}} />
    </div>
  );
};

// الإحصائية الأولى: 4.4 كتاب لكل مليون
export const StatPerMillion: React.FC = () => {
  return (
    <Scene>
      <Kicker>الإحصائية الأولى</Kicker>
      <Reveal delay={8}>
        <div style={{fontFamily: fonts.naskh, fontSize: 52, marginTop: 30, color: colors.ivoryDim}}>
          معدل الترجمة العربية لا يتجاوز
        </div>
      </Reveal>
      <Reveal delay={14}>
        <BigNumber>
          <Counter to={4.4} decimals={1} delay={18} duration={40} />
        </BigNumber>
      </Reveal>
      <Reveal delay={30}>
        <div style={{fontFamily: fonts.kufi, fontSize: 58}}>
          كتاب لكل <span style={{color: colors.goldBright}}>مليون</span> نسمة
        </div>
      </Reveal>
      <div style={{display: 'flex', gap: 22, marginTop: 50}}>
        {[1, 1, 1, 1, 0.4].map((f, i) => (
          <Book key={i} fill={f} delay={60 + i * 10} />
        ))}
      </div>
      <Reveal delay={120}>
        <div style={{fontFamily: fonts.sans, fontSize: 30, color: colors.ivoryDim, marginTop: 26}}>
          …في الوطن العربي كله
        </div>
      </Reveal>
    </Scene>
  );
};

// الإحصائية الثانية: 330 كتابًا (تقرير 2002)
export const Stat2002: React.FC = () => {
  const frame = useCurrentFrame();
  const total = 330;
  const lit = Math.floor(interpolate(frame, [30, 110], [0, total], clamp));
  return (
    <Scene>
      <Kicker>تقرير عام 2002</Kicker>
      <div style={{display: 'flex', alignItems: 'center', gap: 110, marginTop: 40}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Reveal delay={6}>
            <div style={{fontFamily: fonts.naskh, fontSize: 46, color: colors.ivoryDim, textAlign: 'center'}}>
              مجموع الكتب المترجمة
              <br />
              في العالم العربي
            </div>
          </Reveal>
          <Reveal delay={14}>
            <BigNumber>
              <Counter to={total} delay={30} duration={80} />
            </BigNumber>
          </Reveal>
          <Reveal delay={24}>
            <div style={{fontFamily: fonts.kufi, fontSize: 54}}>
              كتابًا <span style={{marginRight: 14}}>فقط</span>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div style={{fontFamily: fonts.sans, fontSize: 32, color: colors.goldBright, marginTop: 18}}>
              في جميع التخصصات
            </div>
          </Reveal>
        </div>
        {/* شبكة: كل مربع يمثل كتابًا واحدًا */}
        <Reveal delay={20}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(22, 18px)',
              gap: 7,
              padding: 26,
              border: `1px solid ${colors.line}`,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.02)',
            }}
          >
            {new Array(total).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 3,
                  background: i < lit ? colors.gold : 'rgba(244,234,213,0.06)',
                  boxShadow: i === lit - 1 ? `0 0 16px ${colors.goldBright}` : undefined,
                }}
              />
            ))}
          </div>
          <div style={{fontFamily: fonts.sans, fontSize: 22, color: colors.ivoryDim, textAlign: 'center', marginTop: 12}}>
            ■ = كتاب واحد
          </div>
        </Reveal>
      </div>
      <SourceTag delay={40}>المصدر: تقرير عام 2002</SourceTag>
    </Scene>
  );
};

// الإحصائية الثالثة: ~3000 كتاب سنويًا (France 24)
export const StatFrance24: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = useSpring(70, 12);
  const dash = interpolate(frame, [0, STAT_DURATION], [0, -120]);
  return (
    <Scene>
      <Kicker>بحسب France 24</Kicker>
      <Reveal delay={8}>
        <div style={{fontFamily: fonts.naskh, fontSize: 50, marginTop: 30, color: colors.ivoryDim}}>
          يُترجم في العالم العربي سنويًا نحو
        </div>
      </Reveal>
      <div style={{position: 'relative'}}>
        <Reveal delay={14}>
          <BigNumber>
            <Counter to={3000} prefix="~" delay={18} duration={55} />
          </BigNumber>
        </Reveal>
        {/* ختم «تقدير» */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: -230,
            transform: `rotate(-12deg) scale(${2 - stamp})`,
            opacity: stamp,
          }}
        >
          <svg width="220" height="110" style={{position: 'absolute', inset: 0}}>
            <rect
              x="4"
              y="4"
              width="212"
              height="102"
              rx="18"
              fill="none"
              stroke={colors.red}
              strokeWidth="4"
              strokeDasharray="14 10"
              strokeDashoffset={dash}
            />
          </svg>
          <div
            style={{
              width: 220,
              height: 110,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: fonts.kufi,
              fontWeight: 700,
              fontSize: 54,
              color: colors.red,
            }}
          >
            تقدير
          </div>
        </div>
      </div>
      <Reveal delay={30}>
        <div style={{fontFamily: fonts.kufi, fontSize: 58}}>كتاب في السنة</div>
      </Reveal>
      <SourceTag delay={40}>المصدر: France 24 — رقم تقديري</SourceTag>
    </Scene>
  );
};

// ملاحظة: لا إحصائية دقيقة واحدة
export const NoteScene: React.FC = () => {
  const frame = useCurrentFrame();
  const underline = interpolate(frame, [70, 100], [0, 1], clamp);
  const zero = useSpring(95, 10);
  return (
    <Scene>
      <Kicker color={colors.red}>ملاحظة</Kicker>
      <Reveal delay={8}>
        <div
          style={{
            fontFamily: fonts.naskh,
            fontSize: 72,
            lineHeight: 1.6,
            textAlign: 'center',
            marginTop: 40,
            maxWidth: 1400,
          }}
        >
          قومنا لم يكلفوا أنفسهم عناء عمل
          <br />
          <span style={{position: 'relative', color: colors.goldBright}}>
            إحصائية دقيقة
            <span
              style={{
                position: 'absolute',
                right: 0,
                bottom: 6,
                height: 5,
                width: `${underline * 100}%`,
                background: colors.red,
                borderRadius: 3,
              }}
            />
          </span>
        </div>
      </Reveal>
      <div
        style={{
          marginTop: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          opacity: zero,
          transform: `scale(${1.6 - zero * 0.6})`,
        }}
      >
        <div
          style={{
            width: 170,
            height: 170,
            borderRadius: '50%',
            border: `6px solid ${colors.red}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 120,
            color: colors.red,
            boxShadow: `0 0 50px ${colors.redSoft}`,
          }}
        >
          0
        </div>
        <div style={{fontFamily: fonts.kufi, fontSize: 70, color: colors.red}}>(ولا حتى واحدة)</div>
      </div>
    </Scene>
  );
};
