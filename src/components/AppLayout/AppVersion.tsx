import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { toUTC } from '@/utils/date'
import { Flex, Text } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

function AppVersion() {
  const appVersion = useAppStore((s) => s.appVersion)
  const chainTimeOffset = useAppStore((s) => s.chainTimeOffset)
  const [time, setTime] = useState('')

  useEffect(() => {
    setTime(toUTC(new Date(Date.now() + chainTimeOffset)))
  }, [chainTimeOffset])

  return (
    <Flex fontSize="sm" color={colors.textTertiary} direction={['row', 'column']} columnGap={5} mt={3}>
      {/* version */}
      <Text>{appVersion}</Text>
      {/* **block chain** current time */}
      <Text>{time}</Text>
    </Flex>
  )
}

export default AppVersion
