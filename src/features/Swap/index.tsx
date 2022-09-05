import { useEffect, useState, useCallback, useRef } from 'react'
import { useTokenStore } from '@/store/useTokenStore'
import { useSwapStore, ComputeParams } from './useSwapStore'

import { TokenJson } from '@raydium-io/raydium-sdk'
import TokenInput from './components/TokenInput'
import TokenSelectDialog, { TokenSelectRef } from './components/TokenSelectDialog'
import ExchangeRate from './components/ExchangeRate'
import { PublicKey } from '@solana/web3.js'
import shallow from 'zustand/shallow'
import { debounce } from 'lodash'

function Swap() {
  const { tokenList, tokenMap } = useTokenStore(
    (s) => ({
      tokenList: s.tokenList,
      tokenMap: s.tokenMap
    }),
    shallow
  )
  const { computedSwapResult, computeSwapAmountAct, computing } = useSwapStore()

  const tokenSelectorRef = useRef<TokenSelectRef>(null)
  const tokenSelectSideRef = useRef<string>('')
  const [mintInput, setMintInput] = useState<string>('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R')
  const [mintOutput, setMintOutput] = useState<string>(PublicKey.default.toBase58())
  const [amountIn, setAmountIn] = useState<string>('')

  const [tokenInput, tokenOutput] = [tokenMap.get(mintInput), tokenMap.get(mintOutput)]

  const handleCompute = useCallback(
    debounce((params: ComputeParams) => {
      computeSwapAmountAct(params)
    }, 200),
    [computeSwapAmountAct]
  )

  const handleInputChange = useCallback((val: string) => {
    setAmountIn(val)
  }, [])

  const handleClickTokenIcon = useCallback((side?: 'input' | 'output') => {
    tokenSelectSideRef.current = side || ''
    tokenSelectorRef.current?.open()
  }, [])

  const handleSelectToken = useCallback((token: TokenJson) => {
    const setFn = tokenSelectSideRef.current === 'input' ? setMintInput : setMintOutput
    setFn(token.mint)
    tokenSelectorRef.current?.close()
  }, [])

  useEffect(() => {
    if (!mintInput || !mintOutput) return
    handleCompute({
      inputMint: mintInput,
      outputMint: mintOutput,
      amount: amountIn
    })
  }, [mintInput, mintOutput, amountIn])

  return (
    <>
      Swap
      <div>
        <TokenInput side="input" token={tokenInput} onClickIcon={handleClickTokenIcon} value={amountIn} onChange={handleInputChange} />
        <TokenInput
          side="output"
          token={tokenOutput}
          onClickIcon={handleClickTokenIcon}
          value={computedSwapResult?.amountOut.toExact() || ''}
          readonly={true}
          loading={computing}
        />

        {computedSwapResult && <>min received {computedSwapResult?.minAmountOut.toExact()}</>}
        {computedSwapResult?.executionPrice && (
          <ExchangeRate tokenInput={tokenInput!} tokenOutput={tokenOutput!} executionPrice={computedSwapResult?.executionPrice} />
        )}

        <TokenSelectDialog
          ref={tokenSelectorRef}
          tokenList={tokenList}
          selectedValue={new Set([mintInput, mintOutput])}
          onSelectValue={handleSelectToken}
        />
      </div>
    </>
  )
}

export default Swap
