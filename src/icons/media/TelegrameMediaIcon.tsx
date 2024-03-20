import { SvgIcon } from '../type'

/** used in PC nav top bar */
export default function TelegrameMediaIcon(props: SvgIcon) {
  const { width = 32, height = 32, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 32 32" {...restProps}>
      <path
        d="M23.2253 10.1512C23.344 9.38411 22.6147 8.77862 21.9326 9.07809L8.34745 15.0427C7.85831 15.2575 7.89409 15.9983 8.4014 16.1599L11.203 17.0521C11.7377 17.2223 12.3167 17.1343 12.7836 16.8117L19.1 12.4479C19.2904 12.3163 19.4981 12.5871 19.3353 12.7549L14.7887 17.4425C14.3476 17.8972 14.4352 18.6678 14.9657 19.0005L20.0562 22.1927C20.6271 22.5507 21.3616 22.191 21.4684 21.5011L23.2253 10.1512Z"
        fill="currentcolor"
      />
    </svg>
  )
}
