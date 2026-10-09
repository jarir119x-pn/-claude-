import React from 'react';
import {Composition} from 'remotion';
import {FPS, HEIGHT, WIDTH} from './theme';
import {TOTAL_DURATION, TranslationStats} from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="TranslationStats"
    component={TranslationStats}
    durationInFrames={TOTAL_DURATION}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
