import { SvgIcon } from '../type'

export default function ExpandDownIcon(props: SvgIcon) {
  const { width = 14, height = 14, stroke = '#22D1F8' } = props

  return (
    <svg width={width} height={height} viewBox="0 0 14 14" fill="none" className="chakra-icon" {...props}>
      <path
        d="M4.07812 7.58398L6.99479 10.5007L9.91146 7.58398"
        stroke={stroke}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.07812 3.5L6.99479 6.41667L9.91146 3.5"
        stroke={stroke}
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
