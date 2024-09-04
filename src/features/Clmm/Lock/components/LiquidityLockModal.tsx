import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Box,
  Flex,
  HStack,
  Input
} from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { colors } from '@/theme/cssVariables'
import TokenAvatar from '@/components/TokenAvatar'
import InfoCircleIcon from '@/icons/misc/InfoCircleIcon'
import WarningIcon from '@/icons/misc/WarningIcon'
import { shortenAddress } from '@/utils/token'
import { getMintSymbol } from '@/utils/token'
import { formatCurrency } from '@/utils/numberish/formatter'
import { FormattedPoolInfoConcentratedItem } from '@/hooks/pool/type'
import useClmmBalance, { ClmmPosition } from '@/hooks/portfolio/clmm/useClmmBalance'
import { TokenPrice } from '@/hooks/token/useTokenPrice'
import { useClmmStore } from '@/store'

function LiquidityLockModal({
  isOpen,
  onClose,
  onRefresh,
  poolInfo,
  position,
  tokenPrices
}: {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
  poolInfo: FormattedPoolInfoConcentratedItem
  position: ClmmPosition
  tokenPrices: Record<string, TokenPrice>
}) {
  const { t } = useTranslation()
  const lockPositionAct = useClmmStore((s) => s.lockPositionAct)
  const { getPriceAndAmount } = useClmmBalance({})
  const { amountA, amountB } = getPriceAndAmount({ poolInfo, position })

  const [confirmText, setConfirmText] = useState('')

  const handleCloseModal = () => {
    setConfirmText('')
    onClose()
  }

  const poolNft = position.nftMint.toBase58()
  const poolName = poolInfo.poolName

  const mintAValue = amountA.mul(tokenPrices[poolInfo.mintA.address]?.value || 0)
  const mintBValue = amountB.mul(tokenPrices[poolInfo.mintB.address]?.value || 0)
  const positionAmount = mintAValue.add(mintBValue)

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} size={{ base: 'md', md: 'xl' }}>
      <ModalOverlay />
      <ModalContent bg={colors.backgroundLight} border={`1px solid ${colors.buttonSolidText}`} p={{ base: 4, md: 8 }}>
        <Flex flexDirection="column" justifyContent="center" alignItems="center" gap={5} mt={2}>
          <InfoCircleIcon width={32} height={32} color={colors.textPink} />
          <Text fontSize="xl" fontWeight="medium">
            {t('liquidity.lock_liquidity_permanently')}
          </Text>
        </Flex>
        <ModalCloseButton />
        <ModalBody mt={6}>
          <Text color={colors.lightPurple} lineHeight="20px">
            <Trans i18nKey="liquidity.lock_desc">
              <Text as="span" fontWeight="bold"></Text>
              <Text as="span" fontWeight="bold"></Text>
            </Trans>
          </Text>
          <Box
            rounded={'xl'}
            border={`1px solid ${colors.selectInactive}`}
            bg={colors.modalContainerBg}
            px={5}
            py={3}
            my={6}
            mx={[0, 0, 16]}
          >
            <Flex alignItems="center" gap={1} justifyContent="space-between" color={colors.lightPurple} mb={2}>
              <Text>
                {poolName} {t('liquidity.pool_position_nft')}
              </Text>
              <Text>{shortenAddress(poolNft, 5)}</Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" color={colors.lightPurple} mb={2}>
              <Text>{t('clmm.position')}: </Text>
              <Text>
                {formatCurrency(positionAmount, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" mb={3} fontSize="sm">
              <HStack gap={1}>
                <TokenAvatar size={'sm'} token={poolInfo.mintA} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(amountA, {
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
                <Text color={colors.lightPurple}>{getMintSymbol({ mint: poolInfo.mintA, transformSol: true })}</Text>
              </HStack>
              <Text color={colors.textPrimary}>
                {formatCurrency(mintAValue, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
            <Flex alignItems="center" gap={1} justifyContent="space-between" fontSize="14px">
              <HStack gap={1}>
                <TokenAvatar size={'sm'} token={poolInfo.mintB} />
                <Text color={colors.textPrimary}>
                  {formatCurrency(amountB, {
                    abbreviated: true,
                    decimalPlaces: 2
                  })}
                </Text>
                <Text color={colors.lightPurple}>{getMintSymbol({ mint: poolInfo.mintB, transformSol: true })}</Text>
              </HStack>
              <Text color={colors.textPrimary}>
                {formatCurrency(mintBValue, {
                  symbol: '$',
                  abbreviated: true,
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
          </Box>
          <Flex rounded={'lg'} bg={colors.background03} py={3} px={4} gap={3}>
            <Text pt={0.5}>
              <WarningIcon stroke={colors.textPink} width="16" height="16" />
            </Text>
            <Text color={colors.textPink} fontSize="sm" fontWeight="medium">
              {t('liquidity.lock_agree_text')}
            </Text>
          </Flex>
          <Flex
            flexDirection="column"
            alignItems={['flex-start', 'center']}
            rounded={'xl'}
            bg={colors.modalContainerBg}
            border={`1px solid ${colors.selectInactive}`}
            px={7}
            py={4}
            gap={2}
            mt={6}
          >
            <Text color={colors.lightPurple}>{t('liquidity.lock_to_confirm')}</Text>
            <Text color={colors.lightPurple} fontWeight="medium">
              {t('liquidity.lock_confirm_text')}
            </Text>
            <Input
              variant="filledDark"
              w="full"
              rounded="lg"
              color={colors.lightPurple}
              fontSize="md"
              fontWeight="medium"
              sx={{
                _placeholder: {
                  textAlign: 'center'
                }
              }}
              onChange={(e) => setConfirmText(e.currentTarget.value)}
              placeholder={t('clmm.type_confirm_text') || ''}
            />
          </Flex>
        </ModalBody>
        <ModalFooter mt="8" flexDirection="column" gap="2">
          <Button
            variant="danger"
            w="full"
            loadingText={t('liquidity.lock_liquidity') + '...'}
            isDisabled={confirmText !== t('liquidity.lock_confirm_text')}
            onClick={() => {
              lockPositionAct({
                poolInfo,
                position,
                onConfirmed: () => {
                  handleCloseModal()
                  setTimeout(() => onRefresh(), 1000)
                }
              })
            }}
          >
            {t('liquidity.confirm_lock_liquidity_permanently')}
          </Button>
          <Button w="full" variant="ghost" fontSize="sm" color={colors.buttonPrimary} onClick={handleCloseModal}>
            {t('button.cancel')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default LiquidityLockModal
