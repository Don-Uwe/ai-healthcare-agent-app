import { useEffect } from 'react'
import { Flex } from '@chakra-ui/react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Entry from '@/components/LandingPage/Entry'
import Facilitate from '@/components/LandingPage/Facilitate'
import Feature from '@/components/LandingPage/Feature'
import Footer from '@/components/LandingPage/Footer'
import Header from '@/components/LandingPage/Header'
import Liquidity from '@/components/LandingPage/Liquidity'
import Partner from '@/components/LandingPage/Partner'
import ProtocolStat from '@/components/LandingPage/ProtocolStat'

const Home: NextPage = () => {
  const router = useRouter()
  useEffect(() => {
    // no ssr
    router.replace('/swap')
  }, [])
  return (
    <Flex minHeight="100vh" direction="column" bgGradient="linear(178.57deg, #30467B -19.19%, #101C33 20.13%, #110E26 59.46% )">
      {/* <Header />
      <Entry />
      <ProtocolStat />
      <Liquidity />
      <Feature />
      <Facilitate />
      <Partner />
      <Footer /> */}
    </Flex>
  )
}

export default Home
