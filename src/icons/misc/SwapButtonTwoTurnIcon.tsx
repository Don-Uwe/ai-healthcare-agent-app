import { colors } from '@/theme/cssVariables'
import { SvgIcon } from '../type'

export default function SwapButtonTwoTurnIcon(props: SvgIcon) {
  return (
    <svg width="78" height="78" viewBox="0 0 78 78" fill="none" focusable="false" className="chakra-icon" {...props}>
      <g filter="url(#filter0_d_24822_31816)">
        <circle cx="39" cy="39" r="21" fill={colors.iconBg} />
      </g>
      <path
        d="M41.1417 29.9968V48.637C41.1417 48.7548 41.2382 48.8513 41.356 48.8513H42.9632C43.081 48.8513 43.1775 48.7548 43.1775 48.637V32.4263L48.0792 36.2914C48.2185 36.4013 48.4275 36.3022 48.4275 36.1227V34.1807C48.4275 34.0495 48.3685 33.9263 48.2641 33.8432L42.5292 29.3218C41.9667 28.8798 41.1417 29.2789 41.1417 29.9968ZM34.8203 29.3513V45.562L29.9185 41.6968C29.7792 41.587 29.5703 41.6861 29.5703 41.8656V43.8075C29.5703 43.9388 29.6292 44.062 29.7337 44.145L35.4685 48.6664C36.031 49.1084 36.856 48.7093 36.856 47.9941V29.3513C36.856 29.2334 36.7596 29.137 36.6417 29.137H35.0346C34.9167 29.137 34.8203 29.2334 34.8203 29.3513Z"
        fill={colors.iconEmptyStroke}
      />
      <defs>
        <filter id="filter0_d_24822_31816" x="0" y="0" width="78" height="78" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
          <feMorphology radius="6" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_24822_31816" />
          <feOffset />
          <feGaussianBlur stdDeviation="6" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.635294 0 0 0 0 0.34902 0 0 0 0 1 0 0 0 0.3 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_24822_31816" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_24822_31816" result="shape" />
        </filter>
      </defs>
    </svg>
  )
}
