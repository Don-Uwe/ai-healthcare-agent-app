import { setStorageItem, getStorageItem, deleteStorageItem } from '@/utils/localStorage'

const CLMM_KEY = '_r_clmm_o_'

export const setOpenCache = (key: string, open: boolean) => {
  const prevValue = JSON.parse(getStorageItem(CLMM_KEY) || '{}')
  prevValue[key] = open
  setStorageItem(CLMM_KEY, JSON.stringify(prevValue))
}

export const getOpenCache = (key: string) => {
  return JSON.parse(getStorageItem(CLMM_KEY) || '{}')[key]
}

export const deleteOpenCache = () => deleteStorageItem(CLMM_KEY)
