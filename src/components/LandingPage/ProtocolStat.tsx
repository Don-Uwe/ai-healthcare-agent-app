import { Box, Center, Flex, Heading } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

import TotalValueVolume from './components/TotalValueVolume'

export default function ProtocolStat() {
  return (
    <Box pt={234}>
      <Box zIndex="2">
        <Center px={[8, 0]}>
          <Flex flexWrap="wrap" direction="column" align="center" position="relative">
            <Heading fontWeight={400} fontSize="3rem" lineHeight={'3.8rem'} color={colors.primary}>
              Next-level <span style={{ fontWeight: 700 }}>liquidity</span>. Frictionless
            </Heading>
            <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.8rem'} color={colors.primary}>
              <span style={{ fontWeight: 700 }}>yield</span>. Light-speed <span style={{ fontWeight: 700 }}>swaps</span>.
            </Heading>
            <TotalValueVolume />
            <Box
              zIndex="1"
              w="100%"
              h="100%"
              filter="blur(150px)"
              opacity="0.5"
              position="absolute"
              top="0"
              left="0"
              style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center' }}
            >
              <Box position="absolute" top="-67px" marginRight="381px" w="538px" h="541px" borderRadius="50%" bg="#39D0D8" opacity="0.6" />
              <Box position="absolute" top="28px" marginLeft="480px" w="520px" h="523px" borderRadius="50%" bg="#8C6EEF" opacity="0.55" />
            </Box>
          </Flex>
        </Center>
      </Box>
    </Box>
  )
}
