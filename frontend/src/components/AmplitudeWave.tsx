import React, { useMemo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

type Props = {
  audioWaves: number[]; 
};

const AmplitudeWave = ({ audioWaves }: Props) => {
  const height = 60;
  const centerY = height / 2;
  const spacing = 5;
  const scale = 40; // wave height

  // Create path string from audio wave values
  const d = useMemo(() => {
    if (audioWaves.length === 0) return '';

    return (
      'M0 ' +
      centerY +
      ' ' +
      audioWaves
        .map((amp, i) => {
          const x = i * spacing;
          const y = centerY - amp * scale;
          return `L${x} ${y.toFixed(2)}`;
        })
        .join(' ')
    );
  }, [audioWaves, centerY]);

  return (
    <Svg height={height} width="100%" viewBox="0 0 300 60">
      <G transform="translate(40, 0)">
        <Path d={d} stroke="#38bdf8" strokeWidth="2" fill="none" />
      </G>
    </Svg>
  );
};

export default AmplitudeWave;
