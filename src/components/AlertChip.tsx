import WarningIcon from '@/icons/misc/WarningIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Collapse, HStack, Spacer, useColorMode } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { X } from 'react-feather'

export function AlertChip(props: { isOpen?: boolean; onClose?: () => void; alertContent?: ReactNode }) {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  return (
    <Collapse in={props.isOpen}>
      <HStack
        bg={isLight ? 'rgba(254, 211, 58, 0.30)' : 'rgba(254, 211, 58, 0.10)'}
        color={colors.semanticWarning}
        rounded={'md'}
        py={3}
        px={3}
      >
        <Box flex={0}>
          <WarningIcon />
        </Box>
        <Box fontSize={['xs', 'sm']}>{props.alertContent}</Box>
        <Spacer />
        <Box flex={0}>
          <X width={'18px'} height={'18px'} onClick={props.onClose} />
        </Box>
      </HStack>
    </Collapse>
  )
}
