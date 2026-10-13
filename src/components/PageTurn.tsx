import React from "react";
import { AbsoluteFill } from "remotion";
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import { EASE_IN_OUT, PAPER } from "../theme";

type P = Record<string, never>;

/**
 * تقليب صفحة ناعم: الصفحة الحالية تنثني حول كعبها (اليمين) وتنقلب نحوه،
 * مع تظليل خفيف كالتفاف الورق، وظل يمرّ على الصفحة التالية تحتها.
 */
const PageTurnComponent: React.FC<TransitionPresentationComponentProps<P>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const p = EASE_IN_OUT(presentationProgress);
  const spine = PAPER.x + PAPER.w;
  if (presentationDirection === "exiting") {
    const angle = p * 180;
    const curl = Math.sin(p * Math.PI);
    return (
      <AbsoluteFill style={{ perspective: 2600, perspectiveOrigin: `${spine}px 50%`, zIndex: 2 }}>
        <AbsoluteFill
          style={{
            transformOrigin: `${spine}px 50%`,
            transform: `rotateY(${angle}deg)`,
            backfaceVisibility: "hidden",
          }}
        >
          {children}
          <div
            style={{
              position: "absolute",
              left: PAPER.x,
              top: PAPER.y,
              width: PAPER.w,
              height: PAPER.h,
              background: `linear-gradient(to left, rgba(74,53,40,0) 0%, rgba(74,53,40,${0.08 * curl}) 55%, rgba(74,53,40,${0.22 * curl}) 100%)`,
            }}
          />
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }
  // الصفحة التالية: ظلّ الصفحة المقلوبة يمرّ عليها ثم يزول
  const shade = Math.sin((1 - p) * Math.PI * 0.5) * (1 - p);
  return (
    <AbsoluteFill style={{ zIndex: 1 }}>
      {children}
      <div
        style={{
          position: "absolute",
          left: PAPER.x,
          top: PAPER.y,
          width: PAPER.w,
          height: PAPER.h,
          background: `linear-gradient(to left, rgba(74,53,40,${0.16 * shade}) 0%, rgba(74,53,40,0) ${30 + 70 * p}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const pageTurn = (): TransitionPresentation<P> => ({
  component: PageTurnComponent,
  props: {},
});
