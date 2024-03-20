import { SvgIcon } from '../type'

export default function ExclaimationTriangle(props: SvgIcon) {
  const { width = 20, height = 20 } = props

  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none">
      <path
        d="M6.8605 2.57152L1.21384 11.9982C1.09741 12.1998 1.03581 12.4284 1.03516 12.6612C1.03451 12.894 1.09483 13.1229 1.21012 13.3252C1.32541 13.5275 1.49165 13.696 1.69231 13.8141C1.89296 13.9322 2.12103 13.9956 2.35384 13.9982H13.6472C13.88 13.9956 14.108 13.9322 14.3087 13.8141C14.5094 13.696 14.6756 13.5275 14.7909 13.3252C14.9062 13.1229 14.9665 12.894 14.9658 12.6612C14.9652 12.4284 14.9036 12.1998 14.7872 11.9982L9.1405 2.57152C9.02165 2.37559 8.85432 2.2136 8.65463 2.10117C8.45495 1.98875 8.22966 1.92969 8.0005 1.92969C7.77135 1.92969 7.54606 1.98875 7.34637 2.10117C7.14669 2.2136 6.97935 2.37559 6.8605 2.57152V2.57152Z"
        stroke="currentColor"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 6V8.66667" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 11.332H8.0075" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
