import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {colors} from '../theme';

// نمط هندسي إسلامي (نجمة ثمانية) يتحرك ببطء شديد في الخلفية
const Pattern: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  const shift = (frame * 0.25) % 160;
  return (
    <svg
      width="100%"
      height="100%"
      style={{position: 'absolute', inset: 0, opacity}}
    >
      <defs>
        <pattern
          id="girih"
          width="160"
          height="160"
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${shift} ${shift / 2})`}
        >
          <g fill="none" stroke={colors.gold} strokeWidth="1.2">
            <rect x="40" y="40" width="80" height="80" />
            <rect
              x="40"
              y="40"
              width="80"
              height="80"
              transform="rotate(45 80 80)"
            />
            <circle cx="80" cy="80" r="18" />
            <path d="M0 0 L40 40 M160 0 L120 40 M0 160 L40 120 M160 160 L120 120" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#girih)" />
    </svg>
  );
};

// غبار ذهبي عائم
const Dust: React.FC<{count?: number}> = ({count = 46}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  return (
    <>
      {new Array(count).fill(0).map((_, i) => {
        const baseX = (noise2D('x', i, 0) * 0.5 + 0.5) * width;
        const baseY = (noise2D('y', i, 0) * 0.5 + 0.5) * height;
        const dx = noise2D('dx', i, frame / 260) * 60;
        const dy = ((frame * (0.15 + (i % 5) * 0.06)) % height) * -1;
        const y = ((baseY + dy) % height + height) % height;
        const size = 1.5 + (i % 4);
        const twinkle =
          0.25 + 0.35 * (noise2D('t', i, frame / 40) * 0.5 + 0.5);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX + dx,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: colors.goldBright,
              opacity: twinkle,
              filter: 'blur(0.6px)',
              boxShadow: `0 0 ${size * 3}px ${colors.gold}`,
            }}
          />
        );
      })}
    </>
  );
};

export const Background: React.FC<{patternOpacity?: number}> = ({
  patternOpacity = 0.06,
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: colors.ink}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 45%, ${colors.inkSoft} 0%, ${colors.ink} 70%, #05070e 100%)`,
        }}
      />
      <Pattern opacity={patternOpacity} />
      <Dust />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
