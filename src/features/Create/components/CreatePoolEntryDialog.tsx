import { Desktop, Mobile } from '@/components/MobileDesktop'
import CircleCheck from '@/icons/misc/CircleCheck'
import { colors } from '@/theme/cssVariables'
import {
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'

type CreateTarget = 'standard-amm' | 'concentrated-liquidity' | 'standard-farm'

export function CreatePoolEntryDialog({
  isOpen,
  onClose,
  defaultType = 'concentrated-liquidity'
}: {
  isOpen: boolean
  onClose: () => void
  defaultType?: CreateTarget
}) {
  const router = useRouter()
  const [type, setType] = useState<CreateTarget>(defaultType)

  const onConfirm = useCallback(() => {
    const isStandardAmm = type === 'standard-amm'
    const isStandardFarm = type === 'standard-farm'
    const to = isStandardAmm ? '/liquidity/create-pool' : isStandardFarm ? '/liquidity/create-farm' : '/clmm/create-pool'
    router.push({
      pathname: to,
      query: {
        ...router.query
      }
    })
  }, [router, type])

  return (
    <>
      <Mobile>
        <CreatePoolEntryMobileDrawer isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryMobileDrawer>
      </Mobile>
      <Desktop>
        <CreatePoolEntryModal isOpen={isOpen} onClose={onClose} onConfirm={onConfirm}>
          <CreatePoolEntryDialogBody type={type} onChange={setType} />
        </CreatePoolEntryModal>
      </Desktop>
    </>
  )
}

type CreatePoolEntryModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode

  onConfirm?: () => void
}

function CreatePoolEntryModal({ isOpen, onClose, onConfirm, children }: CreatePoolEntryModalProps) {
  const { t } = useTranslation()
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('create_pool.modal_title')}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>{children}</ModalBody>

        <ModalFooter mt={8}>
          <VStack w="full">
            <Button w="full" onClick={onConfirm}>
              {t('button.continue')}
            </Button>
            <Button w="full" variant="ghost" onClick={onClose}>
              {t('button.cancel')}
            </Button>
          </VStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

function CreatePoolEntryMobileDrawer({
  isOpen,
  onClose,
  onConfirm,
  children
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  children: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t('create_pool.modal_title')}</DrawerHeader>
        <DrawerBody>{children}</DrawerBody>
        <DrawerFooter mt={4}>
          <VStack w="full">
            <Button w="full" onClick={onConfirm}>
              {t('button.continue')}
            </Button>
            <Button w="full" variant="ghost" onClick={onClose}>
              {t('button.cancel')}
            </Button>
          </VStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function CreatePoolEntryDialogBody({ type, onChange }: { type: CreateTarget; onChange: (val: CreateTarget) => void }) {
  const { t } = useTranslation()
  return (
    <Flex direction="column" gap={4}>
      <CreateBlock
        title={t('create_pool.modal_section_header_pool')}
        description={
          <Trans i18nKey="create_pool.modal_section_header_pool_desc">
            <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
              CLMM
            </Link>
            <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool" isExternal>
              Standard
            </Link>
          </Trans>
        }
        selected={type === 'concentrated-liquidity' || type === 'standard-amm'}
        renderPoolType={
          type === 'concentrated-liquidity' || type === 'standard-amm'
            ? () => (
                <Stack flexDirection={['column', 'row']}>
                  <PoolTypeItem
                    isSuggested
                    isActive={type === 'concentrated-liquidity'}
                    name={t('create_pool.modal_tab_concentrated')}
                    onClickSelf={() => onChange('concentrated-liquidity')}
                  />
                  <PoolTypeItem
                    isActive={type === 'standard-amm'}
                    name={t('create_pool.modal_tab_standard_amm')}
                    onClickSelf={() => onChange('standard-amm')}
                  />
                </Stack>
              )
            : undefined
        }
        onClick={() => onChange('concentrated-liquidity')}
      />
      <CreateBlock
        title={t('create_pool.modal_section_header_farm')}
        description={
          <Trans i18nKey="create_pool.modal_section_header_farm_desc">
            <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
              CLMM
            </Link>
            <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool/creating-an-ecosystem-farm" isExternal>
              Standard
            </Link>
          </Trans>
        }
        selected={type === 'standard-farm'}
        onClick={() => onChange('standard-farm')}
      />
    </Flex>
  )
}
function CreateBlock(props: {
  title: string
  description: React.ReactNode
  selected?: boolean
  onClick?: () => void
  detailLinkUrl?: string
  renderPoolType?: () => React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <Box
      backgroundColor={colors.backgroundDark}
      p={4}
      borderRadius={8}
      position="relative"
      cursor="pointer"
      borderWidth="1.5px"
      borderColor={props.selected ? colors.secondary : 'transparent'}
      onClick={props.onClick}
    >
      <Flex justify={'space-between'}>
        <Text fontWeight="500">{props.title}</Text>
        {props.selected && <CircleCheck width={16} height={16} fill={colors.secondary} />}
      </Flex>

      <Box color={props.selected ? colors.textSecondary : colors.textTertiary} fontSize={'sm'}>
        {props.description}
      </Box>

      {props.renderPoolType && (
        <Box mt={2}>
          <Text fontSize={'sm'} mb={2}>
            {t('create_pool.modal_tab_label')}:
          </Text>
          {props.renderPoolType()}
        </Box>
      )}
    </Box>
  )
}

function PoolTypeItem({
  name,
  isActive,
  onClickSelf,
  isSuggested
}: {
  name: string
  isActive?: boolean
  onClickSelf?: () => void
  isSuggested?: boolean
}) {
  const domRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  useEffect(() => {
    domRef.current?.addEventListener('click', (ev) => {
      ev.stopPropagation()
      onClickSelf?.()
    })
  })
  return (
    <HStack
      ref={domRef}
      flexGrow={1}
      color={isActive ? colors.secondary : colors.textTertiary}
      bg={colors.backgroundTransparent12}
      px={3}
      py={1.5}
      rounded={'md'}
      position="relative"
    >
      {isSuggested && (
        <Box position={'absolute'} top={0} right={2} transform={'auto'} translateY={'-50%'}>
          <Badge variant="crooked">{t('badge.suggested')}</Badge>
        </Box>
      )}
      <Box display="grid" placeItems={'center'}>
        <Box gridRow={1} gridColumn={1} rounded="full" p="3px" bg={isActive ? colors.secondary : colors.textSecondary}></Box>
        <Box gridRow={1} gridColumn={1} rounded="full" p="8px" opacity={0.3} bg={isActive ? colors.secondary : colors.textSecondary}></Box>
      </Box>
      <Text whiteSpace="nowrap" fontSize="sm">
        {name}
      </Text>
    </HStack>
  )
}
