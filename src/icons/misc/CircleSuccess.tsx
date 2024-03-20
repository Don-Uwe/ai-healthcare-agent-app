import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'
import { Box } from '@chakra-ui/react'

/** use color semanticSuccess */
export default function CircleSuccess(props: SvgIcon) {
  const { width = '16px', height = '16px', color = colors.semanticSuccess } = props

  return (
    <Box {...props} color={color} width={width} height={height}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 16 16"
        stroke="none"
        fill="currentColor"
        className="chakra-icon"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.3392 5.16016H10.5017C10.3196 5.16016 10.1464 5.24766 10.0392 5.39766L7.23209 9.29051L5.96066 7.52623C5.85352 7.37801 5.68209 7.28873 5.49816 7.28873H4.66066C4.54459 7.28873 4.47673 7.42087 4.54459 7.51551L6.76959 10.6012C6.82215 10.6746 6.89145 10.7344 6.97172 10.7756C7.052 10.8168 7.14095 10.8384 7.2312 10.8384C7.32145 10.8384 7.4104 10.8168 7.49067 10.7756C7.57095 10.7344 7.64024 10.6746 7.6928 10.6012L11.4535 5.38694C11.5232 5.2923 11.4553 5.16016 11.3392 5.16016Z" />
        <path d="M8 0C3.58214 0 0 3.58214 0 8C0 12.4179 3.58214 16 8 16C12.4179 16 16 12.4179 16 8C16 3.58214 12.4179 0 8 0ZM8 14.6429C4.33214 14.6429 1.35714 11.6679 1.35714 8C1.35714 4.33214 4.33214 1.35714 8 1.35714C11.6679 1.35714 14.6429 4.33214 14.6429 8C14.6429 11.6679 11.6679 14.6429 8 14.6429Z" />
      </svg>
    </Box>
  )
}
