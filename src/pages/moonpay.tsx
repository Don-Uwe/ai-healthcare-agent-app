import { Box, Flex, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletReadyState } from '@solana/wallet-adapter-base'
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
  const { isMobile } = useResponsive()
  const phantomWallet = new PhantomWalletAdapter()
  const isPhantomInstalled = phantomWallet.readyState !== WalletReadyState.NotDetected

  return (
    <Flex w="100%" h="100%">
      <Flex w="100%" alignItems="center" justifyContent="center">
        <Box textAlign="center" {...(isMobile ? { display: 'flex', flexDirection: 'column', px: '6' } : {})}>
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
          <Text as="h1" fontSize={{ base: '24px', md: '40px' }} color={colors.text02} mt={6} mb={8}>
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
            margin="0 auto"
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
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
            <Box flex="1" {...(isMobile ? { display: 'flex', gap: '12px' } : {})}>
              <Box width="24px" height="24px">
                <Phantom width="24px" height="24px" color="#898eff" />
              </Box>
              <Box>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={colors.text02}
                  fontWeight="semibold"
                  textTransform="uppercase"
                  {...(!isMobile ? { mt: '8px', mb: '4px' } : {})}
                >
                  {t('moonpay.step1')}
                </Text>
                <Text fontSize="sm">{t('moonpay.step_text1')}</Text>
              </Box>
            </Box>
            <Box flex="1" {...(isMobile ? { display: 'flex', gap: '12px' } : {})}>
              <Box width="24px" height="24px">
                <SolGrey width="24px" height="24px" color="#898eff" />
              </Box>
              <Box>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={colors.text02}
                  fontWeight="semibold"
                  textTransform="uppercase"
                  {...(!isMobile ? { mt: '8px', mb: '4px' } : {})}
                >
                  {t('moonpay.step2')}
                </Text>
                <Text fontSize="sm">{t('moonpay.step_text2')}</Text>
              </Box>
            </Box>
            <Box flex="1" {...(isMobile ? { display: 'flex', gap: '12px' } : {})}>
              <Box width="24px" height="24px">
                <Cart width="24px" height="24px" color="#898eff" />
              </Box>
              <Box>
                <Text
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={colors.text02}
                  fontWeight="semibold"
                  textTransform="uppercase"
                  {...(!isMobile ? { mt: '8px', mb: '4px' } : {})}
                >
                  {t('moonpay.step3')}
                </Text>
                <Text fontSize="sm">{t('moonpay.step_text3')}</Text>
              </Box>
            </Box>
          </Flex>
          <Flex
            width="100%"
            justifyContent="center"
            alignItems="center"
            gap="3"
            mt={8}
            {...(!isMobile ? { margin: '0', position: 'absolute', bottom: '56px', left: '0' } : {})}
          >
            <Image src="/images/payments/apple.webp" width="50px" />
            <Image src="/images/payments/google.webp" width="50px" />
            <Image src="/images/payments/mastercard.webp" width="50px" />
            <Image src="/images/payments/visa.webp" width="50px" />
            <Image src="/images/payments/paypal.webp" width="50px" />
          </Flex>
        </Box>
      </Flex>
    </Flex>
  )
}
