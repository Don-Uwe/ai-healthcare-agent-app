import DiscardMediaIcon from '@/icons/media/DiscardMediaIcon'
import TelegrameMediaIcon from '@/icons/media/TelegrameMediaIcon'
import TwitterMediaIcon from '@/icons/media/TwitterMediaIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import DocThumbnailIcon from '@/icons/pageNavigation/DocThumbnailIcon'
import FeedbackThumbnailIcon from '@/icons/pageNavigation/FeedbackThumbnailIcon'
import StakingPageThumbnailIcon from '@/icons/pageNavigation/StakingPageThumbnailIcon'
import { colors } from '@/theme/cssVariables'
import { Box, Flex, HStack, MenuDivider, MenuItem, MenuList, Text, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useTranslation } from 'react-i18next'

export function NavMoreButtonMenuPanel() {
  const { t } = useTranslation()
  return (
    <MenuList>
      <Box py={3}>
        <MenuItem>
          <Link as={NextLink} _hover={{ textDecoration: 'none' }} href="/staking">
            <HStack>
              <StakingPageThumbnailIcon />
              <Text>{t('staking.title')}</Text>
            </HStack>
          </Link>
        </MenuItem>
        <MenuDivider />
        <MenuItem>
          <Link as={NextLink} href="https://docs.raydium.io/raydium/" _hover={{ textDecoration: 'none' }} isExternal>
            <HStack>
              <DocThumbnailIcon />
              <Text>{t('common.nav_text_docs')}</Text>
              <ExternalLink color={colors.textSecondary} />
            </HStack>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link as={NextLink} href="https://tally.so/r/n9WZZV" _hover={{ textDecoration: 'none' }} isExternal>
            <HStack>
              <FeedbackThumbnailIcon />
              <Text>{t('common.nav_text_feedback')}</Text>
              <ExternalLink color={colors.textSecondary} />
            </HStack>
          </Link>
        </MenuItem>
      </Box>
      <Flex mb={-1} mt={1} py={2} justifyContent={'space-around'} color={colors.textSecondary} bg={colors.backgroundTransparent07}>
        <Link as={NextLink} href="https://twitter.com/RaydiumProtocol" isExternal>
          <TwitterMediaIcon />
        </Link>
        <Link as={NextLink} href="https://t.me/raydiumprotocol" isExternal>
          <TelegrameMediaIcon />
        </Link>
        <Link as={NextLink} href="https://discord.com/invite/raydium" isExternal>
          <DiscardMediaIcon />
        </Link>
      </Flex>
    </MenuList>
  )
}
