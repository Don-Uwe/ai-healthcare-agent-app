import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { forwardRef } from '@chakra-ui/react'

export default forwardRef(function CircleCheckBreaker(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 14 14"
      width={14}
      height={14}
      fill="none"
      focusable="false"
      stroke={colors.semanticSuccess}
      strokeWidth="1.16667"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="chakra-icon"
      {...props}
    >
      <path d="M12.8307 6.46407V7.00074C12.83 8.25865 12.4227 9.48263 11.6695 10.4901C10.9163 11.4976 9.85765 12.2347 8.65135 12.5913C7.44506 12.948 6.1558 12.9052 4.97584 12.4692C3.79588 12.0333 2.78844 11.2276 2.10379 10.1724C1.41913 9.11709 1.09394 7.86877 1.17671 6.61359C1.25947 5.3584 1.74577 4.16359 2.56306 3.20736C3.38035 2.25113 4.48485 1.58471 5.71184 1.30749C6.93883 1.03027 8.22255 1.1571 9.37157 1.66907" />
      <path d="M12.8333 2.33203L7 8.1712L5.25 6.4212" />
    </svg>
  )
})
