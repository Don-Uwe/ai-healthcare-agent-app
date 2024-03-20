import { RefObject } from 'react'
import { isObject } from '../judges/judgeType'
import { MayArray } from '@/types/tools'
import { shakeFalsyItem } from '../arrayMethods'

type Element = HTMLElement | undefined | null

type MayRef<T> = T | RefObject<T>

export type ElementSingle = MayRef<Element>
export type ElementRefs = MayRef<MayArray<MayRef<Element>>>
export function getElementsFromRef(refs: ElementRefs): HTMLElement[] {
  const getRef = <T>(ref: T | RefObject<T>): T => (isObject(ref) && 'current' in ref ? ref.current : ref) as T
  return shakeFalsyItem(flap(getRef(refs)).map((ref) => getRef(ref)))
}

export function flap<T>(arr: T): T extends Array<infer U> ? U[] : T[] {
  // @ts-expect-error force type
  return Array.isArray(arr) ? arr : [arr]
}

export function getSingleElement(ref: ElementSingle): HTMLElement | undefined {
  const el = isObject(ref) && 'current' in ref ? ref.current : ref
  return el ?? undefined
}
