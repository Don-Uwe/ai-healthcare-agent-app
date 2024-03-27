import { SvgIcon } from '../type'

export default function ExpandLeftTopIcon(props: SvgIcon) {
  const { width = 10, height = 10 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 10 10" fill="transparent" className="chakra-icon" {...props}>
      <g clipPath="url(#clip0_21016_31403)">
        <path d="M3.75 8.75H1.25V6.25" stroke="#ABC4FF" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1.25 8.74967L4.16667 5.83301" stroke="#ABC4FF" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6.25 1.25H8.75V3.75" stroke="#ABC4FF" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.74967 1.25L5.83301 4.16667" stroke="#ABC4FF" strokeWidth="0.833333" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <defs>
        <clipPath id="clip0_21016_31403">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
