import { SvgIcon } from '../type'

export default function ExclaimationOctagon(props: SvgIcon) {
  const { width = 20, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 20 20" fill="none" stroke="currentcolor" className="chakra-icon" {...props}>
      <g clipPath="url(#clip0_21586_34850)">
        <path
          d="M6.5513 1.66797H13.4513L18.3346 6.5513V13.4513L13.4513 18.3346H6.5513L1.66797 13.4513V6.5513L6.5513 1.66797Z"
          stroke="currentcolor"
          strokeWidth="1.66667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M10 13.332H10.0083" stroke="currentcolor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 6.66797V10.0013" stroke="currentcolor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_21586_34850">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
