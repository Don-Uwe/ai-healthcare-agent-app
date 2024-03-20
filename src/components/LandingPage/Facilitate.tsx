import { Box, Center, Flex, Heading } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

import facilitate from './images/facilitate.png'

export default function Facilitate() {
  return (
    <Box pt={234}>
      <Center px={[8, 0]}>
        <Flex direction="column" align="center">
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.83rem'} color={colors.primary}>
            Facilitating Crosschain Liquidity
          </Heading>
          <img src={facilitate.src} style={{ marginTop: 58 }} />
        </Flex>
      </Center>
    </Box>
  )
}
