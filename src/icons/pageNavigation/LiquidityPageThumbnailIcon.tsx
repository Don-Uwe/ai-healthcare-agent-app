import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function LiquidityPageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
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
      <path d="M10 13.25C12.0711 13.25 13.75 11.5711 13.75 9.5C13.75 7.42893 12.0711 5.75 10 5.75" />
      <path d="M2.5 9.5C2.5 13.6421 5.85786 17 10 17C14.1421 17 17.5 13.6421 17.5 9.5C17.5 5.35786 14.1421 2 10 2" />
    </svg>
  ) : (
    <svg width={20} height={20} viewBox="0 0 20 20" stroke={color} fill="none" className="chakra-icon" strokeLinecap="round" {...restProps}>
      <path d="M10 13.25C12.0711 13.25 13.75 11.5711 13.75 9.5C13.75 7.42893 12.0711 5.75 10 5.75" />
      <path d="M2.5 9.5C2.5 13.6421 5.85786 17 10 17C14.1421 17 17.5 13.6421 17.5 9.5C17.5 5.35786 14.1421 2 10 2" />
    </svg>
  )
}
