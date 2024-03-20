import { forwardRef } from '@chakra-ui/react'
import { SvgIcon } from '../type'

/** use currentColor */
export default forwardRef(function CircleArrowRight(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className="chakra-icon"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
      <path d="M12 16L16 12L12 8" />
      <path d="M8 12H16" />
    </svg>
  )
})
