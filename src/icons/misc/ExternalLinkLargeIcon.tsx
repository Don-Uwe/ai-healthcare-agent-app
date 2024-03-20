import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

export default function ExternalLinkLargeIcon(props: SvgIcon) {
  const { width = 14, height = 14, color = colors.priceFloatingUp } = props

  return (
    <svg
      className="chakra-icon"
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      stroke={color}
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10.5 7.58333V11.0833C10.5 11.3928 10.3771 11.6895 10.1583 11.9083C9.9395 12.1271 9.64275 12.25 9.33333 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V4.66667C1.75 4.35725 1.87292 4.0605 2.09171 3.84171C2.3105 3.62292 2.60725 3.5 2.91667 3.5H6.41667" />
      <path d="M8.75 1.75H12.25V5.25" />
      <path d="M5.83594 8.16667L12.2526 1.75" />
    </svg>
  )
}
