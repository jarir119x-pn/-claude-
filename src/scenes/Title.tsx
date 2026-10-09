import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../theme';
import {Reveal, Scene, Star8, clamp, useSpring} from '../components/ui';

export const TITLE_DURATION = 130;

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const line = useSpring(18);
  const zoom = interpolate(frame, [0, TITLE_DURATION], [1, 1.05], clamp);
  return (
    <Scene>
      <div style={{transform: `scale(${zoom})`, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Reveal delay={0}>
          <div style={{opacity: 0.85}}>
            <Star8 size={90} strokeWidth={2.5} rotate={frame * 0.6} />
          </div>
        </Reveal>
        <Reveal delay={6}>
          <div
            style={{
              fontFamily: fonts.kufi,
              fontWeight: 700,
              fontSize: 150,
              lineHeight: 1.3,
              marginTop: 10,
            }}
          >
            الترجمة في الوطن العربي
          </div>
        </Reveal>
        <div
          style={{
            width: 900 * line,
            height: 3,
            margin: '22px 0 30px',
            background: `linear-gradient(to left, transparent, ${colors.gold}, transparent)`,
          }}
        />
        <Reveal delay={24}>
          <div style={{fontFamily: fonts.naskh, fontSize: 64, color: colors.goldBright}}>
            حين تتكلم الأرقام
          </div>
        </Reveal>
      </div>
    </Scene>
  );
};
