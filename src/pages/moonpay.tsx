import { Box, Flex, Image, Text, useColorMode } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { Global, css } from '@emotion/react'
import RaydiumLogo from '@/icons/RaydiumLogo'
import MoonPayIcon from '@/icons/misc/MoonPayIcon'
import Plus from '@/icons/misc/Plus'
import Phantom from '@/icons/misc/Phantom'
import SolGrey from '@/icons/misc/SolGrey'
import Cart from '@/icons/misc/Cart'
import WalletOnramp from '@/components/SolWallet/WalletOnramp'
import { colors } from '@/theme/cssVariables'
import useResponsive from '@/hooks/useResponsive'

export default function MoonpayPage() {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const isDark = colorMode === 'dark'
  const { isMobile } = useResponsive()
  const phantomWallet = new PhantomWalletAdapter()
  const isPhantomInstalled = phantomWallet.readyState !== WalletReadyState.NotDetected

  return (
    <Flex
      width="100%"
      height="100%"
      minHeight="700px"
      alignItems="center"
      justifyContent="center"
      background="url(/images/moonpay-dots.svg)"
      backgroundPosition="center bottom 125px"
      backgroundRepeat="no-repeat"
    >
      {isDark && (
        <Global
          styles={css({
            ':root': {
              background: 'url(/images/moonpay-gradient.png) no-repeat',
              backgroundColor: '#0f1018',
              backgroundPosition: 'top center',
              '&::before': {
                content: `""`,
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0.4,
                background: 'linear-gradient(153deg, rgba(118, 120, 136, 0.48) 3.89%, rgba(118, 120, 136, 0) 66.42%)'
              }
            },
            body: {
              background: 'linear-gradient(165deg, rgba(118, 120, 136, 0.19) 3.89%, rgba(118, 120, 136, 0) 66.42%)',
              backgroundSize: '100% 890px',
              backgroundRepeat: 'no-repeat'
            }
          })}
        />
      )}
      <Box textAlign="center" {...(isMobile ? { display: 'flex', flexDirection: 'column', px: '6' } : { mb: '6rem' })}>
        <Flex alignItems="center" justifyContent="center" gap={4} flexDirection="row">
          <Flex
            w={{ base: '64px', md: '104px' }}
            h={{ base: '64px', md: '104px' }}
            minWidth={{ base: '64px', md: '104px' }}
            p={{ base: '10px', md: '16px' }}
            borderRadius={{ base: '15px', md: '24px' }}
            bgColor={colors.background02}
            alignItems="center"
            justifyContent="center"
          >
            <RaydiumLogo width="64" height="64" />
          </Flex>
          <Plus width="25px" height="25px" color="#8d93b7" />
          <Flex
            w={{ base: '64px', md: '104px' }}
            h={{ base: '64px', md: '104px' }}
            minWidth={{ base: '64px', md: '104px' }}
            p={{ base: '10px', md: '16px' }}
            borderRadius={{ base: '15px', md: '24px' }}
            bgColor={colors.background02}
            alignItems="center"
            justifyContent="center"
          >
            <MoonPayIcon width="100%" height="100%" color="#7715f5" />
          </Flex>
        </Flex>
        <Text as="h1" fontFamily="chillax" fontSize={['24px', '40px', '40px']} color={colors.text02} mt={6} mb={8}>
          {t('moonpay.deposit_using')}
          <Text as="span" fontWeight="semibold">
            {t('moonpay.title')}
          </Text>
        </Text>
        <Box {...(isMobile ? { mt: '8', order: 2 } : {})}>
          {isPhantomInstalled ? <WalletOnramp /> : <Text fontSize="sm">{t('moonpay.phantom_wallet_not_installed')}</Text>}
        </Box>
        <Flex
          maxW="728px"
          m="0 auto"
          borderTop={`1px solid ${colors.dividerBg}`}
          pt={6}
          position="absolute"
          left="50%"
          bottom="10vh"
          mb="88px"
          transform="translateX(-50%)"
          color={colors.text03}
          textAlign="left"
          {...(!isMobile
            ? { justifyContent: 'space-between', gap: '80px', direction: 'row' }
            : {
                position: 'static',
                width: '100%',
                marginBottom: '0',
                transform: 'none',
                order: '1',
                marginTop: '3vh',
                gap: '4',
                direction: 'column'
              })}
        >
          {['step1', 'step2', 'step3'].map((step, index) => (
            <Box key={index} flex="1" {...(isMobile ? { display: 'flex', gap: '12px' } : {})}>
              <Box width="24px" height="24px">
                {index === 0 && <Phantom width="24" height="24" color="#898eff" />}
                {index === 1 && <SolGrey width="24" height="24" color="#898eff" />}
                {index === 2 && <Cart width="24" height="24" color="#898eff" />}
              </Box>
              <Box>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={colors.text02}
                  fontFamily="chillax"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  {...(!isMobile ? { mt: '8px', mb: '4px' } : {})}
                >
                  {t(`moonpay.${step}`)}
                </Text>
                <Text fontSize="sm">{t(`moonpay.${step}_text`)}</Text>
              </Box>
            </Box>
          ))}
        </Flex>
        <Flex
          width="100%"
          justifyContent="center"
          alignItems="center"
          gap="3"
          mt={8}
          {...(!isMobile ? { m: '0', position: 'absolute', bottom: '56px', left: '0' } : {})}
        >
          {['apple', 'google', 'mastercard', 'visa', 'paypal'].map((name, index) => (
            <Image key={index} src={`/images/payments/${name}.webp`} width="50px" />
          ))}
        </Flex>
      </Box>
    </Flex>
  )
}
