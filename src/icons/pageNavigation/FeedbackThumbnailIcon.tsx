import { SvgIcon } from '../type'

/** used in PC nav top bar */
export default function FeedbackThumbnailIcon(props: SvgIcon) {
  const { width = 14, height = 14, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 14 14" {...restProps}>
      <path
        d="M11.668 1.16602H2.33464C1.69297 1.16602 1.1738 1.69102 1.1738 2.33268L1.16797 12.8327L3.5013 10.4993H11.668C12.3096 10.4993 12.8346 9.97435 12.8346 9.33268V2.33268C12.8346 1.69102 12.3096 1.16602 11.668 1.16602ZM10.5013 8.16602H3.5013V6.99935H10.5013V8.16602ZM10.5013 6.41602H3.5013V5.24935H10.5013V6.41602ZM10.5013 4.66602H3.5013V3.49935H10.5013V4.66602Z"
        fill="currentColor"
      />
    </svg>
  )
}
