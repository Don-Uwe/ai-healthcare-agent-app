import { SvgIcon } from '../type'

export default function ListIcon(props: SvgIcon) {
  const { width = 20, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" className="chakra-icon" {...props}>
      <path d="M6.66406 15H17.4974" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 15H2.50833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66406 10H17.4974" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 10H2.50833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66406 5H17.4974" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 5H2.50833" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
