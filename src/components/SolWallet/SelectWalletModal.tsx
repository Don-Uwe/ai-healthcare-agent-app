import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
// import TealCircleCheckBadge from '@/icons/misc/TealCircleCheckBadge'
import WalletSelectEggIcon from '@/icons/misc/WalletSelectEggIcon'
import WalletSelectWalletIcon from '@/icons/misc/WalletSelectWalletIcon'
// import AvalancheNetworkIcon from '@/icons/networks/AvalancheNetworkIcon'
// import BinanceNetworkIcon from '@/icons/networks/BinanceNetworkIcon'
// import EthereumNetworkIcon from '@/icons/networks/EthereumNetworkIcon'
// import PolygonNetworkIcon from '@/icons/networks/PolygonNetworkIcon'
// import SolanaNetworkIcon from '@/icons/networks/SolanaNetworkIcon'
import { colors } from '@/theme/cssVariables'
import {
  Box,
  Collapse,
  Flex,
  HStack,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Switch,
  Text,
  useColorMode
} from '@chakra-ui/react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Wallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import NextLink from 'next/link'

interface Props {
  wallets: Wallet[]
  isOpen: boolean
  onSelectWallet: (wallet: Wallet) => void
  onClose: () => void
}

// type Network = { name: string; icon?: JSX.Element }

