import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function ChevronRightIcon(props: SvgIcon) {
  const { width = '18px', height = '18px' } = props
  return (
    <Box {...props} display="inline-block" width={width} height={height}>
      <svg width="100%" height="100%" viewBox="0 0 18 18" fill="none">
        <path d="M6.75 13.5L11.25 9L6.75 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </Box>
  )
}
