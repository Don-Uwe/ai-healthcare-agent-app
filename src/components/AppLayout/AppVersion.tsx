import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { toUTC } from '@/utils/date'
import { Flex, Text } from '@chakra-ui/react'
import React from 'react'

function AppVersion() {
  const appVersion = useAppStore((s) => s.appVersion)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)

  return (
    <Flex fontSize="sm" color={colors.textTertiary} direction={['row', 'column']} columnGap={5} mt={3}>
      {/* version */}
      <Text>{appVersion}</Text>
      {/* **block chain** current time */}
      <Text>{toUTC(new Date(Date.now() + chainTimeOffset))}</Text>
    </Flex>
  )
}

export default AppVersion
