import TokenInput from '@/components/TokenInput'
import { useEvent } from '@/hooks/useEvent'
import AddLiquidityPlus from '@/icons/misc/AddLiquidityPlus'
import InputLockIcon from '@/icons/misc/InputLockIcon'
import { useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import { wsolToSolToken } from '@/utils/token'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoConcentratedItem, WSOLMint } from '@raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export type TokenParams = { token1?: string; token2?: string }
export enum InputSide {
  TokenA = 'tokenA',
  TokenB = 'tokenB'
}

interface Props {
  pool?: ApiV3PoolInfoConcentratedItem
  readonly?: boolean
  tokenAmount: string[]
  disableSelectToken?: boolean
  token1Disable?: boolean
  token2Disable?: boolean
  maxMultiplier?: number | string
  baseIn?: boolean
  onTokenChange?: (val: TokenParams, userTriggered?: boolean) => void
  onAmountChange: (val: string, side: string) => void
  onFocusChange: (mint?: string) => void
}

export default function CLMMTokenInputGroup(props: Props) {
  const { t } = useTranslation()
  const {
    pool,
    tokenAmount,
    maxMultiplier,
    disableSelectToken,
    token1Disable,
    token2Disable,
    readonly,
    baseIn = true,
    onTokenChange,
    onAmountChange,
    onFocusChange
  } = props
  const tokenMap = useTokenStore((s) => s.tokenMap)

  useEffect(() => {
    if (!pool) return
    onTokenChange?.({
      token1: pool.mintA.address === WSOLMint.toString() ? PublicKey.default.toBase58() : pool.mintA.address,
      token2: pool.mintB.address
    })
  }, [pool?.id, tokenMap, onTokenChange])

  const handleToken1Change = useEvent((val: string) => onAmountChange(val, InputSide.TokenA))
  const handleToken2Change = useEvent((val: string) => onAmountChange(val, InputSide.TokenB))

  useEffect(() => {
    if (token1Disable) handleToken1Change('0')
  }, [token1Disable, handleToken1Change])

  useEffect(() => {
    if (token2Disable) handleToken2Change('0')
  }, [token2Disable, handleToken2Change])

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      sx={{
        '& circle': {
          color: colors.primary
        },
        '& line': {
          color: '#000',
          strokeWidth: 1
        }
      }}
    >
      <Flex w="100%">
        <TokenInput
          ctrSx={{ w: '100%' }}
          disableTotalInputByMask={token1Disable}
          renderMaskProps={{ bg: colors.inputMask }}
          renderMaskContent={
            <VStack px={16} fontSize="xs" color={colors.textPrimary}>
              <InputLockIcon />
              <Text align={'center'}>{t('clmm.input_lock_desc')}</Text>
            </VStack>
          }
          disableSelectToken={disableSelectToken}
          readonly={readonly || token1Disable}
          value={tokenAmount[0]}
          token={pool ? wsolToSolToken(pool[baseIn ? 'mintA' : 'mintB']) : undefined}
          maxMultiplier={maxMultiplier}
          onChange={handleToken1Change}
          onFocus={() => onFocusChange(pool?.[baseIn ? 'mintA' : 'mintB'].address)}
        />
      </Flex>
      <Box my={'-10px'} zIndex={1}>
        <AddLiquidityPlus />
      </Box>
      <Flex w="100%">
        <TokenInput
          ctrSx={{ w: '100%' }}
          disableTotalInputByMask={token2Disable}
          renderMaskProps={{ bg: colors.inputMask }}
          renderMaskContent={
            <VStack px={16} fontSize="xs" color={colors.textPrimary}>
              <InputLockIcon />
              <Text align={'center'}>{t('clmm.input_lock_desc')}</Text>
            </VStack>
          }
          disableSelectToken={disableSelectToken}
          readonly={readonly || token2Disable}
          value={tokenAmount[1]}
          token={pool ? wsolToSolToken(pool[baseIn ? 'mintB' : 'mintA']) : undefined}
          maxMultiplier={maxMultiplier}
          onChange={handleToken2Change}
          onFocus={() => onFocusChange(pool?.[baseIn ? 'mintB' : 'mintA'].address)}
        />
      </Flex>
    </Flex>
  )
}
