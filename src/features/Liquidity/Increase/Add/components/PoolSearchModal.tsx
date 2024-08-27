import { Flex, Input, ModalProps, Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Modal from '@/components/Modal'
import { colors } from '@/theme/cssVariables'

type PoolSearchModalProps = Omit<ModalProps, 'children'> & {
  onConfirm: (searchTarget: string) => void
}

export default function PoolSearchModal({ onConfirm, ...rest }: PoolSearchModalProps) {
  const [searchTarget, setSearchTarget] = useState<string>('')
  const { t } = useTranslation()
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTarget(e.target.value)
  }

  const onSearchConfirm = useCallback(() => {
    onConfirm(searchTarget)
  }, [onConfirm, searchTarget])

  return (
    <Modal
      title={t('liquidity.pool_search_modal.title')!}
      confirmText={t('button.search') ?? ''}
      hasSecondaryButton={false}
      onConfirm={onSearchConfirm}
      {...rest}
    >
      <Flex py={3} px={4} bg={colors.backgroundDark} direction="column" my={6} borderRadius="12px">
        <Text fontSize="xs" color={colors.textTertiary}>
          AMM ID, Market ID, OpenBook ID
        </Text>
        <Input
          variant="unstyled"
          textAlign="left"
          color={colors.textPrimary}
          fontSize="xl"
          fontWeight="medium"
          my={1}
          value={searchTarget}
          onChange={onChange}
        />
      </Flex>
    </Modal>
  )
}
