import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {colors, fonts} from '../theme';
import {Counter, clamp, useSpring} from './ui';

export const BarRow: React.FC<{
  label: string;
  sub?: string;
  value: number;
  max: number;
  delay: number;
  color: string;
  decimals?: number;
  valuePrefix?: string;
  // نطاق اختياري (مثل «بضع مئات إلى 3000») يُرسم مخططًا
  rangeFrom?: number;
  emphasize?: boolean;
  height?: number;
  // نص بديل عن العدّاد (للمقارنات النسبية)
  valueLabel?: string;
}> = ({
  label,
  sub,
  value,
  max,
  delay,
  color,
  decimals = 0,
  valuePrefix,
  rangeFrom,
  emphasize = false,
  height = 64,
  valueLabel,
}) => {
  const frame = useCurrentFrame();
  const appear = useSpring(delay);
  const grow = interpolate(frame, [delay + 8, delay + 58], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const pct = Math.max(value / max, 0.004) * grow;
  const pulse = emphasize ? 0.55 + 0.45 * Math.sin((frame - delay) / 6) : 0;
  const rangePct = rangeFrom !== undefined ? (rangeFrom / max) * grow : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 36,
        width: '100%',
        opacity: appear,
        transform: `translateX(${(1 - appear) * 60}px)`,
      }}
    >
      <div style={{width: 360, flexShrink: 0}}>
        <div style={{fontFamily: fonts.kufi, fontSize: 48, color: emphasize ? colors.red : colors.ivory}}>
          {label}
        </div>
        {sub ? (
          <div style={{fontFamily: fonts.sans, fontSize: 26, color: colors.ivoryDim}}>{sub}</div>
        ) : null}
      </div>
      <div
        style={{
          flex: 1,
          height,
          borderRadius: 10,
          background: 'rgba(244,234,213,0.05)',
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: `${pct * 100}%`,
            minWidth: emphasize ? 8 : 0,
            borderRadius: 10,
            background: `linear-gradient(to left, ${color}, ${color}cc)`,
            boxShadow: emphasize
              ? `0 0 ${20 + pulse * 30}px ${colors.red}`
              : `0 0 30px ${color}44`,
          }}
        />
        {rangeFrom !== undefined ? (
          <div
            style={{
              position: 'absolute',
              right: `${rangePct * 100}%`,
              top: 0,
              bottom: 0,
              width: `${Math.max(pct - rangePct, 0) * 100}%`,
              borderRadius: 10,
              backgroundImage: `repeating-linear-gradient(45deg, rgba(10,15,28,0.55) 0 10px, transparent 10px 20px)`,
            }}
          />
        ) : null}
      </div>
      <div
        style={{
          width: 250,
          flexShrink: 0,
          fontFamily: fonts.sans,
          fontWeight: 900,
          fontSize: 60,
          color: emphasize ? colors.red : color,
          textAlign: 'left',
        }}
      >
        {valueLabel ? (
          <span style={{opacity: grow}}>{valueLabel}</span>
        ) : (
          <Counter to={value} decimals={decimals} delay={delay + 8} duration={50} prefix={valuePrefix} />
        )}
      </div>
    </div>
  );
};
