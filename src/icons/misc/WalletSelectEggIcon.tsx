import { SvgIcon } from '../type'
import { Box } from '@chakra-ui/react'

export default function WalletSelectEggIcon(props: SvgIcon) {
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
          <path d="M16 12.5C16 15.8137 13.3137 18.5 10 18.5C6.68629 18.5 4 15.8137 4 12.5C4 9.18629 5.5 2 10 2C14.5 2 16 9.18629 16 12.5Z" />
        </svg>
      </svg>
    </Box>
  )
}
