import { SvgIcon } from '../type'

export default function PriorityFastIcon(props: SvgIcon) {
  const { width = 24, height = 24, color = 'currentColor' } = props

  return (
    <svg width={width} height={height} fill="none" viewBox="0 0 24 24" className="chakra-icon" {...props}>
      <path d="M22 12H18L15 21L9 3L6 12H2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
