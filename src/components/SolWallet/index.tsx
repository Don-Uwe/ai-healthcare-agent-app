import { useCallback } from 'react'
import { Box, Button, HStack, Text, Image, useDisclosure } from '@chakra-ui/react'
import { Wallet, useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useEvent } from '@/hooks/useEvent'
import WalletRecentTransactionBoard from '../WalletRecentTransactionBoard'
import SelectWalletModal from './SelectWalletModal'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import { colors } from '@/theme/cssVariables'
import { encodeStr } from '@/utils/common'
import { useAppStore } from '@/store/useAppStore'
import { useTranslation } from 'react-i18next'

export default function SolWallet() {
  const { wallets, select, disconnect, connected, connecting, wallet } = useWallet()
  const { t } = useTranslation()
  const publicKey = useAppStore((s) => s.publicKey)
  const { setVisible, visible } = useWalletModal()
  const { isOpen: isWalletDrawerShown, onOpen, onClose } = useDisclosure()

  const handleClose = useCallback(() => setVisible(false), [setVisible])
  const handleOpen = useCallback(() => setVisible(true), [setVisible])

  const handleSelectWallet = useEvent((wallet: Wallet) => {
    select(wallet.adapter.name)
    handleClose()
  })

  if (connected)
    return (
      <>
        <WalletRecentTransactionBoard
          wallet={wallet}
          address={publicKey?.toBase58() || ''}
          onDisconnect={disconnect}
          isOpen={isWalletDrawerShown}
          onClose={onClose}
        />
        <HStack
          cursor="pointer"
          onClick={onOpen}
          py="5px"
          px={['5px', '8px']}
          backgroundColor={colors.backgroundLight}
          borderRadius="full"
          overflow="hidden"
        >
          {wallet && (
            <Box flex="none" rounded="full" overflow="hidden">
              <Image src={wallet.adapter.icon} width={['28px', '40px']} height={['28px', '40px']} />
            </Box>
          )}
          <Text fontSize="sm">{encodeStr(publicKey?.toBase58(), 4)}</Text>
          <Box flex={'none'}>
            <ChevronDownIcon width={12} height={12} />
          </Box>
        </HStack>
      </>
    )
  return (
    <Box>
      <Button isLoading={connecting} loadingText="Connecting.." onClick={handleOpen}>
        {t('button.connect_wallet')}
      </Button>
      <SelectWalletModal wallets={wallets} isOpen={visible} onClose={handleClose} onSelectWallet={handleSelectWallet} />
    </Box>
  )
}
