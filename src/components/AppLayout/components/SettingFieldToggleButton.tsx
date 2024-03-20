import { Box, Flex, HStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import { ChevronUp, ChevronDown } from 'react-feather'
import { colors } from '@/theme/cssVariables'

export function SettingFieldToggleButton(props: { isOpen?: boolean; renderContent?: ReactNode }) {
  return (
    <Flex
      bg={props.isOpen ? undefined : colors.backgroundDark}
      userSelect="none"
      rounded="full"
      px={4}
      py={2}
      alignItems="center"
      gap={2}
      fontSize="sm"
      color={props.isOpen ? colors.textSecondary : colors.textPrimary}
    >
      {props.isOpen ? (
        <Box p={1}>
          <ChevronUp size="18px" />
        </Box>
      ) : (
        <HStack>
          <Box overflow={'hidden'}>{props.renderContent}</Box>
          <Box p={1}>
            <ChevronDown size="18px" />
          </Box>
        </HStack>
      )}
    </Flex>
  )
}
