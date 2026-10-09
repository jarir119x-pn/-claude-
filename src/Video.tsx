import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {fontFaces} from './theme';
import {Background} from './components/Background';
import {Intro, INTRO_DURATION} from './scenes/Intro';
import {Title, TITLE_DURATION} from './scenes/Title';
import {NoteScene, Stat2002, StatFrance24, StatPerMillion, STAT_DURATION} from './scenes/Stats';
import {
  BrazilScene,
  BRAZIL_DURATION,
  CompareIntro,
  COMPARE_INTRO_DURATION,
  Eighties,
  EIGHTIES_DURATION,
  FranceScene,
  FRANCE_DURATION,
  IsraelScene,
  ISRAEL_DURATION,
  NextEra,
  NEXT_ERA_DURATION,
} from './scenes/Compare';
import {Outro, OUTRO_DURATION} from './scenes/Outro';

const TRANSITION = 20;

const scenes: {C: React.FC; d: number}[] = [
  {C: Intro, d: INTRO_DURATION},
  {C: Title, d: TITLE_DURATION},
  {C: StatPerMillion, d: STAT_DURATION},
  {C: Stat2002, d: STAT_DURATION},
  {C: StatFrance24, d: STAT_DURATION},
  {C: NoteScene, d: STAT_DURATION},
  {C: CompareIntro, d: COMPARE_INTRO_DURATION},
  {C: Eighties, d: EIGHTIES_DURATION},
  {C: NextEra, d: NEXT_ERA_DURATION},
  {C: FranceScene, d: FRANCE_DURATION},
  {C: BrazilScene, d: BRAZIL_DURATION},
  {C: IsraelScene, d: ISRAEL_DURATION},
  {C: Outro, d: OUTRO_DURATION},
];

export const TOTAL_DURATION =
  scenes.reduce((sum, s) => sum + s.d, 0) - TRANSITION * (scenes.length - 1);

// ننتظر تحميل الخطوط العربية قبل التقاط أي إطار
const useFonts = () => {
  const [handle] = useState(() => delayRender('Loading Arabic fonts'));
  useEffect(() => {
    Promise.all(fontFaces.map((f) => document.fonts.load(f, 'العربية 0123')))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const TranslationStats: React.FC = () => {
  useFonts();
  const {durationInFrames} = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <TransitionSeries>
        {scenes.map(({C, d}, i) => (
          <React.Fragment key={i}>
            {i > 0 ? (
              <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />
            ) : null}
            <TransitionSeries.Sequence durationInFrames={d}>
              <C />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      <Audio
        src={staticFile('ambient.m4a')}
        volume={(f) =>
          interpolate(f, [0, 45, durationInFrames - 60, durationInFrames], [0, 0.55, 0.55, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
    </AbsoluteFill>
  );
};
