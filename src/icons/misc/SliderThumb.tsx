import { SvgIcon } from '../type'

export default function SliderThumbIcon(props: SvgIcon) {
  const { width = 25, height = 24 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 25 24" fill="none" className="chakra-icon" {...props}>
      <line x1="8.89844" y1="12" x2="15.8984" y2="12" stroke="#141041" strokeLinecap="round" />
      <line x1="8.89844" y1="9.5" x2="15.8984" y2="9.5" stroke="#141041" strokeLinecap="round" />
      <line x1="8.89844" y1="14.5" x2="15.8984" y2="14.5" stroke="#141041" strokeLinecap="round" />
    </svg>
  )
}
