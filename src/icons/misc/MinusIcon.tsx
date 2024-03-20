import { SvgIcon } from '../type'

export default function MinusIcon(props: SvgIcon) {
  return (
    <svg width={8} height={2} viewBox="0 0 8 2" fill="currentColor" className="chakra-icon" {...props}>
      <path
        d="M1 2C0.447715 2 0 1.55228 0 1C0 0.447715 0.447715 0 1 0H7C7.55228 0 8 0.447715 8 1C8 1.55228 7.55228 2 7 2H1Z"
        fill="currentColor"
      />
    </svg>
  )
}
