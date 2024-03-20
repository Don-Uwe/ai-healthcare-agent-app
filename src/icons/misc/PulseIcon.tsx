import { SvgIcon } from '../type'

export default function PulseIcon(props: SvgIcon) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke={'currentcolor'}
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="chakra-icon"
      {...props}
    >
      <path d="M14.6693 8H12.0026L10.0026 14L6.0026 2L4.0026 8H1.33594" />
    </svg>
  )
}
