import { SvgIcon } from '@/icons/type'

export default function Medium(props: SvgIcon) {
  const { width = 21, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 21 20" fill="none" className="chakra-icon" {...props}>
      <path
        d="M11.4304 10.1115C11.4304 12.9344 9.15755 15.2228 6.35397 15.2228C3.55039 15.2228 1.27734 12.9338 1.27734 10.1115C1.27734 7.28909 3.55022 5 6.35397 5C9.15772 5 11.4304 7.28857 11.4304 10.1115ZM16.9995 10.1115C16.9995 12.7686 15.863 14.9235 14.4612 14.9235C13.0593 14.9235 11.9228 12.7686 11.9228 10.1115C11.9228 7.45432 13.0591 5.29942 14.461 5.29942C15.8629 5.29942 16.9993 7.45363 16.9993 10.1115H16.9995ZM19.2773 10.1115C19.2773 12.4916 18.8777 14.4223 18.3846 14.4223C17.8915 14.4223 17.4921 12.4921 17.4921 10.1115C17.4921 7.7308 17.8917 5.80063 18.3846 5.80063C18.8775 5.80063 19.2773 7.73062 19.2773 10.1115"
        fill="url(#paint0_linear_12731_11903)"
      />
      <defs>
        <linearGradient id="paint0_linear_12731_11903" x1="18.3288" y1="22.5704" x2="1.124" y2="21.4982" gradientUnits="userSpaceOnUse">
          <stop stopColor="#39D0D8" />
          <stop offset="1" stopColor="#22D1F8" />
        </linearGradient>
      </defs>
    </svg>
  )
}
