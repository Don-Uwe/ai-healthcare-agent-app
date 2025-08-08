import Svg, { Rect, Path } from "react-native-svg";

export default function MicWave({ amplitude }) {
  const barHeight = 16 + amplitude * 50; // increase bar with loudness

  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Rect x={9} y={28 - barHeight - 4} width={10} height={barHeight} rx={5} fill="#38bdf8" />
      <Rect x={13} y={20} width={2} height={5} rx={1} fill="#38bdf8" />
      <Path d="M7 15v1a7 7 0 0 0 14 0v-1" stroke="#38bdf8" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
