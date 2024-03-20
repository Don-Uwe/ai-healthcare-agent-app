import { SvgIcon } from '../type'

export default function ChevronLeftIcon(props: SvgIcon) {
  const { width = '18px', height = '18px', ...restProps } = props
  return (
    <svg width={width} height={height} viewBox="0 0 18 18" fill="none" {...restProps}>
      <path d="M11.25 13.5L6.75 9L11.25 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
