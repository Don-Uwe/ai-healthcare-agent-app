import { Box, SimpleGrid } from '@chakra-ui/react'

import Button from '@/components/Button'
import FullExpandIcon from '@/icons/misc/FullExpandIcon'
import MinusIcon from '@/icons/misc/MinusIcon'
import PlusIcon from '@/icons/misc/PlusIcon'
import { colors } from '@/theme/cssVariables'
import { routeToPage } from '@/utils/routeTools'
import { useTranslation } from 'react-i18next'

type ActionButtonsProps = {
  variant?: 'drawer-face'
  poolId: string
  farmId?: string
  hasFarmLp: boolean
  canMigrate: boolean
  canStake: boolean
  canViewMore: boolean
  onClickViewMore?(): void
  onMigrateOpen?(): void
}

export default function ActionButtons({
  variant,
  poolId,
  farmId,
  hasFarmLp,
  canMigrate,
  canViewMore,
  canStake,
  onClickViewMore,
  onMigrateOpen
}: ActionButtonsProps) {
  const { t } = useTranslation()
  const onUnstaking = () => {
    routeToPage('decrease-liquidity', {
      queryProps: {
        mode: 'unstake',
        pool_id: poolId,
        farm_id: farmId
      }
    })
  }
  const onRemoveLiquidity = () => {
    routeToPage('decrease-liquidity', {
      queryProps: {
        mode: 'remove',
        pool_id: poolId
      }
    })
  }

  const onStake = () => {
    routeToPage('increase-liquidity', {
      queryProps: {
        mode: 'stake',
        pool_id: poolId
      }
    })
  }

  const onAddLiquidity = () => {
    routeToPage('increase-liquidity', {
      queryProps: {
        mode: 'add',
        pool_id: poolId
      }
    })
  }

  return (
    <SimpleGrid
      mt={[2, 'unset']}
      templateColumns={variant === 'drawer-face' ? '1fr 1fr' : '1fr auto auto auto'}
      gridAutoFlow={variant === 'drawer-face' ? undefined : 'column'}
      gap={[variant === 'drawer-face' ? 4 : 2, 3]}
    >
      {variant !== 'drawer-face' &&
        (canViewMore ? (
          <Button mr={'auto'} leftIcon={<FullExpandIcon />} variant="ghost" size="sm" onClick={onClickViewMore}>
            {t('common.view_more')}
          </Button>
        ) : (
          <Box></Box>
        ))}
      <Button
        gridColumn={variant === 'drawer-face' ? 'span 1' : undefined}
        variant="outline"
        size={variant === 'drawer-face' ? 'md' : 'xs'}
        w={variant === 'drawer-face' ? undefined : 9}
        h={variant === 'drawer-face' ? undefined : '30px'}
        px={0}
        onClick={hasFarmLp ? onUnstaking : onRemoveLiquidity}
      >
        <MinusIcon color={colors.secondary} />
      </Button>
      <Button
        gridColumn={variant === 'drawer-face' ? 'span 1' : undefined}
        variant="solid"
        size={variant === 'drawer-face' ? 'md' : 'xs'}
        w={variant === 'drawer-face' ? undefined : 9}
        h={variant === 'drawer-face' ? undefined : '30px'}
        px={0}
      >
        <PlusIcon color={colors.buttonSolidText} onClick={onAddLiquidity} />
      </Button>
      {canMigrate ? (
        <>
          <Button
            gridColumn={variant === 'drawer-face' ? 'span 2' : undefined}
            size={variant === 'drawer-face' ? 'md' : 'sm'}
            onClick={onMigrateOpen}
          >
            {t('portfolio.stake_item_migrate_button')}
          </Button>
        </>
      ) : (
        <Button
          gridColumn={variant === 'drawer-face' ? 'span 2' : undefined}
          size={variant === 'drawer-face' ? 'md' : 'sm'}
          isDisabled={!canStake}
          onClick={onStake}
        >
          {t('portfolio.stake_item_stake_button')}
        </Button>
      )}
    </SimpleGrid>
  )
}
