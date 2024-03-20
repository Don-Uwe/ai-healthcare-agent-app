import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { forwardRef } from '@chakra-ui/react'

export default forwardRef(function AddLiquidityPlus(props: SvgIcon, ref) {
  return (
    <svg ref={ref} width="42" height="42" viewBox="0 0 42 42" fill="none" stroke="none" {...props}>
      <circle cx="21" cy="21" r="18.375" fill={colors.iconBg} />
      <path
        d="M12.5625 20.2935V21.6998C12.5625 21.8248 12.625 21.8873 12.75 21.8873H20.1094V28.8711C20.1094 28.9961 20.1719 29.0586 20.2969 29.0586H21.7031C21.8281 29.0586 21.8906 28.9961 21.8906 28.8711V21.8873H29.25C29.375 21.8873 29.4375 21.8248 29.4375 21.6998V20.2935C29.4375 20.1685 29.375 20.106 29.25 20.106H21.8906V13.1211C21.8906 12.9961 21.8281 12.9336 21.7031 12.9336H20.2969C20.1719 12.9336 20.1094 12.9961 20.1094 13.1211V20.106H12.75C12.625 20.106 12.5625 20.1685 12.5625 20.2935Z"
        fill={colors.iconEmptyStroke}
      />
    </svg>
  )
})
