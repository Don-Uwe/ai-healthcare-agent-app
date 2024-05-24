import { useEffect } from 'react'
import { useAppStore, EXPLORER_KEY, APR_MODE_KEY, USER_ADDED_KEY, SLIPPAGE_KEY, FEE_KEY } from '@/store/useAppStore'
import { getStorageItem } from '@/utils/localStorage'
import { I18N_CACHE_KEY, changeLang } from '@/i18n'

export default function useLoadStorageData() {
  useEffect(() => {
    const [explorerUrl, aprMode, userAdded, slippage, transactionFee, cacheLang] = [
      getStorageItem(EXPLORER_KEY),
      getStorageItem(APR_MODE_KEY),
      getStorageItem(USER_ADDED_KEY),
      getStorageItem(SLIPPAGE_KEY),
      getStorageItem(FEE_KEY),
      getStorageItem(I18N_CACHE_KEY)
    ]

    useAppStore.setState({
      ...(explorerUrl ? { explorerUrl } : {}),
      ...(aprMode ? { aprMode: aprMode as 'M' | 'D' } : {}),
      ...(slippage ? { slippage: Number(slippage) } : {}),
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
    changeLang(cacheLang || 'en')
  }, [])
}
