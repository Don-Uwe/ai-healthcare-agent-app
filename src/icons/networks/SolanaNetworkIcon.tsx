import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function SolanaNetworkIcon(props: SvgIcon) {
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
        <g filter="url(#filter0_b_25054_77783)">
          <path
            d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
            fill="#0B1022"
          />
        </g>
        <path
          d="M32.4371 21.7449C32.2842 21.5881 32.0768 21.5 31.8605 21.5H11.9087C11.5452 21.5 11.3633 21.9508 11.6204 22.2143L15.5628 26.2552C15.7158 26.412 15.9232 26.5 16.1394 26.5H36.0913C36.4547 26.5 36.6367 26.0492 36.3796 25.7857L32.4371 21.7449Z"
          fill="url(#paint0_linear_25054_77783)"
        />
        <path
          d="M15.5628 29.2681C15.7158 29.1121 15.9232 29.0244 16.1394 29.0244H36.0913C36.4547 29.0244 36.6367 29.4731 36.3796 29.7354L32.4371 33.7568C32.2842 33.9129 32.0768 34.0005 31.8605 34.0005H11.9087C11.5452 34.0005 11.3633 33.5519 11.6204 33.2896L15.5628 29.2681Z"
          fill="url(#paint1_linear_25054_77783)"
        />
        <path
          d="M15.5628 14.2437C15.7158 14.0877 15.9232 14 16.1394 14H36.0913C36.4547 14 36.6367 14.4486 36.3796 14.7109L32.4371 18.7324C32.2842 18.8885 32.0768 18.9761 31.8605 18.9761H11.9087C11.5452 18.9761 11.3633 18.5274 11.6204 18.2652L15.5628 14.2437Z"
          fill="url(#paint2_linear_25054_77783)"
        />
        <defs>
          <filter
            id="filter0_b_25054_77783"
            x="-3.2"
            y="-3.2"
            width="54.4"
            height="54.4"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="1.6" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_25054_77783" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_25054_77783" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_25054_77783" x1="28.4014" y1="8.4875" x2="14.033" y2="35.3176" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="paint1_linear_25054_77783" x1="28.4014" y1="8.51441" x2="14.1398" y2="35.273" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="paint2_linear_25054_77783" x1="28.4014" y1="8.5139" x2="14.1398" y2="35.2725" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  )
}
