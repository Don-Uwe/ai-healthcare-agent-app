import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'

export default function MenuHamburgerNavIcon(props: SvgIcon) {
  const { width = 40, height = 40, color = colors.textSecondary } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 40 40"
      stroke={color}
      fill="none"
      className="chakra-icon"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 26H29" />
      <path d="M11 20H29" />
      <path d="M11 14H29" />
    </svg>
  )
}
