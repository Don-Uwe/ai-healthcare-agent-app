import { Flex, useBreakpointValue } from '@chakra-ui/react'
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
  const device = useBreakpointValue({ base: 'isMobile', sm: 'isTablet', md: 'isDesktop' })
  const isMobile = device === 'isMobile'
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
    <Flex mt={[2, 0]} direction={variant === 'drawer-face' ? 'column' : 'row'} wrap="wrap" gap={[variant === 'drawer-face' ? 4 : 2, 3]}>
      {variant !== 'drawer-face' && canViewMore && (
        <Button
          mr={'auto'}
          leftIcon={<FullExpandIcon />}
          variant="ghost"
          size="sm"
          flex={isMobile ? undefined : '1 1 auto'}
          onClick={onClickViewMore}
        >
          {t('common.view_more')}
        </Button>
      )}
      <Flex gap={[variant === 'drawer-face' ? 4 : 2, 3]} flex={1} justifyContent="flex-end">
        <Button
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
          variant="solid"
          size={variant === 'drawer-face' ? 'md' : 'xs'}
          w={variant === 'drawer-face' ? undefined : 9}
          h={variant === 'drawer-face' ? undefined : '30px'}
          px={0}
          onClick={onAddLiquidity}
        >
          <PlusIcon color={colors.buttonSolidText} />
        </Button>
        {canMigrate ? (
          <Button size={variant === 'drawer-face' ? 'md' : 'sm'} onClick={onMigrateOpen}>
            {t('portfolio.stake_item_migrate_button')}
          </Button>
        ) : (
          <Button size={variant === 'drawer-face' ? 'md' : 'sm'} isDisabled={!canStake} onClick={onStake}>
            {t('portfolio.stake_item_stake_button')}
          </Button>
        )}
      </Flex>
    </Flex>
  )
}
