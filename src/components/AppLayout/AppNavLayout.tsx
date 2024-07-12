import { useDisclosure } from '@/hooks/useDelayDisclosure'
import RaydiumLogo from '@/icons/RaydiumLogo'
import RaydiumLogoOutline from '@/icons/RaydiumLogoOutline'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import Gear from '@/icons/misc/Gear'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useRef } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import MobileDesktop, { Desktop, Mobile } from '../MobileDesktop'
import SolWallet from '../SolWallet'
import { MobileBottomNavbar } from './MobileBottomNavbar'
import { ColorThemeSettingField } from './components/ColorThemeSettingField'
import { DefaultExplorerSettingField } from './components/DefaultExplorerSettingField'
import { LanguageSettingField } from './components/LanguageSettingField'
import { NavMoreButtonMenuPanel } from './components/NavMoreButtonMenuPanel'
import { RPCConnectionSettingField } from './components/RPCConnectionSettingField'
import { Divider } from './components/SettingFieldDivider'
import { SlippageToleranceSettingField } from './components/SlippageToleranceSettingField'
import { VersionedTransactionSettingField } from './components/VersionedTransactionSettingField'
// import { TransactionFeeSetting } from './components/TransactionFeeSetting'
import { PriorityButton } from './components/PriorityButton'
import { keyframes } from '@emotion/react'
import AppVersion from './AppVersion'

export interface NavSettings {
  // colorTheme: 'dark' | 'light'
}

function AppNavLayout({
  children,
  overflowHidden
}: {
  children: ReactNode
  /** use screen height */
  overflowHidden?: boolean
}) {
  const { t } = useTranslation()
  const { pathname } = useRouter()

  const betaTooltipRef = useRef<HTMLDivElement>(null)
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const closeBetaTooltip = () => {
    if (betaTooltipRef.current) {
      betaTooltipRef.current.style.animation = `${fadeOut} 0.5s forwards`
      setTimeout(() => onClose(), 500)
    }
  }

  const fadeIn = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`

  const fadeOut = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`
  return (
    <Flex direction="column" id="app-layout" height="full" overflow={overflowHidden ? 'hidden' : 'auto'}>
      <Box
        ref={betaTooltipRef}
        display={isOpen ? 'flex' : 'none'}
        animation={`${fadeIn} 0.5s`}
        flexDirection="row"
        bg={colors.backgroundLight}
      >
        <Box display="flex" alignItems="center" justifyContent="center" textAlign="center" width="95%" mt="0.5em" mb="0.5em">
          <Text as="span" textColor={colors.textPrimary} fontSize="0.85em" fontWeight="normal" color={colors.textPrimary}>
            <Trans i18nKey="common.beta_tooltip">
              <a href="https://v2.raydium.io" rel="noreferrer" target="_blank" style={{ color: colors.textLink }}>
                here
              </a>
            </Trans>
          </Text>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          width="5%"
          _hover={{ bg: colors.backgroundDark }}
          onClick={() => closeBetaTooltip()}
        >
          ×
        </Box>
      </Box>
      <HStack
        flex="none"
        height={['64px', '80px']}
        px={['20px', '38px']}
        gap={['4px', 'max(64px, 6.1vw)']}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* logo */}
        <Desktop>
          <Box flex={'none'}>
            <Link href="/swap">
              <RaydiumLogo />
            </Link>
          </Box>
        </Desktop>
        <Mobile>
          <HStack>
            <RaydiumLogoOutline />
            <Text fontSize="xl" fontWeight="medium" color={colors.textSecondary}>
              {pathname === '/swap'
                ? t('swap.title')
                : pathname === '/liquidity-pools'
                ? t('liquidity.title')
                : pathname === '/portfolio'
                ? t('portfolio.title')
                : pathname === '/playground'
                ? t('common.playground')
                : pathname === '/staking'
                ? t('staking.title')
                : ''}
            </Text>
          </HStack>
        </Mobile>

        {/* nav routes */}
        <Desktop>
          <HStack flexGrow={1} justify="start" overflow={['auto', 'visible']} gap={15}>
            <RouteLink href="/swap" isActive={pathname === '/swap'}>
              {t('swap.title')}
            </RouteLink>
            <RouteLink href="/liquidity-pools" isActive={pathname.includes('/liquidity')}>
              {t('liquidity.title')}
            </RouteLink>
            <RouteLink href="/portfolio" isActive={pathname === '/portfolio'}>
              {t('portfolio.title')}
            </RouteLink>
            {/* <RouteLink href="/playground" isActive={pathname === '/playground'}>
              {t('common.playground')}
            </RouteLink> */}
            <Menu size="lg">
              <MenuButton fontSize={'lg'} px={4} py={2}>
                <Flex align="center" gap={0.5} color={pathname === '/staking' ? colors.textSecondary : colors.textTertiary}>
                  {pathname === '/staking' ? t('staking.title') : t('common.more')}
                  <ChevronDownIcon width={16} height={16} />
                </Flex>
              </MenuButton>
              <NavMoreButtonMenuPanel />
            </Menu>
          </HStack>
        </Desktop>

        {/* wallet button */}
        <Flex gap={[0.5, 2]} align="center">
          <PriorityButton />
          <SettingsMenu />
          {/* <EVMWallet />  don't need currently yet*/}
          <SolWallet />
        </Flex>
      </HStack>

      <Box
        px={appLayoutPaddingX}
        pt={[0, 4]}
        flex={1}
        overflow={overflowHidden ? 'hidden' : 'auto'}
        display="flex"
        flexDirection="column"
        justifyItems={'flex-start'}
        sx={{
          scrollbarGutter: 'stable',
          contain: 'size',
          '& > *': {
            // for flex-col container
            flex: 'none'
          }
        }}
      >
        {children}
      </Box>

      <Mobile>
        <Box flex="none">
          <MobileBottomNavbar />
        </Box>
      </Mobile>
    </Flex>
  )
}

