import { SvgIcon } from '../type'

export default function PriorityUltraIcon(props: SvgIcon) {
  const { width = 24, height = 24, color = 'currentColor' } = props

  return (
    <svg width={width} height={height} fill="none" viewBox="0 0 24 24" className="chakra-icon" {...props}>
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
