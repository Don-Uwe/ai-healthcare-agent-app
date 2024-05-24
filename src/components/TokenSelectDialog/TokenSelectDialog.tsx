import { useState, useCallback } from 'react'
import { TokenInfo } from '@raydium-io/raydium-sdk-v2'
import { useTranslation } from 'react-i18next'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Grid, GridItem, Heading, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import TokenListSetting from './components/TokenListSetting'
import TokenList from './components/TokenList'
import TokenListUnknown from './components/TokenListUnknown'

export interface TokenSelectDialogProps {
  onSelectValue: (token: TokenInfo) => void
  isOpen: boolean
  filterFn?: (token: TokenInfo) => boolean
  onClose: () => void
}

enum PageType {
  TokenList,
  TokenListSetting,
  TokenListUnknown
}

export default function TokenSelectDialog({ onSelectValue, isOpen, filterFn, onClose }: TokenSelectDialogProps) {
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.TokenList)

  const renderModalContent = useCallback(() => {
    switch (currentPage) {
      case PageType.TokenList:
        return <TokenListContent />
      case PageType.TokenListSetting:
        return <TokenListSettingContent />
      case PageType.TokenListUnknown:
        return <TokenListUnknownContent />
      default:
        return null
    }
  }, [currentPage])

  const TokenListContent = () => (
    <>
      <ModalHeader mx="8px">
        <Heading fontSize="xl" fontWeight={500} mb="24px">
          {t('common.select_a_token')}
        </Heading>
      </ModalHeader>
      <ModalCloseButton />
      <ModalBody display={'flex'} flexDirection={'column'} overflowX="hidden">
        <Box height={['auto', '60vh']} flex={['1', 'unset']}>
          <TokenList
            onOpenTokenList={() => setCurrentPage(PageType.TokenListSetting)}
            onChooseToken={(token) => {
              onSelectValue(token)
            }}
            isDialogOpen={isOpen}
            filterFn={filterFn}
          />
        </Box>
      </ModalBody>
    </>
  )

  const TokenListSettingContent = () => (
    <>
      <ModalHeader mx="8px">
        <Grid templateColumns={'1fr 3fr 1fr'} mb="24px">
          <GridItem alignSelf="center" cursor="pointer" textAlign="left" onClick={() => setCurrentPage(PageType.TokenList)}>
            <ChevronLeftIcon width="24px" fontWeight={500} />
          </GridItem>
          <GridItem textAlign="center">
            <Heading fontSize="xl" fontWeight={500} color={colors.textPrimary}>
              {t('common.token_list_settings')}
            </Heading>
          </GridItem>
          <GridItem textAlign="right"></GridItem>
        </Grid>
      </ModalHeader>
      <ModalBody display={'flex'} flexDirection={'column'} overflowX="hidden">
        <Box height={['auto', '60vh']} flex={['1', 'unset']}>
          <TokenListSetting onClick={() => setCurrentPage(PageType.TokenListUnknown)} />
        </Box>
      </ModalBody>
    </>
  )

  const TokenListUnknownContent = () => (
    <>
      <ModalHeader mx="8px">
        <Grid templateColumns={'1fr 3fr 1fr'} mb="24px">
          <GridItem alignSelf="center" cursor="pointer" textAlign="left" onClick={() => setCurrentPage(PageType.TokenListSetting)}>
            <ChevronLeftIcon width="24px" fontWeight={500} />
          </GridItem>
          <GridItem textAlign="center">
            <Heading fontSize="xl" fontWeight={500} color={colors.textPrimary}>
              {t('swap.user_added_token_list')}
            </Heading>
          </GridItem>
          <GridItem textAlign="right"></GridItem>
        </Grid>
      </ModalHeader>
      <ModalBody display={'flex'} flexDirection={'column'} overflowX="hidden">
        <Box height={['auto', '60vh']} flex={['1', 'unset']}>
          <TokenListUnknown />
        </Box>
      </ModalBody>
    </>
  )

  const handleClose = useEvent(() => {
    onClose()
  })
  const onCloseComplete = useEvent(() => {
    setCurrentPage(PageType.TokenList)
  })
  return (
    <Modal variant={'mobileFullPage'} isOpen={isOpen} onClose={handleClose} onCloseComplete={onCloseComplete}>
      <ModalOverlay />
      <ModalContent>{renderModalContent()}</ModalContent>
    </Modal>
  )
}
