import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { Box } from '@chakra-ui/react'

export default function TealCircleCheckBadge(props: SvgIcon) {
  const { width = '14px', height = '14px', color = colors.secondary } = props

  return (
    <Box {...props} width={width} height={height}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 14 14"
        fill={color}
        stroke="none"
        className="chakra-icon"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="7" cy="7" r="7" fill="#141041" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM10.815 5.18184C11.0617 4.91148 11.0617 4.47313 10.815 4.20277C10.5684 3.93241 10.1685 3.93241 9.92183 4.20277L6.15789 8.32862L4.07817 6.04893C3.83153 5.77856 3.43163 5.77856 3.18499 6.04893C2.93834 6.31929 2.93834 6.75763 3.18499 7.028L5.7113 9.79723C5.95795 10.0676 6.35784 10.0676 6.60449 9.79723L10.815 5.18184Z"
          fill="#39D0D8"
        />
      </svg>
    </Box>
  )
}
