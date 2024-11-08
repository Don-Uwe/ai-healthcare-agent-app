import { SvgIcon } from '../type'

export default function DisclaimerThumbnailIcon(props: SvgIcon) {
  const { width = 12, height = 14, ...restProps } = props

  return (
    <svg width={width} height={height} viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...restProps}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.00521 13.8333C6.00521 13.8333 11.3385 11.1667 11.3385 7.16667V2.5L6.00521 0.5L0.671875 2.5V7.16667C0.671875 11.1667 6.00521 13.8333 6.00521 13.8333ZM5.33984 5.16667C5.33984 4.79848 5.63832 4.5 6.00651 4.5H6.01318C6.38137 4.5 6.67984 4.79848 6.67984 5.16667C6.67984 5.53486 6.38137 5.83333 6.01318 5.83333H6.00651C5.63832 5.83333 5.33984 5.53486 5.33984 5.16667ZM6.67318 7.16667C6.67318 6.79848 6.3747 6.5 6.00651 6.5C5.63832 6.5 5.33984 6.79848 5.33984 7.16667V9.83333C5.33984 10.2015 5.63832 10.5 6.00651 10.5C6.3747 10.5 6.67318 10.2015 6.67318 9.83333V7.16667Z"
        fill="#22D1F8"
      />
    </svg>
  )
}
