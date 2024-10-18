import { SvgIcon } from '../type'

export default function CreditCardIcon(props: SvgIcon) {
  const { width = 18, height = 18 } = props

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      className="chakra-icon"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0.75 7.5H17.25" stroke="#22D1F8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M15.75 3H2.25C1.42157 3 0.75 3.67157 0.75 4.5V13.5C0.75 14.3284 1.42157 15 2.25 15H15.75C16.5784 15 17.25 14.3284 17.25 13.5V4.5C17.25 3.67157 16.5784 3 15.75 3Z"
        stroke="#22D1F8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="10.25" width="2.5" height="1.5" fill="#8C6EEF" />
      <rect x="6.5" y="10.25" width="2.5" height="1.5" fill="#8C6EEF" />
      <rect x="10" y="10.25" width="2.5" height="1.5" fill="#8C6EEF" />
    </svg>
  )
}
