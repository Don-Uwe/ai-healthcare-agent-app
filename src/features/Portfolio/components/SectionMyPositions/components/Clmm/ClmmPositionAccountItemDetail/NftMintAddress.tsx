import { Flex, HStack, Link, Text, useClipboard } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import CopyIcon from '@/icons/misc/CopyIcon'
import ExternalLinkLargeIcon from '@/icons/misc/ExternalLinkLargeIcon'
import { colors } from '@/theme/cssVariables'
import { useAppStore, supportedExplorers } from '@/store/useAppStore'

type NftMintAddressProps = {
  nftMintAddress?: string
}

export default function NftMintAddress({ nftMintAddress }: NftMintAddressProps) {
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { onCopy, setValue } = useClipboard('')
  const { t } = useTranslation()
  const address = nftMintAddress ? nftMintAddress.slice(0, 6).concat('..').concat(nftMintAddress.slice(-5)) : ''

  return (
    <Flex flex={3} bg={colors.backgroundDark} w="full" rounded="xl" p={4} direction="column" gap={2} fontSize="sm">
      <Flex justify="space-between" align="center">
        <Text color={colors.textSecondary}>{t('clmm.nft_mint_address')}</Text>
      </Flex>
      <HStack spacing={3}>
        <Text color={colors.textPrimary}>{address}</Text>
        <HStack spacing={1}>
          <CopyIcon
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setValue(nftMintAddress ?? '')
              onCopy()
              toastSubject.next({
                status: 'success',
                title: t('common.copy_success'),
                description: t('common.copied_desc', { subject: `${t('common.nft_address')}: ${address}` })
              })
            }}
          />
          <Link
            href={
              explorerUrl === supportedExplorers[0]?.host
                ? `${explorerUrl}/token/${nftMintAddress}`
                : `${explorerUrl}/address/${nftMintAddress}`
            }
            isExternal
          >
            <ExternalLinkLargeIcon />
          </Link>
        </HStack>
      </HStack>
    </Flex>
  )
}
