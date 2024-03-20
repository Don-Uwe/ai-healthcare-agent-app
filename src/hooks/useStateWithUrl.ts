import { useUpdateEffect } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { setUrlQuery, useRouteQuery } from '@/utils/routeTools'

/** the same return interface as original {@link useState} */
export function useStateWithUrl<S>(
  defaultValue: S | (() => S),
  key: string,
  options: {
    /** if not set this or return undefined, URL will not effect STATE,  */
    fromUrl?: (value: string) => S | undefined
    /** if not set this or return undefined, STATE change will not effect with URL */
    toUrl?: (value: S) => string | undefined
  }
): [S, React.Dispatch<S>] {
  const urlQuery = useRouteQuery<{ [key: string]: string | string[] }>()
  const urlValue = urlQuery[key]
  const valueFromUrl = useMemo(() => (urlValue != null ? options.fromUrl?.(String(urlValue)) : undefined), [urlValue])
  const [value, setValue] = useState<any>(valueFromUrl ?? defaultValue)
  const valueToUrl = useMemo(() => (value != null ? options.toUrl?.(value) : undefined), [value])
  useUpdateEffect(() => {
    if (valueToUrl !== urlValue) {
      setUrlQuery({ [key]: valueToUrl })
    }
  }, [valueToUrl, urlValue])

  return [value, setValue]
}

/** like {@link useStateWithUrl} but useEffect to have more dependence */
export function useEffectWithUrl(key: string, effect: (urlValue: string | undefined) => void, dependencies?: any[]) {
  const urlQuery = useRouteQuery<{ [key: string]: string | string[] }>()
  const urlValue = urlQuery[key]
  useEffect(() => {
    effect(urlValue != null ? String(urlValue) : undefined)
  }, [urlValue, ...(dependencies ?? [])])
}
