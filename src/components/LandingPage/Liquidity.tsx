/* eslint-disable react/no-unescaped-entities */
import { Box, Center, Flex, Heading } from '@chakra-ui/react'
import React from 'react'

import { colors } from '@/theme/cssVariables'

import amm from './images/liquidity-amm.png'
import chart from './images/liquidity-card-chart.png'
import launch from './images/liquidity-launch.png'
import swap from './images/liquidity-swap.png'

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box color="white" fontWeight={500} fontSize={'1.25rem'} lineHeight={'1.56rem'} textAlign="center">
      {children}
    </Box>
  )
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <Box color={colors.textQuaternary} fontWeight={300} fontSize="1rem" lineHeight={'1.375rem'} textAlign="center" mt="13px">
      {children}
    </Box>
  )
}

export default function Liquidity() {
  return (
    <Box pt={234}>
      <Center px={[8, 0]}>
        <Flex direction="column" align="center">
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.8rem'} color={colors.primary}>
            Raydium provides Ecosystem-Wide
          </Heading>
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.8rem'} color={colors.primary}>
            Liquidity for users and projects
          </Heading>
          <Flex gap="45px" mt="99px" flexWrap="wrap">
            <Flex direction="column" justify="space-between" align="center" className="landing-liquidity-card">
              <Box w="100%" h="100%" position="relative">
                <img src={chart.src} style={{ position: 'relative', top: '32px', left: '70px' }} />
                <img src={amm.src} style={{ position: 'absolute', top: '32px', right: '81px' }} />
              </Box>
              <Box h={'fit-content'}>
                <CardTitle>Order Book AMM</CardTitle>
                <CardBody>
                  Raydium's AMM interacts with Serum's central limit order book, meaning that pools have access to all order flow and
                  liquidity on Serum, and vice versa.
                </CardBody>
              </Box>
            </Flex>
            <Flex direction="column" justify="space-between" align="center" className="landing-liquidity-card">
              <Box w="100%" h="100%" position="relative">
                <img src={swap.src} style={{ position: 'absolute', top: '38px', left: '116px' }} />
                <img src={chart.src} style={{ position: 'relative', top: '63px', left: '54px' }} />
              </Box>
              <Box h={'fit-content'}>
                <CardTitle>Best Price Swaps</CardTitle>
                <CardBody>
                  Raydium determines whether swapping within a liquidity pool or through the Serum order book will provide the best price
                  for the user, and executes accordingly.
                </CardBody>
              </Box>
            </Flex>
            <Flex direction="column" justify="space-between" align="center" className="landing-liquidity-card">
              <Box w="100%" h="100%" position="relative">
                <img src={chart.src} style={{ position: 'relative', top: '52px', left: '85px' }} />
                <img src={launch.src} style={{ position: 'absolute', top: '4px', right: '116px' }} />
              </Box>
              <Box h={'fit-content'}>
                <CardTitle>High-Liquidity Launches</CardTitle>
                <CardBody>
                  AcceleRaytor offers projects a straightforward 3 step process to raise funds, launch an IDO, and bootstrap liquidity on
                  Raydium and Serum.
                </CardBody>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Center>
    </Box>
  )
}
