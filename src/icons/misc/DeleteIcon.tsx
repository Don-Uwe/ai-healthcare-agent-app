import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

export default function DeleteIcon(props: SvgIcon) {
  const { width = 24, height = 24, fill = colors.primary } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="chakra-icon"
      {...props}
    >
      <path d="M6.86406 19.6875H17.1438L17.7109 7.6875H6.29688L6.86406 19.6875Z" fill={fill} fillOpacity="0.1" />
      <path
        d="M20.25 6H17.25V4.125C17.25 3.29766 16.5773 2.625 15.75 2.625H8.25C7.42266 2.625 6.75 3.29766 6.75 4.125V6H3.75C3.33516 6 3 6.33516 3 6.75V7.5C3 7.60313 3.08437 7.6875 3.1875 7.6875H4.60312L5.18203 19.9453C5.21953 20.7445 5.88047 21.375 6.67969 21.375H17.3203C18.1219 21.375 18.7805 20.7469 18.818 19.9453L19.3969 7.6875H20.8125C20.9156 7.6875 21 7.60313 21 7.5V6.75C21 6.33516 20.6648 6 20.25 6ZM8.4375 4.3125H15.5625V6H8.4375V4.3125ZM17.1398 19.6875H6.86016L6.29297 7.6875H17.707L17.1398 19.6875Z"
        fill={fill}
      />
    </svg>
  )
}
