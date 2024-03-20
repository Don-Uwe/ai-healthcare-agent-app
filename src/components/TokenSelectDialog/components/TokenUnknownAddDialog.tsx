import { TokenInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { useTranslation } from 'react-i18next'
import { useEvent } from '@/hooks/useEvent'
import { colors } from '@/theme/cssVariables'
import { Flex, Text, Box, Button, Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import WarningIcon from '@/icons/misc/WarningIcon'
import AddressChip from '@/components/AddressChip'
import TokenAvatar from '@/components/TokenAvatar'

export interface TokenUnknownAddDialogProps {
  onConfirm: (token: TokenInfo | ApiV3Token) => void
  isOpen: boolean
  onClose: () => void
  token: TokenInfo | ApiV3Token
}

export default function TokenUnknownAddDialog({ onConfirm, isOpen, onClose, token }: TokenUnknownAddDialogProps) {
  const { t } = useTranslation()

  const handleClose = useEvent(() => {
    onClose()
  })
  return (
    <Modal variant={'mobileFullPage'} isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody display={'flex'} flexDirection={'column'} overflowX="hidden">
          <Flex
            height={['auto', '30vh']}
            flex="1"
            display={'flex'}
            flexDirection={'column'}
            alignItems="center"
            justifyContent={'space-between'}
            pt={3.5}
            px={6}
            maxW={'100%'}
            overflow={'hidden'}
          >
            <WarningIcon width="27" height="27" />
            <Text fontWeight="bold" fontSize="xl" pt={3}>
              {t('common.confirm_token')}
            </Text>
            <Text fontWeight="bold" fontSize="md" color={colors.semanticWarning} pt={5}>
              {t('swap.info_not_default_token')}
            </Text>
            <Text fontWeight="normal" fontSize="md" color={colors.textSecondary} pt={2}>
              {t('swap.info_add_not_default_token')}
            </Text>
            <Flex
              w="full"
              borderRadius={4}
              mt={5}
              background={colors.backgroundDark}
              px={16}
              py={4}
              alignItems="center"
              justifyContent={'space-between'}
            >
              <TokenAvatar token={token} />
              <Text color={colors.textSecondary}>{token?.symbol}</Text>
              <Box color={colors.textSecondary} textAlign="right">
                <AddressChip
                  onClick={(ev) => ev.stopPropagation()}
                  color={colors.textTertiary}
                  canExternalLink
                  fontSize="xs"
                  address={token?.address}
                />
              </Box>
            </Flex>
            <Button
              width={'full'}
              mt={5}
              borderRadius={12}
              onClick={() => {
                onConfirm(token)
              }}
            >
              {t('button.confirm_understand')}
            </Button>
            <Text
              mt={4}
              fontWeight="bold"
              fontSize="xs"
              color={colors.textSecondary}
              cursor="pointer"
              onClick={() => {
                onClose()
              }}
            >
              {t('button.cancel')}
            </Text>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
