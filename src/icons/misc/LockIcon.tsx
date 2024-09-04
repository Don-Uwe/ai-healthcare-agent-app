import { SvgIcon } from '../type'

export default function LockIcon(props: SvgIcon) {
  const { width = 12, height = 13 } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="chakra-icon"
      {...props}
    >
      <g opacity="0.6">
        <path
          d="M9.5 6H2.5C1.94772 6 1.5 6.44772 1.5 7V10.5C1.5 11.0523 1.94772 11.5 2.5 11.5H9.5C10.0523 11.5 10.5 11.0523 10.5 10.5V7C10.5 6.44772 10.0523 6 9.5 6Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 6V4C3.5 3.33696 3.76339 2.70107 4.23223 2.23223C4.70107 1.76339 5.33696 1.5 6 1.5C6.66304 1.5 7.29893 1.76339 7.76777 2.23223C8.23661 2.70107 8.5 3.33696 8.5 4V6"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}
