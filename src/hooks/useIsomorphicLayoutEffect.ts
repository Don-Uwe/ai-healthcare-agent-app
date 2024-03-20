import { isClient } from '@/utils/common'
import { useLayoutEffect, useEffect } from 'react'

export const useIsomorphicLayoutEffect = isClient() ? useLayoutEffect : useEffect
