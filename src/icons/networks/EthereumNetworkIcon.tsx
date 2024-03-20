import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function EthereumNetworkIcon(props: SvgIcon) {
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
        <g clipPath="url(#clip0_25054_70882)">
          <g filter="url(#filter0_b_25054_70882)">
            <path
              d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
              fill="url(#paint0_linear_25054_70882)"
            />
          </g>
          <circle cx="24" cy="24" r="24" fill="white" />
          <path d="M24.0014 12L23.8047 12.6153V30.469L24.0014 30.6498L32.9984 25.7511L24.0014 12Z" fill="#343434" />
          <path d="M23.9973 12L15 25.7511L23.9973 30.6498V21.9841V12Z" fill="#8C8C8C" />
          <path d="M23.9976 32.2175L23.8867 32.342V38.7017L23.9976 38.9998L33.0001 27.3213L23.9976 32.2175Z" fill="#3C3C3B" />
          <path d="M23.9973 38.9998V32.2175L15 27.3213L23.9973 38.9998Z" fill="#8C8C8C" />
          <path d="M23.9961 30.6589L32.9931 25.7602L23.9961 21.9932V30.6589Z" fill="#141414" />
          <path d="M15 25.7602L23.9973 30.6589V21.9932L15 25.7602Z" fill="#393939" />
        </g>
        <defs>
          <filter
            id="filter0_b_25054_70882"
            x="-3.2"
            y="-3.2"
            width="54.4"
            height="54.4"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="1.6" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_25054_70882" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_25054_70882" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_25054_70882" x1="24" y1="0" x2="62.444" y2="28.5514" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ABC4FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ABC4FF" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clip0_25054_70882">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  )
}
