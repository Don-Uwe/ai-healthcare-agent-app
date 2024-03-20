import SortDownIcon from '@/icons/misc/SortDownIcon'
import { SvgIcon } from '@/icons/type'
import { Box } from '@chakra-ui/react'

export default function SortUpDownArrow(props: SvgIcon & { isDown?: boolean }) {
  const { width = 6, height = 6, isDown, ...restProps } = props
  return (
    <Box {...restProps} width={width} height={height} transition="300ms" transform={`rotateZ(${isDown ? '180deg' : '0deg'})`}>
      <SortDownIcon />
    </Box>
  )
}
