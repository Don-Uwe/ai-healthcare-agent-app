import { useEffect } from 'react'
import { useAppStore, EXPLORER_KEY, APR_MODE_KEY, USER_ADDED_KEY, FEE_KEY } from '@/store/useAppStore'
import { useLiquidityStore, LIQUIDITY_SLIPPAGE_KEY } from '@/store/useLiquidityStore'
import { useSwapStore, SWAP_SLIPPAGE_KEY } from '@/features/Swap/useSwapStore'
import { getStorageItem } from '@/utils/localStorage'
import { I18N_CACHE_KEY, changeLang } from '@/i18n'

export default function useLoadStorageData() {
  useEffect(() => {
    const [explorerUrl, aprMode, userAdded, transactionFee, cacheLang, liquiditySlippage, swapSlippage] = [
      getStorageItem(EXPLORER_KEY),
      getStorageItem(APR_MODE_KEY),
      getStorageItem(USER_ADDED_KEY),
      getStorageItem(FEE_KEY),
      getStorageItem(I18N_CACHE_KEY),
      getStorageItem(LIQUIDITY_SLIPPAGE_KEY),
      getStorageItem(SWAP_SLIPPAGE_KEY)
    ]

    useAppStore.setState({
      ...(explorerUrl ? { explorerUrl } : {}),
      ...(aprMode ? { aprMode: aprMode as 'M' | 'D' } : {}),
      ...(transactionFee ? { transactionFee } : {}),
      ...(userAdded
        ? {
            displayTokenSettings: {
              ...useAppStore.getState().displayTokenSettings,
              userAdded: userAdded === 'true'
            }
          }
        : {})
    })

    if (liquiditySlippage) {
      useLiquidityStore.setState({
        slippage: Number(liquiditySlippage)
      })
    }
    if (swapSlippage)
      useSwapStore.setState({
        slippage: Number(swapSlippage)
      })
    changeLang(cacheLang || 'en')
  }, [])
}
