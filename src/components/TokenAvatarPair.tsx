import { Flex, FlexProps } from '@chakra-ui/react'
import { ApiV3Token, TokenInfo } from '@raydium-io/raydium-sdk-v2'
import TokenAvatar, { TokenAvatarSize } from './TokenAvatar'

type RawTokenAvatarPairProps = {
  token1?: TokenInfo | ApiV3Token
  token2?: TokenInfo | ApiV3Token
  tokenMint1?: string
  tokenMint2?: string

  /** sx: 16px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: TokenAvatarSize | TokenAvatarSize[]
  /** only if token may collapse each other here (eg. <TokenAvatarPair>) */
  bgBlur?: boolean

  /** when token is not specified */
  icon1?: string
  icon2?: string
  /** will set it's alert */
  name1?: string
  name2?: string
}

/** default size is 'sm' */
export type TokenAvatarPairProps = RawTokenAvatarPairProps & Omit<FlexProps, keyof RawTokenAvatarPairProps>

const sizeMap: Record<TokenAvatarSize, string> = {
  xs: '-2px',
  sm: '-2.5px',
  smi: '-3px',
  md: '-4px',
  lg: '-6px',
  '2xl': '-10px'
}

const parseSize = (size?: TokenAvatarSize) => sizeMap[size || 'md'] || '-4px'

export default function TokenAvatarPair({
  token1,
  token2,
  tokenMint1,
  tokenMint2,
  icon1,
  icon2,
  size,
  bgBlur = true,
  name1,
  name2,
  ...restProps
}: TokenAvatarPairProps) {
  const marginLeft = Array.isArray(size) ? size.map((s) => parseSize(s)) : parseSize(size)

  return (
    <Flex {...restProps}>
      <TokenAvatar bgBlur={bgBlur} size={size} token={token1} tokenMint={tokenMint1} icon={icon1} name={name1} />
      <TokenAvatar bgBlur={bgBlur} size={size} token={token2} tokenMint={tokenMint2} icon={icon2} name={name2} marginLeft={marginLeft} />
    </Flex>
  )
}
