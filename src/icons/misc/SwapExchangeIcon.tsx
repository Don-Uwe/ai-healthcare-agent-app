import { SvgIcon } from '../type'

export default function SwapExchangeIcon(props: SvgIcon) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" fill="none" focusable="false" className="chakra-icon" {...props}>
      <rect x="4" y="6" width="6" height="7" fill="#8C6EEF" />
      <rect x="11" y="6" width="3" height="7" fill="#22D1F8" />
      <path d="M4 17L2 14.5" stroke="#22D1F8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M16 10V11.5C16 12.2956 15.6722 13.0587 15.0888 13.6213C14.5053 14.1839 13.714 14.5 12.8889 14.5H2"
        stroke="#22D1F8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 1.5L16 4" stroke="#22D1F8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M2 8V6.66667C2 5.95942 2.32778 5.28115 2.91122 4.78105C3.49467 4.28095 4.28599 4 5.11111 4H16"
        stroke="#22D1F8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
