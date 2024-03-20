import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function BinanceNetworkIcon(props: SvgIcon) {
  const { width = '48px', height = '48px', ...restProps } = props

  return (
    <Box {...restProps} width={width} height={height}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 48 48"
        fill="none"
        className="chakra-icon"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...restProps}
      >
        <g clipPath="url(#clip0_25054_70897)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24 0C37.2558 0 48 10.7442 48 24C48 37.2558 37.2558 48 24 48C10.7442 48 0 37.2558 0 24C0 10.7442 10.7442 0 24 0Z"
            fill="#F0B90B"
          />
          <path
            d="M13.1912 24L13.2085 30.3462L18.6008 33.5192V37.2346L10.0527 32.2212V22.1442L13.1912 24ZM13.1912 17.6539V21.3519L10.0508 19.4942V15.7962L13.1912 13.9385L16.3469 15.7962L13.1912 17.6539ZM20.8527 15.7962L23.9931 13.9385L27.1489 15.7962L23.9931 17.6539L20.8527 15.7962Z"
            fill="white"
          />
          <path
            d="M15.4609 29.0308V25.3154L18.6013 27.1731V30.8712L15.4609 29.0308ZM20.8532 34.85L23.9936 36.7077L27.1494 34.85V38.5481L23.9936 40.4058L20.8532 38.5481V34.85ZM31.6532 15.7962L34.7936 13.9385L37.9494 15.7962V19.4942L34.7936 21.3519V17.6539L31.6532 15.7962ZM34.7936 30.3462L34.8109 24L37.9513 22.1423V32.2192L29.4032 37.2327V33.5173L34.7936 30.3462Z"
            fill="white"
          />
          <path d="M32.5388 29.0308L29.3984 30.8712V27.1731L32.5388 25.3154V29.0308Z" fill="white" />
          <path
            d="M32.5417 18.9687L32.559 22.6841L27.1513 25.8572V32.2187L24.0109 34.0591L20.8706 32.2187V25.8572L15.4629 22.6841V18.9687L18.6167 17.1111L23.9917 20.2995L29.3994 17.1111L32.5552 18.9687H32.5417ZM15.4609 12.6245L23.9936 7.59375L32.5417 12.6245L29.4013 14.4822L23.9936 11.2937L18.6013 14.4822L15.4609 12.6245Z"
            fill="white"
          />
        </g>
        <defs>
          <clipPath id="clip0_25054_70897">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  )
}
