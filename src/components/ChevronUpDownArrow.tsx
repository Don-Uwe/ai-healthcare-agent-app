import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { SvgIcon } from '@/icons/type'
import { Box } from '@chakra-ui/react'

export default function ChevronUpDownArrow(props: SvgIcon & { isOpen?: boolean }) {
  const { isOpen, ...restProps } = props
  return (
    <Box width={6} height={6} transition="300ms" transform={`rotateZ(${isOpen ? '180deg' : '0deg'})`} {...restProps}>
      <ChevronDownIcon />
    </Box>
  )
}
