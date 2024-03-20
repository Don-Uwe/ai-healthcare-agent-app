import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function PolygonNetworkIcon(props: SvgIcon) {
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
        <g clipPath="url(#clip0_25054_70904)">
          <g filter="url(#filter0_b_25054_70904)">
            <path
              d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
              fill="white"
            />
          </g>
          <g clipPath="url(#clip1_25054_70904)">
            <path
              d="M33.4701 18.134C32.8433 17.7758 32.0373 17.7758 31.3209 18.134L26.306 21.0893L22.903 22.9699L17.9776 25.9251C17.3507 26.2833 16.5448 26.2833 15.8284 25.9251L11.9776 23.5967C11.3507 23.2385 10.903 22.5221 10.903 21.7161V17.2385C10.903 16.5221 11.2612 15.8057 11.9776 15.3579L15.8284 13.1191C16.4552 12.7609 17.2612 12.7609 17.9776 13.1191L21.8284 15.4475C22.4552 15.8057 22.903 16.5221 22.903 17.3281V20.2833L26.306 18.3131V15.2684C26.306 14.5519 25.9478 13.8355 25.2313 13.3878L18.0672 9.17881C17.4403 8.8206 16.6343 8.8206 15.9179 9.17881L8.57463 13.4773C7.85821 13.8355 7.5 14.5519 7.5 15.2684V23.6863C7.5 24.4027 7.85821 25.1191 8.57463 25.5669L15.8284 29.7758C16.4552 30.134 17.2612 30.134 17.9776 29.7758L22.903 26.9102L26.306 24.94L31.2313 22.0743C31.8582 21.7161 32.6642 21.7161 33.3806 22.0743L37.2313 24.3131C37.8582 24.6714 38.306 25.3878 38.306 26.1937V30.6714C38.306 31.3878 37.9478 32.1042 37.2313 32.5519L33.4701 34.7908C32.8433 35.149 32.0373 35.149 31.3209 34.7908L27.4701 32.5519C26.8433 32.1937 26.3955 31.4773 26.3955 30.6714V27.8057L22.9925 29.7758V32.7311C22.9925 33.4475 23.3507 34.1639 24.0672 34.6116L31.3209 38.8206C31.9478 39.1788 32.7537 39.1788 33.4701 38.8206L40.7239 34.6116C41.3507 34.2534 41.7985 33.537 41.7985 32.7311V24.2236C41.7985 23.5072 41.4403 22.7908 40.7239 22.343L33.4701 18.134Z"
              fill="#8247E5"
            />
          </g>
        </g>
        <defs>
          <filter
            id="filter0_b_25054_70904"
            x="-3.2"
            y="-3.2"
            width="54.4"
            height="54.4"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="1.6" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_25054_70904" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_25054_70904" result="shape" />
          </filter>
          <clipPath id="clip0_25054_70904">
            <rect width="48" height="48" fill="white" />
          </clipPath>
          <clipPath id="clip1_25054_70904">
            <rect width="34.3881" height="30" fill="white" transform="translate(7.5 9)" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  )
}
