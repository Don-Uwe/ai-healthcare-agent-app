import { SvgIcon } from '../type'

/** used in PC nav top bar */
export default function TwitterMediaIcon(props: SvgIcon) {
  const { width = 32, height = 32, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 32 32" {...restProps}>
      <path
        d="M17.3319 14.925L22.5437 9H21.3087L16.7833 14.1446L13.1688 9H9L14.4657 16.7795L9 22.9928H10.2351L15.0141 17.5599L18.8312 22.9928H23L17.3316 14.925H17.3319ZM15.6403 16.8481L15.0865 16.0734L10.6801 9.90931H12.5772L16.1331 14.8839L16.6869 15.6586L21.3093 22.1249H19.4122L15.6403 16.8484V16.8481Z"
        fill="currentcolor"
      />
    </svg>
  )
}
