import { useAppStore } from '@/store'
import { WormholeConnectConfig, WormholeConnectPartialTheme } from '@wormhole-foundation/wormhole-connect'
import dynamic from 'next/dynamic'
import { useEffect, useState, useMemo } from 'react'
import { Box, Flex, Skeleton, useColorMode } from '@chakra-ui/react'
import { Themes } from './theme'

interface WormholeConnectProps {
  theme?: WormholeConnectPartialTheme
  config?: WormholeConnectConfig
}

const WormholeConnect = dynamic<WormholeConnectProps>(() => import('@wormhole-foundation/wormhole-connect').then((mod) => mod.default), {
  ssr: false,
  loading() {
    return (
      <Box p={4}>
        <Flex justifyContent="space-between">
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="180px" />
        </Flex>
        <Box mt={3}>
          <Skeleton height="182px" />
        </Box>
        <Flex justifyContent="center" mt={3}>
          <Skeleton height="42px" width="42px" borderRadius="50%" />
        </Flex>
        <Flex justifyContent="space-between" mt={1}>
          <Skeleton height="40px" width="100px" />
          <Skeleton height="40px" width="200px" />
        </Flex>
        <Box mt={3}>
          <Skeleton height="182px" />
        </Box>
        <Flex direction={{ base: 'column', sm: 'row' }} align="center" gap={4} justifyContent="space-between" mt={8}>
          <Skeleton height="40px" width="150px" />
          <Skeleton height="40px" width="60px" />
          <Skeleton height="40px" width="100px" />
        </Flex>
        <Flex justifyContent="center" mt={8}>
          <Skeleton height="40px" width="66%" />
        </Flex>
      </Box>
    )
  }
})

export default function WormholeWidget() {
  const rpcNodeUrl = useAppStore((s) => s.rpcNodeUrl)
  const [render, setRender] = useState(false)
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const { customTheme } = isLight ? Themes.light : Themes.dark

  const css = `
  [class*=appContent] {
    margin: 0!important;
    padding:24px;
  }
  [class*=MuiScopedCssBaseline-root] {
    background-color: transparent!important
  }
`

  const config: WormholeConnectConfig = useMemo(() => {
    const wormConfig: WormholeConnectConfig = {
      env: 'mainnet',
      tokens: ['ETH', 'USDCsol', 'USDCeth', 'USDCpolygon', 'USDCavax', 'USDCarbitrum', 'USDCoptimism', 'USDT', 'WBTC', 'WETH'],
      networks: ['ethereum', 'polygon', 'avalanche', 'solana', 'base', 'arbitrum', 'optimism'],
      bridgeDefaults: {
        token: 'USDCeth',
        fromNetwork: 'ethereum',
        toNetwork: 'solana'
      },
      routes: ['bridge', 'cctpManual', 'cctpRelay', 'cosmosGateway', 'ethBridge', 'nttManual', 'nttRelay', 'relay', 'tbtc', 'wstETHBridge'],
      showHamburgerMenu: false,
      mode: colorMode,
      rpcs: {
        solana: rpcNodeUrl
      }
    }
    return wormConfig
  }, [colorMode, rpcNodeUrl])

  useEffect(() => {
    let id: number | undefined = undefined
    if (!rpcNodeUrl) {
      id = window.setTimeout(() => {
        setRender(true)
      }, 1500)

      return () => window.clearTimeout(id)
    }
    setRender(true)
  }, [rpcNodeUrl])

  return render ? (
    <Flex justifyContent="center" width="100%">
      <Box width="650px" backgroundColor={isLight ? 'rgba(245, 248, 255, 1)' : 'rgba(28, 36, 62, 1)'} borderRadius="20px">
        <style>{css}</style>
        <WormholeConnect config={config} theme={customTheme} key={JSON.stringify(config)} />
      </Box>
    </Flex>
  ) : null
}
