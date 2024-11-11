import { useTranslation } from 'react-i18next'
import { Badge, Box, Flex, HStack, Text, useClipboard, useDisclosure, Tag } from '@chakra-ui/react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

import Button from '@/components/Button'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import AddressChip from '@/components/AddressChip'
import { FormattedPoolInfoItem } from '@/hooks/pool/type'
import { FormattedFarmInfo } from '@/hooks/farm/type'
import { FarmCategory } from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import CopyIcon from '@/icons/misc/CopyIcon'
import ExternalLinkLargeIcon from '@/icons/misc/ExternalLinkLargeIcon'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import { useAppStore } from '@/store'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import toApr from '@/utils/numberish/toApr'
import { routeToPage } from '@/utils/routeTools'
import { encodeStr } from '@/utils/common'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import MobileFarmDetailDrawer from './MobileFarmDetailDrawer'

import Period from './Period'
import Tvl from './Tvl'
import Unemmitted from './Unemitted'
import WeeklyRewards from './WeeklyRewards'

export type RewardInfo = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  mint: ApiV3Token
}
export default function FarmItem({
  id,
  type,
  standardFarm,
  clmmData
}: {
  id: string
  type: FarmCategory
  standardFarm?: FormattedFarmInfo
  clmmData?: FormattedPoolInfoItem
}) {
  const { t } = useTranslation()
  const isStandard = type === FarmCategory.Standard
  const data = standardFarm || clmmData
  const { isOpen, onClose, onToggle } = useDisclosure({ defaultIsOpen: false })

  if (!data) return null

  const name = isStandard ? standardFarm!.farmName : clmmData!.poolName
  const [baseToken, quoteToken] = isStandard
    ? [standardFarm!.symbolMints[0], standardFarm!.symbolMints[1]]
    : [clmmData!.mintA, clmmData!.mintB]

  const apr = isStandard ? standardFarm!.apr : clmmData!.totalApr.day

  return (
    <Flex {...panelCard} direction="column">
      <Mobile>
        <Box borderTopRadius="xl" bg={colors.backgroundLight} px={4} py={3}>
          <HStack justify={'space-between'} mb={2}>
            <HStack spacing={[2, 3]}>
              <TokenAvatarPair size="sm" token1={baseToken} token2={quoteToken} />
              <Text fontSize="md" color={colors.textPrimary} fontWeight="medium" whiteSpace={'nowrap'}>
                {name?.replace(' - ', '/')}
              </Text>
              {type && <Badge variant="crooked">{type.slice(0, 1)}</Badge>}
            </HStack>
            <Button
              size={'xs'}
              height="1.5rem"
              minHeight="1.5rem"
              px={3}
              variant="outline"
              onClick={() => {
                routeToPage('edit-farm', { queryProps: isStandard ? { farmId: data.id } : { clmmId: data.id } })
              }}
            >
              {t('portfolio.section_my_created_farms_item_edit_farm_button')}
            </Button>
          </HStack>
          <AddressChip
            textProps={{ color: colors.textSecondary, fontSize: 'xs' }}
            showDigitCount={8}
            address={id}
            canExternalLink
            iconProps={{ color: colors.textSecondary }}
          />
          <Flex
            borderRadius="md"
            justifyContent="space-between"
            p={3}
            mt={4}
            alignItems={'center'}
            bg={colors.backgroundDark}
            onClick={onToggle}
          >
            <Flex direction="column" gap={2}>
              <Flex justify="flex-start" align="flex-start" gap={2}>
                <Text fontSize="sm" color={colors.textTertiary}>
                  {t('common.tvl')}
                </Text>
                <Text fontSize="sm" color={colors.textPrimary} fontWeight="medium">
                  {formatCurrency(data.tvl, {
                    symbol: '$',
                    decimalPlaces: isStandard ? standardFarm!.lpMint.decimals : clmmData!.poolDecimals
                  })}
                </Text>
              </Flex>
              <Flex justify="flex-start" align={'flex-start'} gap={2}>
                <Text fontSize="sm" color={colors.textTertiary}>
                  {t('field.apr')}
                </Text>
                <Text fontSize="sm" color={colors.textPrimary} fontWeight="medium">
                  {formatToRawLocaleStr(toApr({ val: apr }))}
                </Text>
              </Flex>
            </Flex>
            <ChevronRightIcon color={colors.secondary} />
          </Flex>
        </Box>
        <MobileFarmDetailDrawer
          isOpen={isOpen}
          onClose={onClose}
          name={name}
          baseToken={baseToken}
          quoteToken={quoteToken}
          id={id}
          type={type}
          tvl={data.tvl}
          apr={apr}
          decimals={isStandard ? standardFarm!.lpMint.decimals : clmmData!.poolDecimals}
          rewardsInfo={data.formattedRewardInfos}
        />
      </Mobile>
      <Desktop>
        <FarmItemHeader name={name} baseToken={baseToken} quoteToken={quoteToken} id={id} type={type} feeRate={clmmData?.feeRate} />
        <Flex
          borderBottomRadius="xl"
          bg={colors.backgroundLight}
          px={9}
          py={4}
          justify="space-between"
          align="flex-start"
          flexWrap="wrap"
          gap={4}
        >
          <Tvl
            tvl={data.tvl}
            decimals={isStandard ? standardFarm!.lpMint.decimals : clmmData!.poolDecimals}
            flex={1.5}
            minW="fit-content"
          />
          <Flex color={colors.textPrimary} direction="column" justify="flex-start" align={'flex-start'} gap={1}>
            <Text fontSize="sm" color={colors.textTertiary}>
              {t('field.apr')}
            </Text>
            <Text fontSize="sm" color={colors.textPrimary}>
              {formatToRawLocaleStr(toApr({ val: apr }))}
            </Text>
          </Flex>
          <WeeklyRewards rewardsInfo={data.formattedRewardInfos} flex={1.5} minW="fit-content" />
          <Period rewardsInfo={data.formattedRewardInfos} flex={2} minW="fit-content" />
          <Unemmitted rewardsInfo={data.formattedRewardInfos} flex={1.5} minW="fit-content" />
          <Flex flex={1} flexShrink={1} my="auto" justify="flex-end" align="center" minW="fit-content">
            <Flex flex={1} flexShrink={1} my="auto" justify="flex-end" align="center" minW={'fit-content'}>
              <Button
                size={'sm'}
                variant="outline"
                onClick={() => {
                  routeToPage('edit-farm', { queryProps: isStandard ? { farmId: data.id } : { clmmId: data.id } })
                }}
              >
                {t('portfolio.section_my_created_farms_item_edit_farm_button')}
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Desktop>
    </Flex>
  )
}

