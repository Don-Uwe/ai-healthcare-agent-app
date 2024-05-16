import { Box, Flex, Grid, GridItem, HStack, Link, Text, useDisclosure } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, solToWSol } from '@raydium-io/raydium-sdk-v2'
import { useCallback, useRef, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import shallow from 'zustand/shallow'

import PanelCard from '@/components/PanelCard'
import { StepsRef } from '@/components/Steps'
import SubPageNote from '@/components/SubPageNote'
import PreviewDepositModal from '@/features/Clmm/components/PreviewDepositModal'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { CreatePoolBuildData, useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { debounce, exhaustCall } from '@/utils/functionMethods'
import { routeBack, routeToPage } from '@/utils/routeTools'
import { solToWSolToken } from '@/utils/token'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import SelectPoolToken from './components/SelectPoolTokenAndFee'
import SetPriceAndRange from './components/SetPriceAndRange'
import Stepper from './components/Stepper'
import TokenAmountPairInputs from './components/TokenAmountInput'
import { useEvent } from '@/hooks/useEvent'

export default function CreateClmmPool() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const [createClmmPool, openPositionAct] = useClmmStore((s) => [s.createClmmPool, s.openPositionAct], shallow)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const [step, setStep] = useState(0)
  const [baseIn, setBaseIn] = useState(true)
  const [createPoolData, setCreatePoolData] = useState<CreatePoolBuildData | undefined>()
  const [isTxSending, setIsTxSending] = useState(false)
  const debounceSetBuildData = debounce((data: CreatePoolBuildData) => setCreatePoolData(data), 150)

  const { data: tokenPrices } = useTokenPrice({
    mintList: [createPoolData?.extInfo.mockPoolInfo.mintA.address, createPoolData?.extInfo.mockPoolInfo.mintB.address]
  })

  const currentCreateInfo = useRef<{
    token1?: ApiV3Token
    token2?: ApiV3Token
    config?: ApiClmmConfigInfo
    startTime?: number
    price: string
    tickLower?: number
    tickUpper?: number
    priceLower?: string
    priceUpper?: string
    amount1?: string
    amount2?: string
    liquidity?: BN
    inputA: boolean
  }>({
    inputA: true,
    price: ''
  })

  const stepsRef = useRef<StepsRef>(null)

  const handleEdit = useCallback((step: number) => {
    stepsRef.current?.setActiveStep(step)
  }, [])

  const handleStep1Confirm = useCallback(
    ({ token1, token2, ammConfig }: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => {
      onLoading()
      currentCreateInfo.current.token1 = solToWSolToken(token1)
      currentCreateInfo.current.token2 = solToWSolToken(token2)
      currentCreateInfo.current.config = ammConfig
      createClmmPool({
        config: ammConfig,
        token1: solToWSolToken(token1),
        token2: solToWSolToken(token2),
        price: '1',
        forerunCreate: true
      })
        .then(({ buildData }) => {
          if (!buildData) return
          setBaseIn(solToWSol(token1.address).equals(solToWSol(buildData?.extInfo.mockPoolInfo?.mintA.address || '')))
          setCreatePoolData(buildData)
          stepsRef.current?.goToNext()
        })
        .finally(offLoading)
    },
    [createClmmPool]
  )

  const handlePriceChange = useCallback(
    ({ price }: { price: string }) => {
      const { token1, token2, config } = currentCreateInfo.current
      if (!token1 || !token2 || !config) return
      createClmmPool({ config, token1, token2, price: price && new Decimal(price).gt(0) ? price : '1', forerunCreate: true }).then(
        ({ buildData }) => {
          debounceSetBuildData(buildData)
        }
      )
    },
    [createClmmPool, debounceSetBuildData]
  )

  const handleStep2Confirm = useEvent(
    (props: { price: string; tickLower: number; tickUpper: number; priceLower: string; priceUpper: string; startTime?: number }) => {
      stepsRef.current?.goToNext()
      currentCreateInfo.current = {
        ...currentCreateInfo.current,
        ...props
      }
    }
  )

  const handleStep3Confirm = useCallback(
    ({ inputA, liquidity, amount1, amount2 }: { inputA: boolean; liquidity: BN; amount1: string; amount2: string }) => {
      currentCreateInfo.current.inputA = inputA
      currentCreateInfo.current.liquidity = liquidity
      currentCreateInfo.current.amount1 = amount1
      currentCreateInfo.current.amount2 = amount2
      onOpen()
    },
    []
  )

  const handleSwitchBase = useCallback(
    (baseIn: boolean) => {
      const [token1, token2] = [currentCreateInfo.current.token1, currentCreateInfo.current.token2]
      currentCreateInfo.current.token1 = token2
      currentCreateInfo.current.token2 = token1
      setBaseIn(baseIn)
    },
    [setBaseIn]
  )

  const handleChangeStep = useCallback((newStep: number) => {
    setStep(newStep)
  }, [])

  const handleCreateAndOpen = useEvent(
    exhaustCall(async () => {
      setIsTxSending(true)
      const { token1, token2, config, price, startTime } = currentCreateInfo.current
      const { buildData } = await createClmmPool({
        config: config!,
        token1: token1!,
        token2: token2!,
        price,
        startTime
      })

      if (!buildData) return

      const [mintAAmount, mintBAmount] = [
        new Decimal(currentCreateInfo.current.amount1!).mul(10 ** buildData.extInfo.mockPoolInfo.mintA.decimals).toFixed(0),
        new Decimal(currentCreateInfo.current.amount2!).mul(10 ** buildData.extInfo.mockPoolInfo.mintB.decimals).toFixed(0)
      ]

      openPositionAct({
        poolInfo: buildData.extInfo.mockPoolInfo,
        poolKeys: buildData.extInfo.address,
        tickLower: Math.min(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        tickUpper: Math.max(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        base: currentCreateInfo.current.inputA ? 'MintA' : 'MintB',
        baseAmount: currentCreateInfo.current.inputA ? mintAAmount : mintBAmount,
        otherAmountMax: currentCreateInfo.current.inputA ? mintBAmount : mintAAmount,
        createPoolBuildData: buildData,
        onConfirmed: () => routeToPage('pools'),
        onFinally: () => setIsTxSending(false)
      })
    })
  )
  const friendlySentence = [
    t('create_pool.clmm_create_pool_note_step1'),
    t('create_pool.clmm_create_pool_note_step2'),
    t('create_pool.clmm_create_pool_note_step3')
  ][step]

  const needToShowSelectPoolToken = isMobile ? step === 0 : step >= 0
  const needToShowSetPriceAndRange = isMobile ? step === 1 : step >= 1
  const needToShowTokenAmountInput = isMobile ? step === 2 : step >= 2

  return (
    <>
      <Grid
        gridTemplate={[
          `
            "back  " auto
            "step  " auto
            "panel " auto
            "note  " minmax(80px, 1fr) / 1fr  
          `,
          `
            "back word  " auto
            "step panel " auto
            "note panel " 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 500 })}
          `,
          `
            "back word  . " auto
            "step panel . " auto
            "note panel . " 1fr / ${genCSS3GridTemplateColumns({ rightLeft: 344, center: 500 })}
          `
        ]}
        columnGap={[4, '5%']}
        rowGap={[4, '2vh']}
        mt={[2, 8]}
      >
        {/* left */}
        <GridItem area={'back'}>
          <Flex>
            <HStack
              cursor="pointer"
              onClick={() => {
                routeBack()
              }}
              color={colors.textTertiary}
              fontWeight="500"
              fontSize={['md', 'xl']}
            >
              <ChevronLeftIcon />
              <Text>{t('common.back')}</Text>
            </HStack>
          </Flex>
        </GridItem>

        <GridItem area="step">
          <Stepper stepRef={stepsRef} onChange={handleChangeStep} />
        </GridItem>

        <GridItem area="note">
          <Box
            w={['unset', 'clamp(300px, 100%, 500px)']}
            position={['absolute', 'unset']}
            left={'20px'}
            right={'20px'}
            bottom={'calc(20px + 54px)' /* 54px is mobile bottom nav's height */}
            zIndex={100}
          >
            <SubPageNote
              canInteract={isMobile}
              title={t('create_pool.clmm_please_note')}
              description={
                <Text fontSize="sm" color={colors.textTertiary}>
                  <Trans i18nKey="create_pool.clmm_please_note_des">
                    <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
                      CLMM
                    </Link>
                    <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool" isExternal>
                      Standard
                    </Link>
                  </Trans>
                </Text>
              }
            />
          </Box>
        </GridItem>

        <GridItem area="word" display={['none', 'unset']}>
          <Text whiteSpace={'pre-line'} w="fit-content" cursor="pointer" color={colors.textSecondary} fontWeight="500" fontSize="xl">
            {friendlySentence}
          </Text>
        </GridItem>

        <GridItem area="panel">
          <Flex flexDirection="column" gap={3}>
            {needToShowSelectPoolToken && (
              <SelectPoolToken isLoading={isLoading} completed={step > 0} onConfirm={handleStep1Confirm} onEdit={handleEdit} />
            )}
            {needToShowSetPriceAndRange ? (
              <SetPriceAndRange
                initState={{
                  currentPrice: createPoolData?.extInfo.mockPoolInfo.price.toString() || currentCreateInfo.current.price,
                  priceRange: [currentCreateInfo.current.priceLower || '', currentCreateInfo.current.priceUpper || ''],
                  startTime: createPoolData
                    ? Number(createPoolData.extInfo.mockPoolInfo.openTime) * 1000
                    : currentCreateInfo.current.startTime
                }}
                completed={step > 1}
                token1={currentCreateInfo.current.token1!}
                token2={currentCreateInfo.current.token2!}
                tokenPrices={tokenPrices}
                tempCreatedPool={createPoolData?.extInfo.mockPoolInfo}
                baseIn={baseIn}
                onPriceChange={handlePriceChange}
                onSwitchBase={handleSwitchBase}
                onConfirm={handleStep2Confirm}
                onEdit={handleEdit}
              />
            ) : null}

            {needToShowTokenAmountInput ? (
              <PanelCard px={[3, 6]} py={[3, 4]} fontSize="sm" fontWeight="500" color={colors.textSecondary}>
                <TokenAmountPairInputs
                  baseIn={baseIn}
                  tempCreatedPool={createPoolData!.extInfo.mockPoolInfo}
                  priceLower={currentCreateInfo.current.priceLower!}
                  priceUpper={currentCreateInfo.current.priceUpper!}
                  tickLower={currentCreateInfo.current.tickLower!}
                  tickUpper={currentCreateInfo.current.tickUpper!}
                  onConfirm={handleStep3Confirm}
                />
              </PanelCard>
            ) : null}
          </Flex>
        </GridItem>
      </Grid>
      {createPoolData && isOpen ? (
        <PreviewDepositModal
          tokenPrices={tokenPrices}
          isOpen={isOpen}
          isSending={isTxSending}
          isCreatePool
          pool={createPoolData.extInfo.mockPoolInfo}
          baseIn={baseIn}
          onConfirm={handleCreateAndOpen}
          onClose={onClose}
          tokenAmount={[currentCreateInfo.current.amount1 || '0', currentCreateInfo.current.amount2 || '1']}
          priceRange={[currentCreateInfo.current.priceLower || '2', currentCreateInfo.current.priceUpper || '3']}
        />
      ) : null}
    </>
  )
}
