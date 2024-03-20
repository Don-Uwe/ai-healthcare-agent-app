import { SvgIcon } from '../type'

/** use currentColor */
export default function CirclePlus(props: SvgIcon) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      className="chakra-icon"
      strokeWidth="1.3333"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7.9987 14.6673C11.6806 14.6673 14.6654 11.6825 14.6654 8.00065C14.6654 4.31875 11.6806 1.33398 7.9987 1.33398C4.3168 1.33398 1.33203 4.31875 1.33203 8.00065C1.33203 11.6825 4.3168 14.6673 7.9987 14.6673Z" />
      <path d="M8 5.33398V10.6673" />
      <path d="M5.33203 8H10.6654" />
    </svg>
  )
}
