import { SvgIcon } from '../type'

export default function PlusIcon(props: SvgIcon) {
  const { width = 16, height = 16 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="currentColor" className="chakra-icon" {...props}>
      <path d="M8 3.33398V12.6673" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.32812 8H12.6615" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
