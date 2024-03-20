import { RaydiumApiBatchRequestParams } from '@raydium-io/raydium-sdk-v2'

export type SSRData = Omit<RaydiumApiBatchRequestParams, 'api'>
export type ValueOf<T> = T[keyof T]
