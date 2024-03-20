import { SvgIcon } from '../type'

export default function PlusCircleIcon(props: SvgIcon) {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      className="chakra-icon"
      stroke="currentColor"
      strokeWidth="2.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path
        d="M14.0026 25.6654C20.4459 25.6654 25.6693 20.442 25.6693 13.9987C25.6693 7.55538 20.4459 2.33203 14.0026 2.33203C7.55928 2.33203 2.33594 7.55538 2.33594 13.9987C2.33594 20.442 7.55928 25.6654 14.0026 25.6654Z"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path d="M14 9.33203V18.6654" stroke="currentColor" />
      <path d="M9.33594 14H18.6693" stroke="currentColor" />
    </svg>
  )
}
