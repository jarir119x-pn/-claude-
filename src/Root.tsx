import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { BookStack, FadeToLinen, Grain, Linen, WarmVignette, WindowLight } from "./components/Desk";
import { pageTurn } from "./components/PageTurn";
import { SafeGuide } from "./components/SafeGuide";
import { S1Title } from "./scenes/S1Title";
import { S2Pillars } from "./scenes/S2Pillars";
import { S3MuhasabaA, S3MuhasabaB, S3MuhasabaC } from "./scenes/S3Muhasaba";
import { S4Khusuma } from "./scenes/S4Khusuma";
import { S5Qadaa } from "./scenes/S5Qadaa";
import { S6Ithaba } from "./scenes/S6Ithaba";
import { S7Ihsaa } from "./scenes/S7Ihsaa";
import { S8Mahw } from "./scenes/S8Mahw";
import { S9Khatima } from "./scenes/S9Khatima";
import { C, H, W } from "./theme";
import { FPS, OUTRO_FADE_FRAMES, PAGES, PageId, TOTAL_FRAMES, TURN_FRAMES } from "./timings";
import "./fonts";

const COMPONENTS: Record<PageId, React.FC> = {
  title: S1Title,
  pillars: S2Pillars,
  "muhasaba-a": S3MuhasabaA,
  "muhasaba-b": S3MuhasabaB,
  "muhasaba-c": S3MuhasabaC,
  khusuma: S4Khusuma,
  qadaa: S5Qadaa,
  ithaba: S6Ithaba,
  ihsaa: S7Ihsaa,
  mahw: S8Mahw,
  khatima: S9Khatima,
};

type Props = { showSafeArea: boolean };

export const Muhasaba: React.FC<Props> = ({ showSafeArea }) => (
  <AbsoluteFill style={{ backgroundColor: C.linen }}>
    <Linen total={TOTAL_FRAMES} />
    <BookStack />
    {/* كل مشهد صفحة، والانتقال بينها تقليب صفحة.
        isolation يحصر z-index الداخلي حتى تبقى طبقات الضوء والتلاشي فوق الصفحات */}
    <AbsoluteFill style={{ isolation: "isolate" }}>
    <TransitionSeries>
      {PAGES.flatMap((p, i) => {
        const Page = COMPONENTS[p.id];
        const items = [
          <TransitionSeries.Sequence key={p.id} durationInFrames={p.frames} name={p.id}>
            <Page />
          </TransitionSeries.Sequence>,
        ];
        if (i < PAGES.length - 1) {
          items.push(
            <TransitionSeries.Transition
              key={`${p.id}-turn`}
              presentation={pageTurn()}
              timing={linearTiming({ durationInFrames: TURN_FRAMES })}
            />,
          );
        }
        return items;
      })}
    </TransitionSeries>
    </AbsoluteFill>
    <WindowLight total={TOTAL_FRAMES} />
    <WarmVignette />
    <Grain />
    <FadeToLinen from={TOTAL_FRAMES - OUTRO_FADE_FRAMES} duration={OUTRO_FADE_FRAMES} />
    {showSafeArea ? <SafeGuide /> : null}
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <Composition
    id="Muhasaba"
    component={Muhasaba}
    width={W}
    height={H}
    fps={FPS}
    durationInFrames={TOTAL_FRAMES}
    defaultProps={{ showSafeArea: false }}
  />
);
