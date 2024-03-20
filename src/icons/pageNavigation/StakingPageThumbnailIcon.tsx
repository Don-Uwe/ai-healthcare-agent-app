import { SvgIcon } from '../type'

/** used in PC nav top bar */
export default function StakingPageThumbnailIcon(props: SvgIcon) {
  const { width = 16, height = 16, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" {...restProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 4V7H6V4C6 2.89543 6.89543 2 8 2C9.10457 2 10 2.89543 10 4ZM5 7V4C5 2.34315 6.34315 1 8 1C9.65685 1 11 2.34315 11 4V7H12C12.5523 7 13 7.44772 13 8V14C13 14.5523 12.5523 15 12 15H4C3.44772 15 3 14.5523 3 14V8C3 7.44772 3.44772 7 4 7H5ZM11 8H10H6H5H4V14H12V8H11Z"
        fill="currentcolor"
      />
    </svg>
  )
}
