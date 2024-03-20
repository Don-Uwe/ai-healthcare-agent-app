import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { forwardRef } from '@chakra-ui/react'

export default forwardRef(function WarningIcon(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      width="14"
      height="15"
      viewBox="0 0 14 15"
      fill="none"
      stroke={colors.semanticWarning}
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6.00343 3.18269L1.06259 11.431C0.960726 11.6074 0.906825 11.8075 0.906255 12.0112C0.905684 12.2149 0.958464 12.4152 1.05934 12.5922C1.16022 12.7691 1.30568 12.9166 1.48126 13.0199C1.65683 13.1233 1.85639 13.1788 2.06009 13.181H11.9418C12.1455 13.1788 12.345 13.1233 12.5206 13.0199C12.6962 12.9166 12.8416 12.7691 12.9425 12.5922C13.0434 12.4152 13.0962 12.2149 13.0956 12.0112C13.095 11.8075 13.0411 11.6074 12.9393 11.431L7.99843 3.18269C7.89444 3.01126 7.74802 2.86951 7.57329 2.77114C7.39857 2.67277 7.20144 2.62109 7.00093 2.62109C6.80042 2.62109 6.60329 2.67277 6.42856 2.77114C6.25384 2.86951 6.10742 3.01126 6.00343 3.18269V3.18269Z" />
      <path d="M7 6.17969V8.51302" />
      <path d="M7 10.8477H7.00565" />
    </svg>
  )
})
