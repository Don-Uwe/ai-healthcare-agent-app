/* eslint-disable react/no-unescaped-entities */
import { Box, Center, Flex, Heading, Wrap } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

import FeatureCard from './components/FeatureCard'
import amm from './images/liquidity-amm.png'
import chart from './images/liquidity-card-chart.png'
import launch from './images/liquidity-launch.png'
import swap from './images/liquidity-swap.png'

export default function Feature() {
  const featureList = [
    {
      title: 'Trade',
      desc: 'Swap or Trade quickly and cheaply.',
      link: '',
      linkTitle: 'Launch Exchange'
    },
    {
      title: 'Yield',
      desc: 'Earn yield through fees and yield farms.',
      link: '',
      linkTitle: 'Launch Farm'
    },
    {
      title: 'Pool',
      desc: 'Provide liquidity for any SPL token.',
      link: '',
      linkTitle: 'Launch Pool'
    },
    {
      title: 'CLMM',
      desc: 'Concentrate liquidity for increased captial efficiency.',
      link: '',
      linkTitle: 'Launch CLMM'
    },
    {
      title: 'AcceleRaytor',
      desc: 'A launchpad for new Solana projects.',
      link: '',
      linkTitle: 'Launch AcceleRaytor'
    },
    {
      title: 'NFT',
      desc: 'Swap or Trade quickly and cheaply.',
      link: '',
      linkTitle: 'Launch NFT'
    }
  ]

  return (
    <Box pt={234}>
      <Center px={[8, 0]}>
        <Flex direction="column" align="center">
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.83rem'} color={colors.primary}>
            A suite of features powering the
          </Heading>
          <Heading fontWeight={500} fontSize="3rem" lineHeight={'3.83rem'} color={colors.primary}>
            evolution of DeFi on Solana
          </Heading>
          <Wrap spacing="55px" mt="99px" maxW="1230px">
            {featureList.map((feature, idx) => {
              return (
                <FeatureCard
                  title={feature.title}
                  desc={feature.desc}
                  link={feature.link}
                  linkTitle={feature.linkTitle}
                  key={`feature-card-${idx}`}
                />
              )
            })}
          </Wrap>
        </Flex>
      </Center>
    </Box>
  )
}
