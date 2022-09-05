import { SplToken, Price } from '@raydium-io/raydium-sdk'

interface Props {
  tokenInput: SplToken
  tokenOutput: SplToken
  executionPrice?: Price
}

export default function ExchangeRate(props: Props) {
  const { tokenInput, tokenOutput, executionPrice } = props

  if (!executionPrice) return null

  return (
    <div>
      1 {tokenInput.symbol} ≈ {executionPrice.toFixed()} <br />1 {tokenOutput.symbol} ≈ {executionPrice.invert().toFixed()}
    </div>
  )
}
