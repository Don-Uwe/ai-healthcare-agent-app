import { TokenInfo, Price } from '@raydium-io/raydium-sdk-v2'

interface Props {
  tokenInput: TokenInfo
  tokenOutput: TokenInfo
  executionPrice?: Price
}

export default function ExchangeRate(props: Props) {
  const { tokenInput, tokenOutput, executionPrice } = props
  if (!executionPrice || executionPrice?.raw.isZero()) return null
  return (
    <div>
      1 {tokenInput.symbol} ≈ {executionPrice.toFixed()} <br />1 {tokenOutput.symbol} ≈ {executionPrice.invert().toFixed()}
    </div>
  )
}
