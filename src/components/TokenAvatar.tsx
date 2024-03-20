import { AvatarProps, Text, Box, Image, forwardRef, useColorMode } from '@chakra-ui/react'
import { useMemo } from 'react'
import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'
import { colors } from '@/theme/cssVariables'
import useTokenInfo from '@/hooks/token/useTokenInfo'

// eslint-disable-next-line @typescript-eslint/ban-types
export type TokenAvatarSize = 'xs' | 'sm' | 'smi' | 'md' | 'lg' | '2xl' | (string & {})

type RawTokenAvatarProps = {
  /** pase token to contain all info */
  token?: ApiV3Token | Pick<ApiV3Token, 'address' | 'symbol' | 'decimals' | 'logoURI'>
  tokenMint?: string

  /** xs: 16px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: TokenAvatarSize | TokenAvatarSize[]
  bgBlur?: boolean

  /** when token is not specified */
  icon?: string
  /** will set it's alert */
  name?: string

  haveHTMLTitle?: boolean
}

/** default size is 'sm' */
export type TokenAvatarProps = RawTokenAvatarProps & Omit<AvatarProps, keyof RawTokenAvatarProps>
const sizeMap = {
  xs: '16px',
  sm: '20px',
  smi: '24px',
  md: '32px',
  lg: '48px',
  '2xl': '80px'
}
// @ts-expect-error enum
const parseSize = (size: TokenAvatarSize) => sizeMap[size]

export default forwardRef(function TokenAvatar(
  { token: originalToken, tokenMint, icon, size = 'md', name, bgBlur, haveHTMLTitle, ...restProps }: TokenAvatarProps,
  ref
) {
  const { colorMode } = useColorMode()
  const isLight = colorMode !== 'dark'

  const boxSize = Array.isArray(size) ? size.map((s) => parseSize(s) ?? s) : parseSize(size) ?? size
  const { tokenInfo } = useTokenInfo({
    mint: tokenMint
  })

  const token = originalToken || tokenInfo

  const iconSrc = useMemo(() => icon ?? (token ? token.logoURI : undefined), [icon, token])

  return (
    // panel bg board
    <Box
      ref={ref}
      bg={colors.tokenAvatarBg}
      border={isLight ? `1px solid ${colors.primary}` : 'none'}
      minWidth={boxSize}
      minHeight={boxSize}
      maxWidth={boxSize}
      maxHeight={boxSize}
      borderRadius="50%"
      p={'.15em'}
      fontSize={boxSize} // for use 'em' unit
      backdropFilter={bgBlur ? 'blur(2px)' : undefined}
      {...restProps}
    >
      {/* token icon container */}
      <Box borderRadius="50%" aspectRatio={'1'} overflow="hidden">
        {iconSrc ? (
          <Image
            loading="lazy"
            objectFit="cover"
            src={iconSrc}
            alt={name || token?.address}
            title={haveHTMLTitle && (name || token) ? `${name || token?.symbol || token?.address}` : undefined}
          />
        ) : null}
      </Box>
    </Box>
  )
})
