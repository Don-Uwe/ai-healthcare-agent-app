import AmountSlider from '@/components/AmountSlider'
import Button from '@/components/Button'
import TokenAvatar from '@/components/TokenAvatar'
import { useLiquidityStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { formatCurrency } from '@/utils/numberish/formatter'
import {
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
import { FormattedPoolInfoStandardItem } from '@/hooks/pool/type'
import Decimal from 'decimal.js'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CpmmLockData } from '@/hooks/portfolio/cpmm/useLockCpmmBalance'
import { getFirstNonZeroDecimal } from '@/utils/numberish/formatter'
import { ApiV3PoolInfoStandardItemCpmm } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
export default function ClaimFeesModal({
  isOpen,
  onClose,
  poolInfo,
  lockData
}: {
  isOpen: boolean
  onClose: () => void
  poolInfo: FormattedPoolInfoStandardItem
  lockData: CpmmLockData
}) {
  const { t } = useTranslation()

  const harvestLockCpmmLpAct = useLiquidityStore((s) => s.harvestLockCpmmLpAct)
  const [sending, setIsSending] = useState(false)
  const [percent, setPercent] = useState(100)

  const lpFeeValue = new Decimal(lockData.positionInfo.unclaimedFee.usdValue).toFixed(20)
  const mintFeeA = new Decimal(lockData.positionInfo.unclaimedFee.amountA).toFixed(20)
  const mintFeeB = new Decimal(lockData.positionInfo.unclaimedFee.amountB).toFixed(20)

  const [valDecimal, mintADecimal, mintBDecimal] = [
    Math.max(getFirstNonZeroDecimal(lpFeeValue), 4),
    Math.min(getFirstNonZeroDecimal(mintFeeA) + 2, poolInfo.mintA.decimals),
    Math.min(getFirstNonZeroDecimal(mintFeeB) + 2, poolInfo.mintB.decimals)
  ]

  const handlePercentChange = useCallback((val: number) => {
    setPercent(val)
  }, [])

  useEffect(() => {
    setPercent(100)
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader display={'flex'} gap="2" alignItems="center">
          {t('liquidity.claim_fees')}
        </ModalHeader>
        <ModalCloseButton top="25px" />
        <ModalBody mt={[3, 4]}>
          <Text color={colors.lightPurple}> {t('liquidity.total_fees_locked_liquidity')}</Text>
          <Flex bg={colors.backgroundDark} rounded={'xl'} align="center" justifyContent="space-between" p={4} mt={4} mb={6}>
            <Text fontSize={['md', 'xl']} fontWeight="500">
              {formatCurrency(lpFeeValue, {
                symbol: '$',
                decimalPlaces: valDecimal
              })}
            </Text>
            <Text fontSize="sm">
              {formatCurrency(mintFeeA, {
                decimalPlaces: mintADecimal
              })}{' '}
              <Text as="span" color={colors.textSecondary}>
                {poolInfo.mintA?.symbol}
              </Text>
              {' / '}
              {formatCurrency(mintFeeB, {
                decimalPlaces: mintBDecimal
              })}{' '}
              <Text as="span" color={colors.textSecondary}>
                {poolInfo.mintB?.symbol}
              </Text>
            </Text>
          </Flex>
          <AmountSlider renderTopLeftLabel={() => 'You will claim:'} percent={percent} onChange={handlePercentChange} />
          <Flex
            flexDirection="column"
            gap="1"
            mt="5"
            px="5"
            py="4"
            border={`1px solid ${colors.backgroundTransparent10}`}
            bg={colors.backgroundTransparent07}
            rounded="xl"
          >
            <Text variant="title">{t('clmm.you_will_receive')}</Text>
            <HStack mt={2} gap={1}>
              <TokenAvatar mr="-1" size="smi" token={poolInfo.mintA} />
              <Text fontSize="sm">
                {formatCurrency(new Decimal(mintFeeA).mul(percent).div(100).toString(), {
                  decimalPlaces: mintADecimal
                })}{' '}
                <Text as="span" color={colors.textSecondary}>
                  {poolInfo.mintA.symbol}
                </Text>
              </Text>
            </HStack>
            <HStack gap={1}>
              <TokenAvatar mr="-1" size="smi" token={poolInfo.mintB} />
              <Text fontSize="sm">
                {formatCurrency(new Decimal(mintFeeB).mul(percent).div(100).toString(), {
                  decimalPlaces: mintBDecimal
                })}{' '}
                <Text as="span" color={colors.textSecondary}>
                  {poolInfo.mintB.symbol}
                </Text>
              </Text>
            </HStack>
          </Flex>
        </ModalBody>
        <ModalFooter mt="6" mb={3}>
          <Button
            w="full"
            isLoading={sending}
            onClick={() => {
              setIsSending(true)
              harvestLockCpmmLpAct({
                poolInfo: poolInfo as unknown as ApiV3PoolInfoStandardItemCpmm,
                nftMint: new PublicKey(lockData.nftMint),
                lpFeeAmount: new BN(new Decimal(lockData.positionInfo.unclaimedFee.lp).mul(10 ** poolInfo.lpMint.decimals).toFixed(0)).mul(
                  new BN(percent).div(new BN(100))
                ),
                onSent: () => {
                  setIsSending(false)
                  setPercent(100)
                  onClose()
                },
                onError: () => setIsSending(false)
              })
            }}
          >
            {t('liquidity.claim_fee')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
