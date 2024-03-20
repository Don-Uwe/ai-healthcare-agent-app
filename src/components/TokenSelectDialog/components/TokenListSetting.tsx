import { Box, Divider, Grid, GridItem, Text, HStack, Switch } from '@chakra-ui/react'
import { JupTokenType } from '@raydium-io/raydium-sdk-v2'
import { useEvent } from '@/hooks/useEvent'
import { useAppStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { Select } from '@/components/Select'
import { useTranslation } from 'react-i18next'

export default function TokenListSetting({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  const mintGroup = useTokenStore((s) => s.mintGroup)

  const isRaydiumTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.official)
  const isJuiterTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.jup)
  const isUserAddedTokenListSwitchOn = useAppStore((s) => s.displayTokenSettings.userAdded)

  const raydiumTokenListTokenCount = mintGroup.official.size
  const jupiterTokenListTokenCount = mintGroup.jup.size
  const userAddedTokenListTokenCount = useTokenStore.getState().extraLoadedTokenList.length

  const jupiterTokenListTypes = [t('token_selector.jupiter_types_all'), t('token_selector.jupiter_types_strict')]
  const currentJupiterTokenListType = useAppStore((s) => s.jupTokenType)

  const handleJupiterTokenListTypeChange = useEvent((type: JupTokenType) => {
    useTokenStore.getState().loadTokensAct(false, type)
  })

  const handleSwitchChange = useEvent((name: 'official' | 'jup' | 'userAdded', turnOn: boolean) => {
    useAppStore.setState((s) => ({ displayTokenSettings: { ...s.displayTokenSettings, [name]: turnOn } }))
  })

  return (
    <Box height="50vh">
      <TokenListRowItem
        name={`Raydium ${t('common.token_list')}`}
        tokenCount={raydiumTokenListTokenCount}
        isOpen={isRaydiumTokenListSwitchOn}
        switchable={false}
      />
      <Divider my="10px" color={colors.backgroundTransparent12} />
      <TokenListRowItem
        name={`Jupiter ${t('common.token_list')}`}
        tokenCount={jupiterTokenListTokenCount}
        isOpen={isJuiterTokenListSwitchOn}
        onOpen={() => handleSwitchChange('jup', true)}
        onClose={() => handleSwitchChange('jup', false)}
        typeItems={jupiterTokenListTypes}
        currentTypeItem={currentJupiterTokenListType}
        onTypeItemChange={(v) =>
          jupiterTokenListTypes.includes(v as JupTokenType) && handleJupiterTokenListTypeChange(v.toLowerCase() as JupTokenType)
        }
      />
      <Divider my="10px" color={colors.backgroundTransparent12} />
      <TokenListRowItem
        name={`${t('common.user_added')} ${t('common.token_list')}`}
        tokenCount={userAddedTokenListTokenCount}
        isOpen={isUserAddedTokenListSwitchOn}
        onOpen={() => handleSwitchChange('userAdded', true)}
        onClose={() => handleSwitchChange('userAdded', false)}
        onClick={() => onClick()}
      />
    </Box>
  )
}

function TokenListRowItem({
  name,
  tokenCount,
  switchable = true,
  isOpen,
  onOpen,
  onClose,
  onClick,
  typeItems,
  currentTypeItem,
  onTypeItemChange
}: {
  name: string
  tokenCount: number
  switchable?: boolean
  typeItems?: string[]
  currentTypeItem?: string
  onTypeItemChange?: (type: string) => void
  isOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
  onClick?: () => void
}) {
  return (
    <Grid
      gridTemplate={`
        "name     switch  " auto
        "widgets  widgets " auto / 1fr auto
      `}
      gap={[1, 2]}
      alignItems="center"
      cursor="pointer"
    >
      <GridItem gridArea="name" onClick={() => onClick?.()}>
        <Text color={colors.textSecondary} textTransform="capitalize">
          {name}
        </Text>
      </GridItem>
      <GridItem gridArea="widgets">
        <HStack>
          {typeItems && (
            <Select
              variant="filledDark"
              items={typeItems}
              value={currentTypeItem}
              renderTriggerItem={(v) => <Text textTransform="capitalize">{v}</Text>}
              onChange={(val) => {
                onTypeItemChange?.(val)
              }}
            />
          )}
          {!!tokenCount && <Text color={colors.textTertiary}>{tokenCount} tokens</Text>}
        </HStack>
      </GridItem>
      <GridItem gridArea="switch">
        <Switch
          disabled={!switchable}
          defaultChecked={isOpen}
          onChange={() => {
            isOpen ? onClose?.() : onOpen?.()
          }}
        />
      </GridItem>
    </Grid>
  )
}