function RouteLink(props: { isActive?: boolean; children: ReactNode; href: string }) {
  return (
    <MobileDesktop
      pc={
        <Link href={props.href}>
          <Text
            as="span"
            textColor={props.isActive ? colors.textSecondary : colors.textTertiary}
            fontSize="lg"
            px={4}
            py={2}
            rounded="xl"
            transition="200ms"
            _hover={{ bg: colors.backgroundLight, color: colors.textSecondary }}
          >
            {props.children}
          </Text>
        </Link>
      }
      mobile={
        props.isActive ? (
          <Link href={props.href}>
            <Text as="span" fontSize="xl" fontWeight={500} textColor={colors.textSecondary}>
              {props.children}
            </Text>
          </Link>
        ) : null
      }
    />
  )
}

function SettingsMenu() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const triggerRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Box
        w={10}
        h={10}
        p="0"
        onClick={() => onOpen()}
        _hover={{ bg: colors.backgroundLight }}
        rounded="full"
        display="grid"
        placeContent="center"
        cursor="pointer"
        ref={triggerRef}
      >
        <Gear />
      </Box>
      <SettingsMenuModalContent isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
    </>
  )
}

function SettingsMenuModalContent(props: { isOpen: boolean; triggerRef: React.RefObject<HTMLDivElement>; onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const triggerPanelGap = 8
  const isMobile = useAppStore((s) => s.isMobile)
  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()

  return (
    <Modal size={'lg'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect
                ? `translate(${isMobile ? 0 : -(window.innerWidth - triggerRect.right)}px, ${
                    triggerRect.bottom + triggerPanelGap
                  }px) !important`
                : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
      >
        <ModalHeader>{t('setting_board.panel_title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SlippageToleranceSettingField />
          <Divider />
          <SlippageToleranceSettingField variant="liquidity" />
          <Divider />
          <VersionedTransactionSettingField />
          <Divider />
          <DefaultExplorerSettingField />
          {/* <Divider />
          <TransactionFeeSetting /> */}
          <Divider />
          <LanguageSettingField />
          <Divider />
          <ColorThemeSettingField />
          <Divider />
          <RPCConnectionSettingField />
          <Divider />
          <AppVersion />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppNavLayout
