import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function SwapPageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
  const { colorMode, isActive, color = isActive && colorMode === 'light' ? colors.secondary : colors.textSecondary, ...restProps } = props

  return isActive ? (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      stroke={color}
      fill="none"
      className="chakra-icon"
      strokeWidth="1.4"
      strokeLinecap="round"
      {...restProps}
    >
      <circle opacity={colorMode === 'light' ? '0.4' : '0.8'} cx="11" cy="11" r="4" stroke="none" fill="#8C6EEF" />
      <path d="M17 9.5V6.5625C17 6.01022 16.5523 5.5625 16 5.5625H3M3 5.5625L6.37931 2.5M3 5.5625L6.37931 8.625" />
      <path d="M3 10.5V13.4375C3 13.9898 3.44772 14.4375 4 14.4375L17 14.4375M17 14.4375L13.6207 17.5M17 14.4375L13.6207 11.375" />
    </svg>
  ) : (
    <svg width={20} height={20} viewBox="0 0 20 20" stroke={color} fill="none" className="chakra-icon" strokeLinecap="round" {...restProps}>
      <path d="M17 9.5V6.5625C17 6.01022 16.5523 5.5625 16 5.5625H3M3 5.5625L6.37931 2.5M3 5.5625L6.37931 8.625" />
      <path d="M3 10.5V13.4375C3 13.9898 3.44772 14.4375 4 14.4375L17 14.4375M17 14.4375L13.6207 17.5M17 14.4375L13.6207 11.375" />
    </svg>
  )
}
