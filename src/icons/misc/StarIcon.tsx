import { Box } from '@chakra-ui/react'
import { colors } from '@/theme/cssVariables'

import { SvgIcon } from '../type'

type StarIconProps = SvgIcon & {
  selected?: boolean
}

export default function StarIcon(props: StarIconProps) {
  const { width = '16px', height = '16px', selected = false, sx } = props

  let bodyFill = colors.textSecondary
  let bodyOpacity = '0.1'
  let borderColor = colors.textSecondary
  let borderOpacity = '0.5'
  if (selected) {
    bodyFill = colors.selectActiveSecondary
    bodyOpacity = '1'
    borderColor = colors.selectActiveSecondary
    borderOpacity = '1'
  }

  return (
    <Box
      as="svg"
      sx={sx}
      width={width}
      height={height}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="chakra-icon"
      {...props}
    >
      <path
        d="M8.00938 2.97656L6.53438 5.96562L3.23438 6.44531L5.62188 8.77343L5.05781 12.0594L8.00938 10.5078L10.9609 12.0578L10.3969 8.77187L12.7844 6.44531L9.48438 5.96562L8.00938 2.97656Z"
        fill={bodyFill}
        fillOpacity={bodyOpacity}
      />
      <path
        d="M14.1965 5.51251L10.2294 4.93594L8.45591 1.34063C8.40747 1.24219 8.32779 1.16251 8.22935 1.11407C7.98248 0.992193 7.68247 1.09376 7.55904 1.34063L5.7856 4.93594L1.81841 5.51251C1.70904 5.52813 1.60904 5.57969 1.53248 5.65782C1.43992 5.75295 1.38891 5.88094 1.39067 6.01367C1.39243 6.14639 1.4468 6.27298 1.54185 6.36563L4.41216 9.16407L3.73404 13.1156C3.71814 13.2076 3.72831 13.3021 3.7634 13.3885C3.79849 13.475 3.8571 13.5498 3.93258 13.6047C4.00806 13.6595 4.09739 13.6921 4.19044 13.6987C4.28349 13.7053 4.37654 13.6858 4.45904 13.6422L8.00747 11.7766L11.5559 13.6422C11.6528 13.6938 11.7653 13.7109 11.8731 13.6922C12.145 13.6453 12.3278 13.3875 12.2809 13.1156L11.6028 9.16407L14.4731 6.36563C14.5512 6.28907 14.6028 6.18907 14.6184 6.07969C14.6606 5.80626 14.47 5.55313 14.1965 5.51251ZM10.395 8.77032L10.959 12.0563L8.00747 10.5063L5.05591 12.0578L5.61998 8.77188L3.23248 6.44376L6.53247 5.96407L8.00747 2.97501L9.48248 5.96407L12.7825 6.44376L10.395 8.77032Z"
        fill={borderColor}
        fillOpacity={borderOpacity}
      />
    </Box>
  )
}
