import { forwardRef } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default forwardRef(function InputLockIcon(props: SvgIcon, ref) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 20 20"
      width={20}
      height={20}
      fill="none"
      focusable="false"
      stroke={'currentcolor'}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="chakra-icon"
      {...props}
    >
      <path d="M14.2857 10.0011V5.42969C14.2857 3.22055 12.4949 1.42969 10.2857 1.42969H9.14286C6.93372 1.42969 5.14286 3.22055 5.14286 5.42969V10.0011M14.2857 10.0011H5.14286M14.2857 10.0011H15.3286C15.3838 10.0011 15.4286 10.0459 15.4286 10.1011V17.5725C15.4286 18.1248 14.9809 18.5725 14.4286 18.5725H5C4.44772 18.5725 4 18.1248 4 17.5725V10.1011C4 10.0459 4.04477 10.0011 4.1 10.0011H5.14286" />
    </svg>
  )
})
