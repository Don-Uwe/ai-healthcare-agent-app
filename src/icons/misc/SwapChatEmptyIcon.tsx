import { SvgIcon } from '../type'

export default function SwapChatEmptyIcon(props: SvgIcon) {
  return (
    <svg viewBox="0 0 18 18" width={18} height={18} fill="none" focusable="false" className="chakra-icon" {...props}>
      <path d="M1 2.5V15.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="6.5" width="2" height="6" stroke="currentColor" />
      <rect x="9" y="4.5" width="2" height="8" stroke="currentColor" />
      <rect x="14" y="2.5" width="2" height="10" stroke="currentColor" />
    </svg>
  )
}
