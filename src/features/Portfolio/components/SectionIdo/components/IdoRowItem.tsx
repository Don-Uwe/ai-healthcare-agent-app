import { Desktop } from '@/components/MobileDesktop'
import TokenAvatar from '@/components/TokenAvatar'
import { OwnerFullData } from '@/hooks/portfolio/useFetchOwnerIdo'
import { useAppStore, useFarmStore } from '@/store'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables/colors'
import { formatCurrency } from '@/utils/numberish/formatter'
import { getMintName, getMintSymbol } from '@/utils/token'
import { IdoKeysData } from '@raydium-io/raydium-sdk-v2'
import { Box, Button, Divider, Flex, Grid, GridItem, HStack, Stack, Text, useDisclosure } from '@chakra-ui/react'
import Decimal from 'decimal.js'
import { useTranslation } from 'react-i18next'

export default function IdoRowItem(ownerInfo: OwnerFullData & { idoKeys: IdoKeysData }) {
  const { t } = useTranslation()
  const claimIdoAct = useFarmStore((s) => s.claimIdoAct)
  const refreshIdoAct = useFarmStore((s) => s.refreshIdoAct)
  const isMobile = useAppStore((s) => s.isMobile)
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()

  const { coin, pc, idoKeys } = ownerInfo

  const onClick = () => {
    if (!idoKeys) return
    onLoading()
    claimIdoAct({
      ownerInfo,
      idoKeys,
      onConfirmed: () => setTimeout(() => refreshIdoAct(), 2000),
      onFinally: offLoading
    })
  }

  if (!idoKeys) return null
  const { projectInfo, buyInfo } = idoKeys

  return (
    <Grid
      {...panelCard}
      gridTemplate={[
        `
        "icon   icon  " auto
        "info1  info2 " auto
        "action action" auto / 1fr 1fr
      `,
        `
        "icon info1 info2 action " auto / 1.2fr 1fr 1fr 1.5fr
      `
      ]}
      alignItems={'center'}
      bg={colors.backgroundLight}
      fontWeight={500}
      rounded="md"
      px={[4, 9]}
      py={4}
      gap={4}
    >
      <GridItem area={'icon'}>
        <Flex justifyContent="space-between" alignItems="center">
          <HStack gap="3">
            <TokenAvatar size={['md', 'lg']} token={projectInfo.mint} />
            <Stack direction={isMobile ? 'row' : 'column'} alignItems={['center', 'unset']} spacing={[2, 0]}>
              <Text>{getMintSymbol({ mint: projectInfo.mint })}</Text>
              <Text variant="label">{getMintName({ mint: projectInfo.mint })}</Text>
            </Stack>
          </HStack>
          <Desktop>
            <Divider h="26px" borderColor={colors.primary} opacity="0.5" orientation="vertical" />
          </Desktop>
        </Flex>
      </GridItem>

      <GridItem area={'info1'}>
        <Flex direction="column" gap="0.2">
          <Box m="0 auto">
            <Text variant="label">
              {t('acceleraytor.unclaim')} {getMintSymbol({ mint: projectInfo.mint, transformSol: true })}
            </Text>
            <Text>
              {formatCurrency(new Decimal(coin).div(10 ** projectInfo.mint.decimals).toString(), {
                decimalPlaces: projectInfo.mint.decimals
              })}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem area={'info2'}>
        <Flex direction="column" gap="0.2">
          <Box m="0 auto">
            <Text variant="label">
              {t('acceleraytor.unclaim')} {getMintSymbol({ mint: buyInfo.mint, transformSol: true })}
            </Text>
            <Text>
              {formatCurrency(new Decimal(pc).div(10 ** buyInfo.mint.decimals).toString(), {
                decimalPlaces: buyInfo.mint.decimals
              })}
            </Text>
          </Box>
        </Flex>
      </GridItem>

      <GridItem area={'action'} justifySelf={['center', 'end']}>
        <Button size="sm" w={['12em', 'fit-content']} variant="outline" isLoading={isLoading} onClick={onClick}>
          {t('button.claim')}
        </Button>
      </GridItem>
    </Grid>
  )
}
