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

type CreateTarget = 'legacy-amm' | 'standard-amm' | 'concentrated-liquidity' | 'standard-farm' | 'clmm-lock' | 'cpmm-lock'

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
    let to = ''
    const query = { ...router.query }
    switch (type) {
      case 'legacy-amm':
        query.type = 'legacy-amm'
        to = '/liquidity/create-pool'
        break
      case 'standard-amm':
        to = '/liquidity/create-pool'
        break
      case 'concentrated-liquidity':
        to = '/clmm/create-pool'
        break
      case 'standard-farm':
        to = '/liquidity/create-farm'
        break
      case 'clmm-lock':
        to = '/clmm/lock'
        break
      case 'cpmm-lock':
        to = '/liquidity/lock'
        break
      default:
        break
    }
    router.push({
      pathname: to,
      query
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
  const isCreatePool = ['concentrated-liquidity', 'standard-amm', 'legacy-amm'].includes(type)
  const isLockPool = ['clmm-lock', 'cpmm-lock'].includes(type)
  const isCreateFarm = type === 'standard-farm'
  return (
    <Flex direction="column" gap={4}>
      <CreateBlock
        title={t('create_pool.modal_section_header_pool')}
        description={
          isCreatePool ? (
            <Trans i18nKey="create_pool.modal_section_header_pool_desc">
              <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
                CLMM
              </Link>
              <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool" isExternal>
                Standard
              </Link>
            </Trans>
          ) : null
        }
        selected={isCreatePool}
        renderPoolType={
          isCreatePool
            ? () => (
                <>
                  <Text fontSize="sm">{t('create_pool.pool_type')}</Text>
                  <Stack flexDirection={['column']} mt={2} gap={3}>
                    <PoolTypeItem
                      isSuggested
                      isActive={type === 'concentrated-liquidity'}
                      content={
                        <Box>
                          <Text whiteSpace="nowrap" fontSize="sm">
                            {t('create_pool.modal_tab_concentrated')}
                          </Text>
                          <Text fontSize="xs">{t('create_pool.modal_tab_concentrated_desc')}</Text>
                        </Box>
                      }
                      onClickSelf={() => onChange('concentrated-liquidity')}
                    />
                    <PoolTypeItem
                      isActive={type === 'standard-amm'}
                      content={
                        <Box>
                          <Text whiteSpace="nowrap" fontSize="sm">
                            {t('create_pool.modal_tab_standard_amm')}
                          </Text>
                          <Text fontSize="xs">{t('create_pool.modal_tab_standard_amm_desc')}</Text>
                        </Box>
                      }
                      onClickSelf={() => onChange('standard-amm')}
                    />
                    <PoolTypeItem
                      isActive={type === 'legacy-amm'}
                      content={
                        <Box>
                          <Text whiteSpace="nowrap" fontSize="sm">
                            {t('create_pool.modal_tab_legacy_amm')}
                          </Text>
                          <Text fontSize="xs">{t('create_pool.modal_tab_legacy_amm_desc')}</Text>
                        </Box>
                      }
                      onClickSelf={() => onChange('legacy-amm')}
                    />
                  </Stack>
                </>
              )
            : undefined
        }
        onClick={() => onChange('concentrated-liquidity')}
      />
      <CreateBlock
        title={t('farm.create')}
        description={
          isCreateFarm ? (
            <Trans i18nKey="create_pool.modal_section_header_farm_desc">
              <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm" isExternal>
                CLMM
              </Link>
              <Link href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool/creating-an-ecosystem-farm" isExternal>
                Standard
              </Link>
            </Trans>
          ) : null
        }
        selected={isCreateFarm}
        onClick={() => onChange('standard-farm')}
      />
      <CreateBlock
        title={t('create_pool.modal_section_header_lock')}
        description={
          isLockPool ? (
            <Trans i18nKey="create_pool.modal_section_header_lock_desc">
              <Link href="https://docs.raydium.io/raydium/pool-creation/burn-and-earn" isExternal>
                Learn more
              </Link>
            </Trans>
          ) : null
        }
        selected={isLockPool}
        renderPoolType={
          isLockPool
            ? () => (
                <Stack flexDirection={['column', 'row']}>
                  <PoolTypeItem
                    isActive={type === 'clmm-lock'}
                    content={
                      <Text whiteSpace="nowrap" fontSize="sm">
                        {t('create_pool.modal_tab_concentrated')}
                      </Text>
                    }
                    onClickSelf={() => onChange('clmm-lock')}
                  />
                  <PoolTypeItem
                    isActive={type === 'cpmm-lock'}
                    content={
                      <Text whiteSpace="nowrap" fontSize="sm">
                        {t('create_pool.modal_tab_standard_amm')}
                      </Text>
                    }
                    onClickSelf={() => onChange('cpmm-lock')}
                  />
                </Stack>
              )
            : undefined
        }
        onClick={() => onChange('clmm-lock')}
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

      {props.renderPoolType && <Box mt={2}>{props.renderPoolType()}</Box>}
    </Box>
  )
}

function PoolTypeItem({
  content,
  isActive,
  onClickSelf,
  isSuggested
}: {
  content: React.ReactNode
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
      {content}
    </HStack>
  )
}
