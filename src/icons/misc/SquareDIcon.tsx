import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { forwardRef } from '@chakra-ui/react'

export default forwardRef(function SquareDIcon(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      width={14}
      height={14}
      viewBox="0 0 14 14"
      color={colors.textSecondary}
      fill="transparent"
      className="chakra-icon"
      {...props}
    >
      <rect x="0.5" y="0.5" width="13" height="13" rx="1.5" stroke="currentColor" />
      <path
        d="M4.48 10.5C4.2149 10.5 4 10.2846 4 10.0195C4 9.75495 4.21449 9.54 4.47909 9.54C4.74368 9.54 4.95817 9.32551 4.95817 9.06091V4.93909C4.95817 4.67449 4.74368 4.46 4.47909 4.46C4.21449 4.46 4 4.24505 4 3.98046C4 3.71536 4.2149 3.5 4.48 3.5H6.85413C7.80551 3.5 8.53263 3.73667 9.0355 4.21C9.54517 4.68333 9.8 5.39667 9.8 6.35V7.66C9.8 8.61333 9.54517 9.32667 9.0355 9.8C8.53263 10.2667 7.80551 10.5 6.85413 10.5H4.48ZM6.06924 8.72492C6.06924 9.16403 6.42521 9.52 6.86432 9.52C7.48272 9.52 7.94142 9.36667 8.24042 9.06C8.53943 8.75333 8.68893 8.29667 8.68893 7.69V6.31C8.68893 5.69667 8.53943 5.24 8.24042 4.94C7.94142 4.64 7.48272 4.49 6.86432 4.49C6.42521 4.49 6.06924 4.84597 6.06924 5.28508V8.72492Z"
        fill="currentColor"
      />
    </svg>
  )
})
