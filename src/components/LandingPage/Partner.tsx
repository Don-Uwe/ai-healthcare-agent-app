import { Box, Center, Flex, Heading, Wrap, WrapItem } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

import serum from './images/serum.png'
import solana from './images/solana.png'
import sushi from './images/sushi.png'

export default function Partner() {
  return (
    <Box pt={234}>
      <Center px={[8, 0]}>
        <Flex direction="column" align="center">
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.83rem'} color={colors.primary}>
            Our Partners
          </Heading>
          <Wrap spacing={'2.625rem'} mt="44px" maxW="1230px">
            <WrapItem>
              <img src={solana.src} />
            </WrapItem>
            <WrapItem>
              <img src={serum.src} />
            </WrapItem>
            <WrapItem>
              <img src={sushi.src} />
            </WrapItem>
          </Wrap>
        </Flex>
      </Center>
    </Box>
  )
}
