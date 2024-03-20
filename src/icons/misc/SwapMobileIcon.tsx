import { forwardRef } from 'react'
import { SvgIcon } from '../type'
import { useColorMode } from '@chakra-ui/react'

export default forwardRef(function SwapMobileIcon(props: SvgIcon, ref: any) {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const colorFill = isLight ? '#474ABB' : "#ABC4FF"
  return (
    <svg ref={ref} width={14} height={14} viewBox="0 0 14 14" fill={colorFill} className="chakra-icon" {...props}>
      <path d="M12.2525 8.25H1.37908C1.31033 8.25 1.25408 8.30625 1.25408 8.375V9.3125C1.25408 9.38125 1.31033 9.4375 1.37908 9.4375H10.8353L8.58064 12.2969C8.51658 12.3781 8.57439 12.5 8.67908 12.5H9.81189C9.88845 12.5 9.96033 12.4656 10.0088 12.4047L12.6463 9.05938C12.9041 8.73125 12.6713 8.25 12.2525 8.25V8.25ZM12.6291 4.5625H3.17283L5.42752 1.70313C5.49158 1.62188 5.43376 1.5 5.32908 1.5H4.19626C4.1197 1.5 4.04783 1.53438 3.99939 1.59531L1.36189 4.94063C1.10408 5.26875 1.33689 5.75 1.75408 5.75H12.6291C12.6978 5.75 12.7541 5.69375 12.7541 5.625V4.6875C12.7541 4.61875 12.6978 4.5625 12.6291 4.5625Z"/>
    </svg>
  )
})
