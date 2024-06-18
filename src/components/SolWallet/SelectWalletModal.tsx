import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
// import TealCircleCheckBadge from '@/icons/misc/TealCircleCheckBadge'
import WalletSelectEggIcon from '@/icons/misc/WalletSelectEggIcon'
import WalletSelectWalletIcon from '@/icons/misc/WalletSelectWalletIcon'
// import AvalancheNetworkIcon from '@/icons/networks/AvalancheNetworkIcon'
// import BinanceNetworkIcon from '@/icons/networks/BinanceNetworkIcon'
// import EthereumNetworkIcon from '@/icons/networks/EthereumNetworkIcon'
// import PolygonNetworkIcon from '@/icons/networks/PolygonNetworkIcon'
// import SolanaNetworkIcon from '@/icons/networks/SolanaNetworkIcon'
import MobileIcon from '@/icons/misc/MobileIcon'
import DesktopIcon from '@/icons/misc/DesktopIcon'
import { QuestionToolTip } from '@/components/QuestionToolTip'
import ExternalLink from '@/icons/misc/ExternalLink'
import { colors } from '@/theme/cssVariables'
import {
  Box,
  Button,
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
  UnorderedList,
  ListItem,
  useColorMode
} from '@chakra-ui/react'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Wallet } from '@solana/wallet-adapter-react'
import { useState, useCallback } from 'react'
import { useTranslation, Trans } from 'react-i18next'
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
  const [isWalletNotInstalled, setIsWalletNotInstalled] = useState(false)

  const { recommendedWallets, notInstalledWallets } = splitWallets(wallets)

  const phantomWallet = recommendedWallets.find((w) => w.adapter.name === 'Phantom')

  const handleCloseComplete = useCallback(() => setIsWalletNotInstalled(false), [setIsWalletNotInstalled])

  return (
    <Modal variant={'mobileFullPage'} isOpen={isOpen} onClose={onClose} onCloseComplete={handleCloseComplete}>
      <ModalOverlay />
      <ModalContent color={colors.textPrimary} width={['unset', '36em']}>
        <ModalHeader>{t('wallet_connect_panel.title')}</ModalHeader>
        <ModalCloseButton />
        {isWalletNotInstalled ? (
          <ModalBody display={'grid'}>
            <Box overflow={'hidden'} display={'flex'} flexDirection={'column'}>
              <Box color={colors.semanticWarning} bg={colors.warnButtonLightBg} p={3} fontSize={['xs', 'sm']} rounded="md">
                {t('wallet_connect_panel.phantom_wallet_not_installed')}
              </Box>
              <Flex justify="center" mt={10}>
                <Image src={phantomWallet?.adapter.icon} w={100} h={100} />
              </Flex>
              <Flex justify="center" textAlign="center" mt={6}>
                <Link href="https://phantom.app" isExternal>
                  <Button fontWeight="medium" gap={1}>
                    {t('wallet_connect_panel.install_phantom')}
                    <ExternalLink cursor="pointer" width="14" height="14" color={colors.buttonSolidText} />
                  </Button>
                </Link>
              </Flex>
              <Flex align="start" flexDirection="column" color={colors.textSecondary} px={3} mt={12}>
                <Text>{t('wallet_connect_panel.how_to_install_phantom')}</Text>
                <Flex flexDirection="column" align="flex-start" justify="flex-start" pl={1} textAlign="start" mt={5} fontSize="14px">
                  <HStack>
                    <MobileIcon />
                    <Text fontWeight="medium">{t('wallet_connect_panel.on_mobile')}</Text>
                  </HStack>
                  <UnorderedList mt={1} pl={10}>
                    <ListItem>{t('wallet_connect_panel.mobile_open_wallet')}</ListItem>
                  </UnorderedList>
                </Flex>
                <Flex flexDirection="column" align="flex-start" justify="flex-start" pl={1} textAlign="start" mt={5} fontSize="14px">
                  <HStack>
                    <DesktopIcon />
                    <Text fontWeight="medium">{t('wallet_connect_panel.on_desktop')}</Text>
                  </HStack>
                  <UnorderedList mt={1} pl={10}>
                    <ListItem>{t('wallet_connect_panel.install_refresh_page')}</ListItem>
                  </UnorderedList>
                </Flex>
              </Flex>
              <Flex flexDirection="column" px={3} mt={12}>
                <Button
                  variant="ghost"
                  w="full"
                  borderRadius="8px"
                  fontWeight="normal"
                  _hover={{ fontWeight: 'medium', border: `1px solid ${colors.buttonPrimary}` }}
                  onClick={() => {
                    if (!phantomWallet || phantomWallet.readyState == WalletReadyState.NotDetected) {
                      window.location.reload()
                    } else {
                      onSelectWallet(phantomWallet)
                      onClose()
                    }
                  }}
                >
                  {t('wallet_connect_panel.wallet_installed_refresh_page')}
                </Button>
                <Button
                  variant="ghost"
                  w="full"
                  borderRadius="8px"
                  fontWeight="normal"
                  _hover={{ fontWeight: 'medium', border: `1px solid ${colors.buttonPrimary}` }}
                  onClick={() => {
                    setIsWalletNotInstalled(false)
                  }}
                >
                  {t('wallet_connect_panel.goback')}
                </Button>
              </Flex>
            </Box>
          </ModalBody>
        ) : (
          <ModalBody display={'grid'}>
            <Box overflow={'hidden'} display={'flex'} flexDirection={'column'}>
              <Box mb={5} color={colors.textTertiary} bg={colors.backgroundTransparent07} p={3} fontSize={['xs', 'sm']} rounded="md">
                {t('wallet_connect_panel.desc')}{' '}
                <Link href="https://raydium.io/docs/disclaimer/" isExternal>
                  {t('wallet_connect_panel.desc_link')}
                </Link>
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
                  {recommendedWallets.map((wallet) => (
                    <WalletItem
                      key={wallet.adapter.name}
                      selectable
                      wallet={wallet}
                      onClick={(wallet) => {
                        if (wallet.readyState == WalletReadyState.NotDetected && wallet.adapter.name === 'Phantom') {
                          setIsWalletNotInstalled(true)
                          return
                        }
                        onSelectWallet(wallet)
                      }}
                    />
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
        )}
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
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isLight = colorMode !== 'dark'
  return (
    <Flex
      gap={2}
      align="center"
      cursor={selectable ? 'pointer' : undefined}
      rounded="md"
      _hover={
        selectable ? { bg: isLight ? '#8C6EEF' : '#524c92', color: isLight ? colors.textRevertPrimary : colors.textPrimary } : undefined
      }
      bg={colors.backgroundDark}
      py={3}
      px={3}
      pl={[9, 3]}
      onClick={() => onClick(wallet)}
    >
      <Image src={wallet.adapter.icon} w={8} h={8} ml={1} />
      <Text fontWeight={700}>{wallet.adapter.name}</Text>
      {wallet.adapter.name === 'Phantom' && (
        <HStack gap={1} backgroundColor={colors.selectInactive} px={2} py={1} borderRadius="8px">
          <Text fontSize="12px" color={colors.textPurple}>
            {t('wallet_connect_panel.auto_confirm')}
          </Text>
          <QuestionToolTip
            label={
              <Trans i18nKey="wallet_connect_panel.auto_confirm_tip">
                <Link href="https://phantom.app/learn/blog/auto-confirm" isExternal></Link>
              </Trans>
            }
            iconProps={{ color: colors.textPurple }}
          />
        </HStack>
      )}
      {wallet.adapter.name === 'Solflare' && (
        <HStack gap={1} backgroundColor={colors.selectInactive} px={2} py={1} borderRadius="8px">
          <Text fontSize="12px" color={colors.textPurple}>
            {t('wallet_connect_panel.auto_approve')}
          </Text>
          <QuestionToolTip label={t('wallet_connect_panel.auto_approve_tip_solflare')} iconProps={{ color: colors.textPurple }} />
        </HStack>
      )}
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
function splitWallets(wallets: Wallet[]): { recommendedWallets: Wallet[]; notInstalledWallets: Wallet[] } {
  const supportedWallets = wallets.filter((w) => w.readyState !== WalletReadyState.Unsupported)
  const recommendedWallets = supportedWallets.filter((w) => w.readyState !== WalletReadyState.NotDetected && w.adapter.name !== 'Sollet')
  const notInstalledWallets = supportedWallets.filter((w) => w.readyState == WalletReadyState.NotDetected && w.adapter.name !== 'Phantom')
  const solletWallet = supportedWallets.find((w) => w.adapter.name === 'Sollet')
  solletWallet && notInstalledWallets.push(solletWallet)
  const phantomWallet = supportedWallets.find((w) => w.adapter.name === 'Phantom')
  phantomWallet && phantomWallet.readyState == WalletReadyState.NotDetected && recommendedWallets.unshift(phantomWallet)
  return { recommendedWallets, notInstalledWallets }
}
