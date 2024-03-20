import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function MorePageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
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
      strokeLinejoin="round"
      {...restProps}
    >
      <circle opacity={colorMode === 'light' ? '0.4' : '0.8'} cx="11" cy="11" r="4" fill="#8C6EEF" stroke="none" />
      <path d="M17.4974 11.668H11.6641V17.5013H17.4974V11.668Z" />
      <path d="M8.33333 11.668H2.5V17.5013H8.33333V11.668Z" />
      <path d="M17.4974 2.5H11.6641V8.33333H17.4974V2.5Z" />
      <path d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z" />
    </svg>
  ) : (
    <svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      stroke={color}
      fill="none"
      className="chakra-icon"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...restProps}
    >
      <path d="M17.4974 11.668H11.6641V17.5013H17.4974V11.668Z" />
      <path d="M8.33333 11.668H2.5V17.5013H8.33333V11.668Z" />
      <path d="M17.4974 2.5H11.6641V8.33333H17.4974V2.5Z" />
      <path d="M8.33333 2.5H2.5V8.33333H8.33333V2.5Z" />
    </svg>
  )
}
