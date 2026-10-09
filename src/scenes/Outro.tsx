import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../theme';
import {Reveal, Scene, Star8, clamp, useSpring} from '../components/ui';

export const OUTRO_DURATION = 330;

const Card: React.FC<{big: string; text: string; delay: number; color: string}> = ({big, text, delay, color}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        width: 440,
        padding: '40px 30px',
        borderRadius: 26,
        border: `1px solid ${colors.line}`,
        background: 'rgba(255,255,255,0.03)',
        textAlign: 'center',
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px)`,
      }}
    >
      <div style={{fontFamily: fonts.sans, fontWeight: 900, fontSize: 110, color, lineHeight: 1.2, direction: 'ltr'}}>{big}</div>
      <div style={{fontFamily: fonts.naskh, fontSize: 38, marginTop: 10, lineHeight: 1.5}}>{text}</div>
    </div>
  );
};

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const recap = interpolate(frame, [140, 165], [1, 0], clamp);
  const memory = interpolate(frame, [170, 230], [0, 1], clamp);
  const glow = 0.5 + 0.5 * Math.sin(frame / 14);
  return (
    <AbsoluteFill>
      <Scene style={{opacity: recap}}>
        <Reveal delay={0}>
          <div style={{fontFamily: fonts.kufi, fontSize: 52, color: colors.ivoryDim, marginBottom: 50}}>
            الحصيلة
          </div>
        </Reveal>
        <div style={{display: 'flex', gap: 50}}>
          <Card big="4.4" text="كتاب لكل مليون نسمة" delay={10} color={colors.red} />
          <Card big="1/6" text="مما تترجمه فرنسا وحدها" delay={22} color={colors.goldBright} />
          <Card big="½" text="مما تترجمه إسرائيل وحدها" delay={34} color={colors.teal} />
        </div>
      </Scene>

      <Scene style={{opacity: memory}}>
        {frame > 160 ? (
          <>
            <div style={{filter: `drop-shadow(0 0 ${12 + glow * 24}px ${colors.gold})`, opacity: 0.4 + memory * 0.6}}>
              <Star8 size={150} strokeWidth={1.8} rotate={frame * 0.3} />
            </div>
            <Reveal delay={180}>
              <div style={{fontFamily: fonts.naskh, fontSize: 56, color: colors.ivoryDim, marginTop: 30}}>
                والآن… بعد هذه الأرقام
              </div>
            </Reveal>
            <Reveal delay={215}>
              <div
                style={{
                  fontFamily: fonts.naskh,
                  fontWeight: 700,
                  fontSize: 100,
                  marginTop: 16,
                  lineHeight: 1.4,
                }}
              >
                تذكّر{' '}
                <span style={{color: colors.goldBright, textShadow: `0 0 ${30 + glow * 30}px rgba(243,201,107,0.45)`}}>
                  «بيت الحكمة»
                </span>{' '}
                من جديد
              </div>
            </Reveal>
          </>
        ) : null}
      </Scene>
      {/* تلاشٍ نهائي إلى الأسود */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(frame, [OUTRO_DURATION - 30, OUTRO_DURATION], [0, 1], clamp),
        }}
      />
    </AbsoluteFill>
  );
};
