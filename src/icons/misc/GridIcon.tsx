import { SvgIcon } from '../type'

export default function GridIcon(props: SvgIcon) {
  const { width = 20, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" className="chakra-icon" {...props}>
      <g>
        <path
          d="M17.4974 11.668H11.6641V17.5013H17.4974V11.668Z"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.33333 11.668H2.5V17.5013H8.33333V11.668Z"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.4974 2.5H11.6641V8.33333H17.4974V2.5Z"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z"
          stroke="currentColor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
