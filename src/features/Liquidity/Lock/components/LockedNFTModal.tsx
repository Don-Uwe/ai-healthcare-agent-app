import { useEffect } from 'react'
import {
  Flex,
  Image,
  Text,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalFooter,
  useClipboard
} from '@chakra-ui/react'
import { useTranslation, Trans } from 'react-i18next'
import { colors } from '@/theme/cssVariables/colors'
import { encodeStr } from '@/utils/common'
import CopyIcon from '@/icons/misc/CopyIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { useAppStore, supportedExplorers } from '@/store/useAppStore'
import { PositionTabValues } from '@/hooks/portfolio/useAllPositionInfo'
import { routeToPage } from '@/utils/routeTools'

export default function LockedNFTModal({
  nftAddress,
  positionTabValue,
  isOpen,
  onClose
}: {
  nftAddress: string
  positionTabValue: PositionTabValues
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation()
  const explorerUrl = useAppStore((s) => s.explorerUrl)
  const { onCopy, setValue } = useClipboard(nftAddress)

  useEffect(() => {
    setValue(nftAddress)
  }, [nftAddress])

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ bg: colors.backgroundLight }}>
        <ModalHeader mb="5" fontSize={['lg', 'xl']}>
          {t('liquidity.position_locked_success')}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text variant="title" fontSize={['sm', 'md']} mb="6" fontWeight="400">
            {t('liquidity.nft_desc')}
          </Text>
          <Image w={['260px', '300px']} h={['260px', '300px']} m="0 auto" src="/images/lock-nft.png" />
          <Flex
            m="0 auto"
            py="2"
            px="4"
            gap="1"
            bg={colors.backgroundDark}
            rounded="xl"
            alignItems="center"
            w="fit-content"
            fontSize={['sm', 'md']}
            fontWeight="500"
            mt={6}
          >
            <Text color={colors.textSecondary}>{t('clmm.nft_mint')}:</Text>
            <Text color={colors.textPurple} mr="2">
              {encodeStr(nftAddress, 5, 3)}
            </Text>
            <CopyIcon
              cursor="pointer"
              onClick={() => {
                onCopy()
                toastSubject.next({
                  status: 'success',
                  title: t('common.copy_success')
                })
              }}
            />
            <a
              href={
                explorerUrl === supportedExplorers[0]?.host ? `${explorerUrl}/token/${nftAddress}` : `${explorerUrl}/address/${nftAddress}`
              }
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink cursor="pointer" width="14" height="14" />
            </a>
          </Flex>

          <Text color={colors.textSecondary} fontSize={['sm', 'md']} mt="4" mb="2">
            <Trans
              i18nKey="liquidity.dont_burn_nft"
              components={{ sub: <Text display="inline-block" color={colors.textPink} variant="title" /> }}
            />
          </Text>
        </ModalBody>
        <ModalFooter px="0" py="0" mt="4" mb="2">
          <Button
            onClick={() => {
              routeToPage('portfolio', { queryProps: { section: 'my-positions', position_tab: positionTabValue } })
            }}
            w="100%"
          >
            {t('clmm.view_my_positions')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
