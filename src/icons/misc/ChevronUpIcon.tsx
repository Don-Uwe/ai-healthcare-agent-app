import { SvgIcon } from '../type'

export default function ChevronUpIcon(props: SvgIcon) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="chakra-icon"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 15L12 9L6 15" />
    </svg>
  )
}
