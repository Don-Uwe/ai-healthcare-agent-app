import { forwardRef } from 'react'
import { SvgIcon } from '../type'

export default forwardRef(function RemoveTokenIcon(props: SvgIcon, ref: any) {
  return (
    <svg ref={ref} width="12" height="14" viewBox="0 0 12 14" fill="currentColor" className="chakra-icon" {...props}>
      <path
        d="M11.5 3H9.5V1.75C9.5 1.19844 9.05156 0.75 8.5 0.75H3.5C2.94844 0.75 2.5 1.19844 2.5 1.75V3H0.5C0.223437 3 0 3.22344 0 3.5L0 4C0 4.06875 0.05625 4.125 0.125 4.125H1.06875L1.45469 12.2969C1.47969 12.8297 1.92031 13.25 2.45312 13.25H9.54688C10.0813 13.25 10.5203 12.8313 10.5453 12.2969L10.9312 4.125H11.875C11.9438 4.125 12 4.06875 12 4V3.5C12 3.22344 11.7766 3 11.5 3ZM3.625 1.875H8.375V3H3.625V1.875ZM9.42656 12.125H2.57344L2.19531 4.125H9.80469L9.42656 12.125Z"
        fill="#22D1F8"
      />
    </svg>
  )
})
