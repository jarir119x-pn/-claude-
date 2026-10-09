import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {colors, fonts} from '../theme';

const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

export const useSpring = (delay = 0, damping = 200, durationInFrames?: number) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({
    frame: frame - delay,
    fps,
    config: {damping},
    durationInFrames,
  });
};

// ظهور ناعم مع صعود وإزالة ضبابية
export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  y?: number;
  style?: React.CSSProperties;
}> = ({delay = 0, children, y = 40, style}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${(1 - p) * y}px)`,
        filter: `blur(${(1 - p) * 10}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ظهور الكلمات واحدة تلو الأخرى
export const WordReveal: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  highlight?: string[];
  highlightColor?: string;
}> = ({text, delay = 0, stagger = 3, style, highlight = [], highlightColor}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: '0.28em', ...style}}>
      {words.map((w, i) => {
        const p = spring({frame: frame - delay - i * stagger, fps, config: {damping: 200}});
        const hl = highlight.some((h) => w.includes(h));
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${(1 - p) * 24}px)`,
              filter: `blur(${(1 - p) * 6}px)`,
              color: hl ? highlightColor ?? colors.goldBright : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

// عدّاد أرقام متصاعد
export const Counter: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  duration?: number;
  decimals?: number;
  style?: React.CSSProperties;
  prefix?: string;
}> = ({to, from = 0, delay = 0, duration = 45, decimals = 0, style, prefix = ''}) => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [delay, delay + duration], [from, to], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const txt = v.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', direction: 'ltr', unicodeBidi: 'isolate', ...style}}>
      {prefix}
      {txt}
    </span>
  );
};

// شارة صغيرة أعلى المشهد
export const Kicker: React.FC<{children: React.ReactNode; delay?: number; color?: string}> = ({
  children,
  delay = 0,
  color = colors.gold,
}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        opacity: p,
        fontFamily: fonts.kufi,
        fontSize: 34,
        color,
        letterSpacing: 1,
      }}
    >
      <div style={{width: 90 * p, height: 2, background: color}} />
      <span>{children}</span>
      <div style={{width: 90 * p, height: 2, background: color}} />
    </div>
  );
};

// وسم المصدر أسفل الشاشة
export const SourceTag: React.FC<{children: React.ReactNode; delay?: number}> = ({
  children,
  delay = 20,
}) => {
  const p = useSpring(delay);
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 64,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        opacity: p * 0.9,
      }}
    >
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 24,
          color: colors.ivoryDim,
          border: `1px solid ${colors.line}`,
          borderRadius: 999,
          padding: '8px 26px',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// نجمة ثمانية زخرفية
export const Star8: React.FC<{
  size: number;
  color?: string;
  strokeWidth?: number;
  rotate?: number;
  fill?: string;
}> = ({size, color = colors.gold, strokeWidth = 2, rotate = 0, fill = 'none'}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{transform: `rotate(${rotate}deg)`}}>
    <g fill={fill} stroke={color} strokeWidth={strokeWidth}>
      <rect x="20" y="20" width="60" height="60" />
      <rect x="20" y="20" width="60" height="60" transform="rotate(45 50 50)" />
      <circle cx="50" cy="50" r="14" />
    </g>
  </svg>
);

// إطار مشهد عام: يتكفل بالاتجاه من اليمين لليسار والهوامش
export const Scene: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({
  children,
  style,
}) => (
  <AbsoluteFill
    style={{
      direction: 'rtl',
      fontFamily: fonts.sans,
      color: colors.ivory,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '90px 140px',
      wordSpacing: '0.14em',
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

// خروج المشهد (تلاشٍ عند النهاية)
export const useExit = (start: number, length = 15) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + length], [1, 0], clamp);
};

export {clamp};
