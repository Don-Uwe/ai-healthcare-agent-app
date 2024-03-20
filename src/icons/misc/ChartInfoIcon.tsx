import { SvgIcon } from '../type'

export default function ChartInfoIcon(props: SvgIcon) {
  const { width = 16, height = 14 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 14" fill="none" className="chakra-icon" {...props}>
      <path
        d="M14.6693 7H12.0026L10.0026 13L6.0026 1L4.0026 7H1.33594"
        stroke="#8C6EEF"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
