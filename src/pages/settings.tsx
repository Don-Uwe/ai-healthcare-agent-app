import { Flex, Box, Text } from '@chakra-ui/react'
import { useAppStore } from '@/store/useAppStore'

export default function SettingsPage() {
  const [urlConfigs, programIdConfig] = useAppStore((s) => [s.urlConfigs, s.programIdConfig])
  return (
    <div style={{ overflow: 'auto' }}>
      <Text fontSize="xl" mb="2">
        API
      </Text>
      <Flex flexDirection="column" gap="1">
        <Flex>
          <Box flex="1">BASE HOST:</Box>
          <Box flex="2">{urlConfigs.BASE_HOST}</Box>
        </Flex>
        <Flex>
          <Box flex="1">SWAP HOST:</Box>
          <Box flex="2">{urlConfigs.SWAP_HOST}</Box>
        </Flex>
      </Flex>
      <Text fontSize="xl" my="2">
        Program ID
      </Text>
      <Flex flexDirection="column" gap="1">
        {Object.keys(programIdConfig).map((config) => (
          <Flex key={config}>
            <Box flex="1">{config}:</Box>
            <Box flex="2">{programIdConfig[config as keyof typeof programIdConfig]?.toString()}</Box>
          </Flex>
        ))}
      </Flex>
    </div>
  )
}
