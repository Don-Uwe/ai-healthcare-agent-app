import { Box, Center, Flex, Text, Wrap, WrapItem } from '@chakra-ui/react'

import FooterItem from './components/FooterItem'
import FooterTitle from './components/FooterTitle'
import Discord from './images/Discord'
import ExpandArrowDown from './images/ExpandArrowDown'
import FooterBg from './images/footer-bg.png'
import Medium from './images/Medium'
import Logo from './images/SecondaryLogo'
import Telegram from './images/Telegram'
import Twitter from './images/Twitter'

export default function Footer() {
  const footerList = [
    {
      title: 'ABOUT',
      items: [
        <FooterItem key="footer-about-01">Meet Raydium</FooterItem>,
        <FooterItem key="footer-about-02">Ray Token</FooterItem>,
        <FooterItem key="footer-about-03">Media Assets</FooterItem>
      ]
    },
    {
      title: 'PROTOCOL',
      items: [
        <FooterItem key="footer-protocol-01">Apply for Fusion Pool</FooterItem>,
        <FooterItem key="footer-protocol-02">Apply for AcceleRaytor</FooterItem>,
        <FooterItem key="footer-protocol-03">Permissionless Pool</FooterItem>,
        <FooterItem key="footer-protocol-04">API</FooterItem>
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        <FooterItem key="footer-support-01">Getting Started on Solana</FooterItem>,
        <FooterItem key="footer-support-02">Getting Started on Raydium</FooterItem>,
        <FooterItem key="footer-support-03">FAQ</FooterItem>
      ]
    },
    {
      title: 'COMMUNITY',
      items: [
        <FooterItem key="footer-community-01">
          <Flex gap="19.38px">
            <Twitter /> <Text>Twitter</Text>
          </Flex>
        </FooterItem>,
        <FooterItem key="footer-community-02">
          <Flex gap="19.38px">
            <Medium /> <Text>Medium</Text>
          </Flex>
        </FooterItem>,
        <FooterItem key="footer-community-03">
          <Flex gap="19.38px">
            <Discord /> <Text>Discord</Text>
          </Flex>
        </FooterItem>,
        <FooterItem key="footer-community-04">
          <Flex align="center">
            <Telegram /> <Text ml="19.38px">Telegram</Text>{' '}
            <Box>
              <ExpandArrowDown style={{ marginLeft: 4, position: 'relative', bottom: -1 }} />
            </Box>
          </Flex>
        </FooterItem>
      ]
    }
  ]

  return (
    <Box
      mt={124}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
      }}
      pt="216.88px"
    >
      <Center px={[8, 0]}>
        <Box style={{ position: 'relative', zIndex: 2 }}>
          <Flex justify={['center', 'space-between']} flexWrap="wrap" style={{ position: 'relative', zIndex: 2 }} gap="93px">
            {footerList.map((foot, idx) => {
              return (
                <Flex key={`foot-categary-${idx}`} direction="column" w="fit-content">
                  <FooterTitle title={foot.title} />
                  <Flex direction="column" gap="26px" mt="21.8px">
                    {foot.items.map((item) => item)}
                  </Flex>
                </Flex>
              )
            })}
          </Flex>
        </Box>
      </Center>
      <Logo style={{ position: 'relative', zIndex: 2, margin: '80px auto 80px auto' }} />
      <img src={FooterBg.src} style={{ minWidth: '1440px', width: '100%', position: 'absolute', top: 0, height: '100%', zIndex: 1 }} />
    </Box>
  )
}
