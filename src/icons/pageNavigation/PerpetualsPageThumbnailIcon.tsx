import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { ColorMode } from '@chakra-ui/react'

/** used in mobile nav bottom bar */
export default function PerpetualsPageThumbnailIcon(props: SvgIcon & { isActive?: boolean; colorMode?: ColorMode }) {
  const { colorMode, isActive, color = isActive && colorMode === 'light' ? colors.secondary : colors.textSecondary, ...restProps } = props

  return isActive ? (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...restProps} className="chakra-icon" xmlns="http://www.w3.org/2000/svg">
      <circle opacity="0.8" cx="11" cy="11" r="4" fill="#8C6EEF" />
      <rect x="3.5" y="5" width="5" height="10" rx="1" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5V1.5" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18.5V15" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="11.5" y="6.5" width="5" height="7" rx="1" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6.5V3" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 17.5V13.5" stroke="#ECF5FF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...restProps} className="chakra-icon" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="5.5" width="4" height="9" rx="0.5" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.5V1.5" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 18.5V14.5" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12" y="7" width="4" height="6" rx="0.5" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6.5V3" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 17.5V13.5" stroke="#BFD2FF" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
