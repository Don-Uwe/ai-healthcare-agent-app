import { SvgIcon } from '../type'

export default function LiquidityLockIcon(props: SvgIcon) {
  const { width = 12, height = 13 } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="chakra-icon"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.25 3.5V5.5H4.75V3.5C4.75 2.80964 5.30964 2.25 6 2.25C6.69036 2.25 7.25 2.80964 7.25 3.5ZM3.75 3.5C3.75 2.25736 4.75736 1.25 6 1.25C7.24264 1.25 8.25 2.25736 8.25 3.5V5.5V5.75H9C9.41421 5.75 9.75 6.08579 9.75 6.5V11C9.75 11.4142 9.41421 11.75 9 11.75H3C2.58579 11.75 2.25 11.4142 2.25 11V6.5C2.25 6.08579 2.58579 5.75 3 5.75H3.75V5.5V3.5ZM3.25 10.75V6.75H8.75V10.75H3.25Z"
        fill="#BFD2FF"
      />
    </svg>
  )
}
