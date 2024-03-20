import { Box, Center, Flex, Heading, Text, useBreakpointValue } from '@chakra-ui/react'
import Link from 'next/link'

import Button from '../Button'

import BuildOnSolana from './images/BuildOnSolana'
import Doc from './images/Doc'
import EntryPic from './images/entry.png'

export default function Entry() {
  const newLine = useBreakpointValue({ base: '', sm: <br /> })

  return (
    <Box>
      <Center>
        <Flex direction={['column', 'row']} justify="center">
          <img src={EntryPic.src} />
          <Flex direction="column" justify="flex-end" px={[8, 0]}>
            <Flex direction="column" justify="center" minHeight={280}>
              <Heading fontWeight={500} fontSize="4rem" lineHeight={'3.75rem'} color="white">
                An avenue for{newLine} the evolution of{' '}
                <Text as="span" bgGradient="linear(270.87deg, #8C6EEF 0.41%, #ABC4FF 97.12%)" bgClip="text">
                  DeFi
                </Text>
              </Heading>
            </Flex>
            <Box w={['100%', 'fit-content']} mt={[6, 0]}>
              <Flex flexWrap="wrap" justify={['center', 'flex-start']} gap={[23, 46]}>
                <Button minW={['100%', 230]} minH={14} variant="outline">
                  Read Doc <Doc style={{ marginLeft: 10 }} />
                </Button>
                <Link href="/swap">
                  <Button minW={['100%', 230]} minH={14}>
                    Launch App
                  </Button>
                </Link>
              </Flex>
              <Flex height={8} justify="center" mt={6}>
                <BuildOnSolana />
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Center>
    </Box>
  )
}
