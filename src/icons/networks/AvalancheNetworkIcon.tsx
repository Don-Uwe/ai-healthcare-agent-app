import { Box } from '@chakra-ui/react'
import { SvgIcon } from '../type'

export default function AvalancheNetworkIcon(props: SvgIcon) {
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
        <g clipPath="url(#clip0_25054_73731)">
          <g filter="url(#filter0_b_25054_73731)">
            <path
              d="M24 48C37.2548 48 48 37.2548 48 24C48 10.7452 37.2548 0 24 0C10.7452 0 0 10.7452 0 24C0 37.2548 10.7452 48 24 48Z"
              fill="url(#paint0_linear_25054_73731)"
            />
          </g>
          <path d="M39 6H9V36H39V6Z" fill="white" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M48 24C48 37.255 37.255 48 24 48C10.7452 48 0 37.255 0 24C0 10.7452 10.7452 0 24 0C37.255 0 48 10.7452 48 24ZM17.1991 33.5508H12.5414C11.5626 33.5508 11.0792 33.5508 10.7844 33.3622C10.466 33.1558 10.2715 32.8139 10.2479 32.4364C10.2302 32.0887 10.4719 31.6641 10.9554 30.8151L22.4559 10.5439C22.9452 9.68306 23.1929 9.25266 23.5053 9.09348C23.8414 8.9225 24.2423 8.9225 24.5784 9.09348C24.8909 9.25266 25.1385 9.68306 25.6278 10.5439L27.9921 14.671L28.0042 14.692C28.5327 15.6155 28.8007 16.0838 28.9178 16.5753C29.0474 17.1118 29.0474 17.6778 28.9178 18.2144C28.7998 18.7096 28.5345 19.1813 27.998 20.1187L21.9571 30.7974L21.9414 30.8248C21.4094 31.7558 21.1398 32.2277 20.7661 32.5838C20.3593 32.973 19.8699 33.2558 19.3334 33.4153C18.844 33.5508 18.2957 33.5508 17.1991 33.5508ZM28.9614 33.5508H35.6354C36.62 33.5508 37.1153 33.5508 37.4103 33.3565C37.7286 33.15 37.929 32.802 37.9468 32.4249C37.9638 32.0884 37.7273 31.6803 37.2639 30.8807C37.2479 30.8534 37.232 30.8257 37.2157 30.7975L33.8726 25.0786L33.8346 25.0142C33.3648 24.2198 33.1277 23.8186 32.8231 23.6636C32.4872 23.4925 32.0919 23.4925 31.756 23.6636C31.4494 23.8227 31.2018 24.2413 30.7125 25.0844L27.3813 30.8034L27.3699 30.8231C26.8822 31.6649 26.6385 32.0855 26.6561 32.4307C26.6797 32.8081 26.8742 33.1558 27.1926 33.3622C27.4815 33.5508 27.9768 33.5508 28.9614 33.5508Z"
            fill="#E84142"
          />
        </g>
        <defs>
          <filter
            id="filter0_b_25054_73731"
            x="-3.2"
            y="-3.2"
            width="54.4"
            height="54.4"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="1.6" />
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_25054_73731" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_25054_73731" result="shape" />
          </filter>
          <linearGradient id="paint0_linear_25054_73731" x1="24" y1="0" x2="62.444" y2="28.5514" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ABC4FF" stopOpacity="0.2" />
            <stop offset="1" stopColor="#ABC4FF" stopOpacity="0" />
          </linearGradient>
          <clipPath id="clip0_25054_73731">
            <rect width="48" height="48" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </Box>
  )
}
