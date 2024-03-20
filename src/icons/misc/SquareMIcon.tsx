import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { forwardRef } from '@chakra-ui/react'

export default forwardRef(function SquareMIcon(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      width={14}
      height={14}
      viewBox="0 0 14 14"
      color={colors.textSecondary}
      fill="transparent"
      className="chakra-icon"
      {...props}
    >
      <rect x="0.5" y="0.5" width="13" height="13" rx="1.5" stroke="currentColor" />
      <path
        d="M3.57692 10C3.2583 10 3 9.7417 3 9.42308V4C3 3.44772 3.44772 3 4 3H4.46328C4.91596 3 5.31218 3.3041 5.42926 3.74138L6.88935 9.19508C6.90276 9.24517 6.94815 9.28 7 9.28C7.05185 9.28 7.09724 9.24517 7.11065 9.19508L8.57074 3.74138C8.68782 3.3041 9.08404 3 9.53672 3H10C10.5523 3 11 3.44772 11 4V9.42308C11 9.7417 10.7417 10 10.4231 10C10.1045 10 9.84615 9.7417 9.84615 9.42308V3.85948C9.84615 3.80454 9.80162 3.76 9.74668 3.76C9.70165 3.76 9.66223 3.79025 9.65059 3.83375L8.19846 9.25858C8.08141 9.69588 7.68517 10 7.23247 10H6.76753C6.31483 10 5.91859 9.69588 5.80154 9.25858L4.34941 3.83375C4.33777 3.79025 4.29835 3.76 4.25332 3.76C4.19838 3.76 4.15385 3.80454 4.15385 3.85948V9.42308C4.15385 9.7417 3.89555 10 3.57692 10Z"
        fill="currentColor"
      />
    </svg>
  )
})
