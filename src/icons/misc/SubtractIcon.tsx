import { SvgIcon } from '../type'

export default function SubtractIcon(props: SvgIcon) {
  const { width = 14, height = 14 } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="chakra-icon"
      {...props}
    >
      <circle cx="7" cy="7" r="7" fill="#141041" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14ZM10.815 5.18184C11.0617 4.91148 11.0617 4.47313 10.815 4.20277C10.5684 3.93241 10.1685 3.93241 9.92183 4.20277L6.15789 8.32862L4.07817 6.04893C3.83153 5.77856 3.43163 5.77856 3.18499 6.04893C2.93834 6.31929 2.93834 6.75763 3.18499 7.028L5.7113 9.79723C5.95795 10.0676 6.35784 10.0676 6.60449 9.79723L10.815 5.18184Z"
        fill="#22D1F8"
      />
    </svg>
  )
}
