import React from "react";
import { AbsoluteFill, Composition, Series } from "remotion";
import { Background, Grain } from "./components/Background";
import { FadeToBlack, SafeAreaGuide } from "./components/Ornaments";
import { S1Title } from "./scenes/S1Title";
import { S2Pillars } from "./scenes/S2Pillars";
import { S3Muhasaba } from "./scenes/S3Muhasaba";
import { S4Khusuma } from "./scenes/S4Khusuma";
import { S5Qadaa } from "./scenes/S5Qadaa";
import { S6Ithaba } from "./scenes/S6Ithaba";
import { S7Ihsaa } from "./scenes/S7Ihsaa";
import { S8Mahw } from "./scenes/S8Mahw";
import { S9Khatima } from "./scenes/S9Khatima";
import { H, W } from "./theme";
import { FPS, OUTRO_FADE_FRAMES, SCENES, SceneId, TOTAL_FRAMES } from "./timings";
import "./fonts";

const COMPONENTS: Record<SceneId, React.FC> = {
  title: S1Title,
  pillars: S2Pillars,
  muhasaba: S3Muhasaba,
  khusuma: S4Khusuma,
  qadaa: S5Qadaa,
  ithaba: S6Ithaba,
  ihsaa: S7Ihsaa,
  mahw: S8Mahw,
  khatima: S9Khatima,
};

type Props = { showSafeArea: boolean };

export const Muhasaba: React.FC<Props> = ({ showSafeArea }) => (
  <AbsoluteFill style={{ backgroundColor: "#0E1626" }}>
    <Background total={TOTAL_FRAMES} />
    <Series>
      {SCENES.map((s) => {
        const C = COMPONENTS[s.id];
        return (
          <Series.Sequence key={s.id} durationInFrames={s.frames} name={s.id}>
            <C />
          </Series.Sequence>
        );
      })}
    </Series>
    <Grain />
    <FadeToBlack from={TOTAL_FRAMES - OUTRO_FADE_FRAMES} duration={OUTRO_FADE_FRAMES} />
    {showSafeArea ? <SafeAreaGuide /> : null}
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
