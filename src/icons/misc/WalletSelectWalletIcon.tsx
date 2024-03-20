import { SvgIcon } from '../type'
import { Box } from '@chakra-ui/react'

export default function WalletSelectWalletIcon(props: SvgIcon) {
  const { width = '20px', height = '20px', color = 'currentColor' } = props

  return (
    <Box {...props} width={width} height={height}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 20 20"
        stroke={color}
        fill="none"
        className="chakra-icon"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 7V5.14286C3 4.51167 3.38802 4 3.86667 4L15.1333 3C15.612 3 16 3.51167 16 4.14286V6.07143" />
          <rect x="3" y="6" width="14" height="11" rx="1" />
        </svg>
      </svg>
    </Box>
  )
}
