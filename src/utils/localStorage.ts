import { isClient, isLocal } from './common'

export const getStorageItem = (key: string): string | null => {
  if (!isClient()) return null
  return localStorage.getItem(key)
}

export const setStorageItem = (key: string, value: string | number): void => {
  if (!isClient()) return
  return localStorage.setItem(key, String(value))
}

export const deleteStorageItem = (key: string): void => {
  if (!isClient()) return
  return localStorage.removeItem(key)
}

export const getDevOnlyStorage = (key: string): string | null => {
  if (!isClient() || !isLocal()) return null
  return localStorage.getItem(key)
}
