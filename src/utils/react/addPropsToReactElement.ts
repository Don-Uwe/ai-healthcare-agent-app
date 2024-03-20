import { MayFunction } from '@/types/tools'
import { cloneElement, isValidElement as isValidReactElement } from 'react'

import { shrinkToValue } from '../shrinkToValue'
import mergeProps from './mergeProps'

export default function addPropsToReactElement<AvailableProps = { [key: string]: any }>(
  element: any,
  props?: MayFunction<Partial<AvailableProps> & { key?: number | string }, [oldprops: Partial<AvailableProps>]>
): JSX.Element {
  if (!isValidReactElement(element)) return element
  // @ts-expect-error force type
  return element ? cloneElement(element, mergeProps(element.props, shrinkToValue(props, [element.props]))) : null
}

export function addPropsToReactElements<AvailableProps = { [key: string]: any }>(
  elements: any,
  props?: Partial<AvailableProps>
): JSX.Element {
  //@ts-expect-error force
  return [elements]
    .flat()
    .map((element, idx) =>
      isValidReactElement(element)
        ? element
          ? cloneElement(element, mergeProps(element.props, props, { key: (elements as any)?.key ?? idx }))
          : null
        : element
    )
}
