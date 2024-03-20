import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function PortfolioPageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
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
      <circle opacity={colorMode === 'light' ? '0.4' : '0.8'} cx="11" cy="11" r="4" stroke="none" fill="#8C6EEF" />
      <path d="M17.5 13.3368V6.67017C17.4997 6.37789 17.4225 6.09084 17.2763 5.8378C17.13 5.58476 16.9198 5.37463 16.6667 5.2285L10.8333 1.89517C10.58 1.74889 10.2926 1.67188 10 1.67188C9.70744 1.67188 9.42003 1.74889 9.16667 1.89517L3.33333 5.2285C3.08022 5.37463 2.86998 5.58476 2.72372 5.8378C2.57745 6.09084 2.5003 6.37789 2.5 6.67017V13.3368C2.5003 13.6291 2.57745 13.9162 2.72372 14.1692C2.86998 14.4222 3.08022 14.6324 3.33333 14.7785L9.16667 18.1118C9.42003 18.2581 9.70744 18.3351 10 18.3351C10.2926 18.3351 10.58 18.2581 10.8333 18.1118L16.6667 14.7785C16.9198 14.6324 17.13 14.4222 17.2763 14.1692C17.4225 13.9162 17.4997 13.6291 17.5 13.3368Z" />
      <path d="M17.5 10L13.75 12.1667V16.4917" />
      <path d="M6.25 16.4917V12.1667L2.5 10" />
      <path d="M2.72656 5.80078L10.0016 10.0091L17.2766 5.80078" />
      <path d="M10 18.4V10" />
      <path d="M6.25 3.50781L10 5.67448L13.75 3.50781" />
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
      <path d="M17.5 13.3368V6.67017C17.4997 6.37789 17.4225 6.09084 17.2763 5.8378C17.13 5.58476 16.9198 5.37463 16.6667 5.2285L10.8333 1.89517C10.58 1.74889 10.2926 1.67188 10 1.67188C9.70744 1.67188 9.42003 1.74889 9.16667 1.89517L3.33333 5.2285C3.08022 5.37463 2.86998 5.58476 2.72372 5.8378C2.57745 6.09084 2.5003 6.37789 2.5 6.67017V13.3368C2.5003 13.6291 2.57745 13.9162 2.72372 14.1692C2.86998 14.4222 3.08022 14.6324 3.33333 14.7785L9.16667 18.1118C9.42003 18.2581 9.70744 18.3351 10 18.3351C10.2926 18.3351 10.58 18.2581 10.8333 18.1118L16.6667 14.7785C16.9198 14.6324 17.13 14.4222 17.2763 14.1692C17.4225 13.9162 17.4997 13.6291 17.5 13.3368Z" />
      <path d="M17.5 10L13.75 12.1667V16.4917" />
      <path d="M6.25 16.4917V12.1667L2.5 10" />
      <path d="M2.72656 5.80078L10.0016 10.0091L17.2766 5.80078" />
      <path d="M10 18.4V10" />
      <path d="M6.25 3.50781L10 5.67448L13.75 3.50781" />
    </svg>
  )
}
