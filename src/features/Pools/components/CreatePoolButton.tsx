import { HStack, Text, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'
import { colors } from '@/theme/cssVariables'

export type PoolType = 'standard' | 'concentrated'

export default function CreatePoolButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  return (
    <>
      <Mobile>
        <HStack spacing={0.5} align="center" color={colors.secondary} onClick={onOpen}>
          <PlusCircleIcon width="14px" height="14px" />
          <Text translateY={'-5%'} transform={'auto'} fontSize="md" fontWeight="500">
            {t('liquidity.create_pool_mobile')}
          </Text>
        </HStack>
      </Mobile>
      <Desktop>
        <Button onClick={onOpen} variant="outline">
          {t('liquidity.create_pool')}
        </Button>
      </Desktop>
      <CreatePoolEntryDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
