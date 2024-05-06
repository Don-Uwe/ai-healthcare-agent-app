import { forwardRef } from 'react'
import { SvgIcon } from '../type'
import { useColorMode } from '@chakra-ui/react'

export default forwardRef(function SwapIcon(props: SvgIcon, ref: any) {
  const { width = 16, height = 16 } = props
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const colorFill = isLight ? '#474ABB' : '#ABC4FF'
  return (
    <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill={colorFill} className="chakra-icon" {...props}>
      <path d="M13.998 9.42549H1.57079C1.49222 9.42549 1.42793 9.48978 1.42793 9.56835V10.6398C1.42793 10.7184 1.49222 10.7827 1.57079 10.7827H12.3783L9.80144 14.0507C9.72822 14.1435 9.79429 14.2828 9.91394 14.2828H11.2086C11.2961 14.2828 11.3783 14.2435 11.4336 14.1739L14.448 10.3505C14.7427 9.97551 14.4766 9.42549 13.998 9.42549V9.42549ZM14.4284 5.21106H3.62086L6.19774 1.94309C6.27096 1.85023 6.20488 1.71094 6.08523 1.71094H4.79055C4.70304 1.71094 4.6209 1.75022 4.56554 1.81987L1.55115 5.64322C1.25649 6.01823 1.52258 6.56825 1.99938 6.56825H14.4284C14.507 6.56825 14.5712 6.50396 14.5712 6.42539V5.35392C14.5712 5.27535 14.507 5.21106 14.4284 5.21106Z" />
    </svg>
  )
})