type FarmItemHeaderProps = {
  name: string
  baseToken: ApiV3Token
  quoteToken: ApiV3Token
  id: string
  type: FarmCategory
  feeRate?: number
}

function FarmItemHeader({ name, baseToken, quoteToken, id, type, feeRate }: FarmItemHeaderProps) {
  const isMobile = useAppStore((s) => s.isMobile)
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { onCopy } = useClipboard(id)
  const { t } = useTranslation()

  return (
    <HStack borderTopRadius="xl" bg={colors.backgroundTransparent07} px={[3, 9]} py={[4, 3]} justify={'space-between'}>
      <HStack spacing={[2, 3]}>
        <TokenAvatarPair size={['sm', 'md']} token1={baseToken} token2={quoteToken} />
        <Text fontSize={['md', 'lg']} color={colors.textPrimary} fontWeight="medium" whiteSpace={'nowrap'}>
          {name}
        </Text>
      </HStack>

      {type && <Badge variant="crooked">{isMobile ? type.slice(0, 1) : type}</Badge>}

      {type === FarmCategory.Clmm && feeRate ? (
        <Tag size="sm" variant="rounded">
          {formatToRawLocaleStr(feeRate * 100)}%
        </Tag>
      ) : null}

      <HStack spacing={0} ml={'auto'}>
        <Desktop>
          <Text mr={8} fontSize="xs" color={colors.textSecondary}>
            {t('farm.farm_id')}: {encodeStr(id, 8, 3)}
          </Text>
        </Desktop>
        <Mobile>
          <Text mr={2} fontSize="xs" color={colors.textSecondary}>
            {encodeStr(id)}
          </Text>
        </Mobile>
        <HStack spacing={1}>
          <CopyIcon
            cursor="pointer"
            onClick={onCopy}
            fill={colors.textSecondary}
            width={isMobile ? '12px' : '16px'}
            height={isMobile ? '12px' : '16px'}
          />
          <ExternalLinkLargeIcon
            cursor="pointer"
            onClick={() => window.open(`${explorerUrl}/account/${id}`)}
            color={colors.textSecondary}
            width={isMobile ? '12px' : '16px'}
            height={isMobile ? '12px' : '16px'}
          />
        </HStack>
      </HStack>
    </HStack>
  )
}
