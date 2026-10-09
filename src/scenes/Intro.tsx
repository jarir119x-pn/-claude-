import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {colors, fonts} from '../theme';
import {Reveal, Scene, Star8, clamp} from '../components/ui';

export const INTRO_DURATION = 300;

// يبدأ المسح عند هذا الإطار وينتهي بعد ERASE_LEN
const ERASE_START = 175;
const ERASE_LEN = 70;

// ذرات تتطاير من خط المسح
const Ashes: React.FC<{edge: number}> = ({edge}) => {
  const frame = useCurrentFrame();
  const active = frame >= ERASE_START && frame <= ERASE_START + ERASE_LEN + 40;
  if (!active) return null;
  return (
    <>
      {new Array(70).fill(0).map((_, i) => {
        const born = ERASE_START + (i / 70) * ERASE_LEN;
        const age = frame - born;
        if (age < 0 || age > 45) return null;
        // موضع الولادة: حيث كان خط المسح لحظة ولادة الذرة
        const bornEdge = interpolate(born, [ERASE_START, ERASE_START + ERASE_LEN], [1, 0]);
        const x0 = 260 + bornEdge * 1400;
        const y0 = 300 + (noise2D('ay', i, 0) * 0.5 + 0.5) * 480;
        const vx = -1.5 - (noise2D('vx', i, 0) * 0.5 + 0.5) * 3;
        const vy = -0.6 - (noise2D('vy', i, 0) * 0.5 + 0.5) * 2.2;
        const o = interpolate(age, [0, 8, 45], [0, 0.9, 0], clamp);
        const s = 2 + (i % 5);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x0 + vx * age * 2,
              top: y0 + vy * age * 2,
              width: s,
              height: s,
              borderRadius: s > 4 ? 1 : '50%',
              background: colors.goldBright,
              opacity: o,
              boxShadow: `0 0 10px ${colors.gold}`,
            }}
          />
        );
      })}
      {/* خط المسح المضيء */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          bottom: 230,
          left: 260 + edge * 1400,
          width: 3,
          background: `linear-gradient(to bottom, transparent, ${colors.goldBright}, transparent)`,
          boxShadow: `0 0 40px 10px ${colors.gold}`,
          opacity: edge > 0.001 && edge < 0.999 ? 1 : 0,
        }}
      />
    </>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();

  // edge: 1 = لم يُمسح شيء، 0 = مُسح كل شيء. المسح من اليمين إلى اليسار مثل اتجاه القراءة
  const edge = interpolate(frame, [ERASE_START, ERASE_START + ERASE_LEN], [1, 0], {
    ...clamp,
    easing: Easing.inOut(Easing.cubic),
  });
  const clipRight = (1 - edge) * 100;

  const preface = interpolate(frame, [120, 150], [1, 0], clamp);
  const memoryIn = interpolate(frame, [70, 110], [0, 1], clamp);
  const glow = 0.5 + 0.5 * Math.sin(frame / 12);

  const after = interpolate(frame, [ERASE_START + ERASE_LEN, ERASE_START + ERASE_LEN + 25], [0, 1], clamp);

  return (
    <AbsoluteFill>
      {/* التمهيد */}
      <Scene style={{justifyContent: 'flex-start', paddingTop: 110, opacity: preface}}>
        <Reveal delay={8}>
          <div style={{fontFamily: fonts.naskh, fontSize: 52, color: colors.ivoryDim}}>
            سأحدثك بحديث…
          </div>
        </Reveal>
        <Reveal delay={36}>
          <div style={{fontFamily: fonts.naskh, fontSize: 60, marginTop: 18}}>
            لكن قبل أن تسمع مني، تأكد أن{' '}
            <span style={{color: colors.goldBright}}>تمحو من ذاكرتك</span>
          </div>
        </Reveal>
      </Scene>

      {/* الذاكرة التي ستُمحى */}
      <AbsoluteFill
        style={{
          clipPath: `inset(0 ${clipRight}% 0 0)`,
          opacity: memoryIn,
          direction: 'rtl',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 210,
        }}
      >
        <div style={{transform: `scale(${0.94 + memoryIn * 0.06})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{position: 'relative', width: 200, height: 200, marginBottom: 10}}>
            <div style={{position: 'absolute', inset: 0, filter: `drop-shadow(0 0 ${18 + glow * 18}px ${colors.gold})`}}>
              <Star8 size={200} strokeWidth={1.6} rotate={frame * 0.3} />
            </div>
            <div style={{position: 'absolute', inset: 40}}>
              <Star8 size={120} strokeWidth={1.2} rotate={-frame * 0.5} color={colors.goldBright} />
            </div>
          </div>
          <div
            style={{
              fontFamily: fonts.naskh,
              fontWeight: 700,
              fontSize: 170,
              lineHeight: 1.25,
              color: colors.goldBright,
              textShadow: `0 0 ${30 + glow * 30}px rgba(243,201,107,0.45)`,
            }}
          >
            «بيت الحكمة»
          </div>
          <div style={{fontFamily: fonts.naskh, fontSize: 50, color: colors.ivory, marginTop: 4}}>
            الذي افتتحه هارون الرشيد
          </div>
          <div style={{fontFamily: fonts.naskh, fontSize: 40, color: colors.ivoryDim, marginTop: 14}}>
            وأيام الترجمة والحركة العلمية الزاهرة
          </div>
        </div>
      </AbsoluteFill>

      <Ashes edge={edge} />

      {/* بعد المسح */}
      <Scene style={{opacity: after}}>
        <div
          style={{
            fontFamily: fonts.kufi,
            fontSize: 46,
            color: colors.ivoryDim,
            letterSpacing: 2,
            transform: `translateY(${(1 - after) * 20}px)`,
          }}
        >
          …والآن، إلى الأرقام
        </div>
      </Scene>
    </AbsoluteFill>
  );
};
