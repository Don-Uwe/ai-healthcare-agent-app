import { colors } from '@/theme/cssVariables'
import { Flex, Input, InputGroup, InputRightElement, useDisclosure, Spinner } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import shallow from 'zustand/shallow'
import Button from '../../Button'
import { SettingField } from './SettingField'
import { SettingFieldToggleButton } from './SettingFieldToggleButton'
import { useAppStore } from '@/store'
import { useEvent } from '@/hooks/useEvent'
import { isValidUrl } from '@/utils/url'

export function RPCConnectionSettingField() {
  const { t } = useTranslation()
  const [isMobile, rpcs, rpcNodeUrl, setRpcUrlAct] = useAppStore((s) => [s.isMobile, s.rpcs, s.rpcNodeUrl, s.setRpcUrlAct], shallow)
  const isCurrentCustom = !rpcs.some((rpc) => rpc.url === rpcNodeUrl) && !!rpcNodeUrl
  const [customUrl, setCustomUrl] = useState(isCurrentCustom ? rpcNodeUrl || 'https://' : 'https://')
  const { isOpen: isCustom, onOpen: onCustom, onClose: offCustom } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()

  const handleSwitchCustomRpc = useEvent(async () => {
    if (!isValidUrl(customUrl)) return
    onLoading()
    await setRpcUrlAct(customUrl)
    offLoading()
  })

  useEffect(() => {
    if (isCurrentCustom) {
      onCustom()
      setCustomUrl(rpcNodeUrl)
    }
  }, [isCurrentCustom])

  return (
    <SettingField
      fieldName={t('setting_board.rpc_connection')}
      tooltip={t('setting_board.rpc_connection_tooltip')}
      renderToggleButton={isMobile ? (isOpen) => <SettingFieldToggleButton isOpen={isOpen} renderContent={rpcNodeUrl} /> : null}
      renderWidgetContent={
        <>
          <Flex flexWrap="wrap" gap={4}>
            {rpcs.map((rpc) => (
              <Button
                key={rpc.name}
                isActive={rpcNodeUrl === rpc.url && !isCustom}
                variant="capsule-radio"
                size="sm"
                onClick={() => {
                  offCustom()
                  if (rpcNodeUrl !== rpc.url) setRpcUrlAct(rpc.url)
                }}
              >
                <Flex gap={1.5}>{rpc.name}</Flex>
              </Button>
            ))}
            <Button
              key="Custom"
              isActive={isCurrentCustom || isCustom}
              variant="capsule-radio"
              size="sm"
              onClick={() => {
                onCustom()
                handleSwitchCustomRpc()
              }}
            >
              <Flex gap={1.5}>{t('setting_board.custom')}</Flex>
            </Button>
          </Flex>
          <InputGroup mt={4}>
            <Input
              flexGrow={1}
              width="full"
              variant="filledDark"
              placeholder="https://"
              bg={colors.backgroundDark}
              rounded="full"
              py={1}
              px={3}
              isInvalid={isCustom && !isValidUrl(customUrl)}
              isDisabled={!isCustom || isLoading}
              value={!isCustom ? rpcNodeUrl : customUrl}
              onBlur={handleSwitchCustomRpc}
              onChange={({ currentTarget: { value } }) => {
                setCustomUrl(value)
              }}
            />
            {isLoading ? (
              <InputRightElement>
                <Spinner size="sm" />
              </InputRightElement>
            ) : null}
          </InputGroup>
        </>
      }
    />
  )
}