export default function SelectWalletModal({ wallets, isOpen, onSelectWallet, onClose }: Props) {
  const { t } = useTranslation()
  /*
  const networks: Network[] = [
    { name: 'Solana', icon: <SolanaNetworkIcon /> },
    { name: 'Avalanche', icon: <AvalancheNetworkIcon /> },
    { name: 'Etherem ', icon: <EthereumNetworkIcon /> },
    { name: 'Binance', icon: <BinanceNetworkIcon /> },
    { name: 'Polygon', icon: <PolygonNetworkIcon /> }
  ]
  const [currentNetwork, setCurrentNetwork] = useState('Solana')
  const connectedNetworks = ['Solana', 'Avalanche']
  */
  const [canShowUninstalledWallets, setCanShowUninstalledWallets] = useState(false)

  const { installedWallets, notInstalledWallets } = splitWallets(wallets)

  return (
    <Modal variant={'mobileFullPage'} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent color={colors.textPrimary} width={['unset', '36em']}>
        <ModalHeader>{t('wallet_connect_panel.title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody display={'grid'}>
          <Box overflow={'hidden'} display={'flex'} flexDirection={'column'}>
            <Box mb={5} color={colors.textTertiary} bg={colors.backgroundTransparent07} p={3} fontSize={['xs', 'sm']} rounded="md">
              {t('wallet_connect_panel.desc')} <Link>{t('wallet_connect_panel.desc_link')}</Link>
            </Box>

            {/* <Box mb={6}>
              <Text fontSize={['sm', 'md']} color={colors.textPrimary} fontWeight={500} mb={4}>
                {t('wallet_connect_panel.choose_network')}
              </Text>
              <HStack gap={['unset', 8]} justifyContent={['space-between', 'unset']}>
                {networks.map((network) => (
                  <NetworkItem
                    isConnected={connectedNetworks.includes(network.name)}
                    isCurrent={currentNetwork === network.name}
                    key={network.name}
                    network={network}
                    onClick={(network) => {
                      setCurrentNetwork(network.name)
                    }}
                  />
                ))}
              </HStack>
            </Box> */}

            <Box mb={6} flex={'1'} overflowY={'scroll'}>
              <Text fontSize={['sm', 'md']} color={colors.textPrimary} fontWeight={500} mb={4}>
                {t('wallet_connect_panel.choose_wallet')}
              </Text>
              {/* have divider  */}
              <SimpleGrid gridTemplateColumns={['1fr', '1fr 1fr']} rowGap={['10px', 3]} columnGap={4}>
                {installedWallets.map((wallet) => (
                  <WalletItem key={wallet.adapter.name} selectable wallet={wallet} onClick={onSelectWallet} />
                ))}
              </SimpleGrid>

              <Collapse in={canShowUninstalledWallets}>
                <HStack color={colors.textSecondary} fontSize="sm" my={3}>
                  <Box flexGrow={1} height="1px" color={colors.textTertiary} bg={colors.dividerDashGradient}></Box>
                  <Text>Uninstalled wallets</Text>
                  <Box flexGrow={1} height="1px" color={colors.textTertiary} bg={colors.dividerDashGradient}></Box>
                </HStack>

                <SimpleGrid opacity={0.5} gridTemplateColumns="1fr 1fr" rowGap={3} columnGap={4}>
                  {notInstalledWallets.map((wallet) => (
                    <WalletItem selectable={false} key={wallet.adapter.name} wallet={wallet} onClick={onSelectWallet} />
                  ))}
                </SimpleGrid>
              </Collapse>
            </Box>

            <Flex
              bg={colors.backgroundTransparent07}
              color={colors.textSecondary}
              fontSize="sm"
              fontWeight={500}
              justify="space-between"
              rounded="xl"
              py={4}
              px={5}
              mb={3}
            >
              <HStack>
                <WalletSelectWalletIcon />
                <Text>{t('wallet_connect_panel.show_uninstalled_wallets')}</Text>
              </HStack>
              <Switch checked={canShowUninstalledWallets} onChange={() => setCanShowUninstalledWallets((b) => !b)} />
            </Flex>

            <Flex
              bg={colors.backgroundTransparent07}
              color={colors.textSecondary}
              fontSize="sm"
              fontWeight={500}
              justify="space-between"
              rounded="xl"
              py={4}
              px={5}
            >
              <HStack>
                <WalletSelectEggIcon />
                <Text>{t('wallet_connect_panel.tour_title')}</Text>
              </HStack>
              <Link as={NextLink} href="https://docs.raydium.io/raydium/" _hover={{ textDecoration: 'none' }} isExternal>
                <HStack>
                  <Text>{t('wallet_connect_panel.tour_desc')}</Text>
                  <ChevronRightIcon width={'14px'} height={'14px'} />
                </HStack>
              </Link>
            </Flex>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function WalletItem({
  selectable = true,
  wallet,
  onClick
}: {
  selectable?: boolean
  wallet: Wallet
  onClick: (wallet: Wallet) => void
  isCurrent?: boolean
}) {
  const { colorMode } = useColorMode()
  const isLight = colorMode !== 'dark'
  return (
    <Flex
      gap={3}
      align="center"
      cursor={selectable ? 'pointer' : undefined}
      rounded="md"
      _hover={
        selectable ? { bg: isLight ? '#8C6EEF' : '#524c92', color: isLight ? colors.textRevertPrimary : colors.textPrimary } : undefined
      }
      bg={colors.backgroundDark}
      py={3}
      px={7}
      pl={[9, 7]}
      onClick={() => onClick(wallet)}
    >
      <Image src={wallet.adapter.icon} w={8} h={8} ml={1} />
      <Text fontWeight={700}>{wallet.adapter.name}</Text>
    </Flex>
  )
}
/*
function NetworkItem({
  network,
  onClick,
  isCurrent,
  isConnected
}: {
  network: Network
  onClick: (network: Network) => void
  isCurrent?: boolean
  isConnected?: boolean
}) {
  return (
    <Flex flexDirection="column" align="center" gap="2" onClick={() => onClick(network)} cursor="pointer">
      <Box padding={0.5} borderColor={isCurrent ? '#22d1f8' : 'transparent'} borderWidth="1.5px" rounded="full" position="relative">
        {isConnected && <TealCircleCheckBadge position="absolute" right={0.5} bottom={0.5} />}
        {network.icon}
      </Box>
      <Text color={isCurrent ? colors.textPrimary : colors.textSecondary} fontSize="xs">
        {network.name}
      </Text>
    </Flex>
  )
}
*/
function splitWallets(wallets: Wallet[]): { installedWallets: Wallet[]; notInstalledWallets: Wallet[] } {
  const supportedWallets = wallets.filter((w) => w.readyState !== WalletReadyState.Unsupported)
  const installedWallets = supportedWallets.filter((w) => w.readyState !== WalletReadyState.NotDetected && w.adapter.name !== 'Sollet')
  const notInstalledWallets = supportedWallets.filter((w) => w.readyState == WalletReadyState.NotDetected)
  const solletWallet = supportedWallets.find((w) => w.adapter.name === 'Sollet')
  solletWallet && notInstalledWallets.push(solletWallet)
  return { installedWallets, notInstalledWallets }
}
