import { AnyFn, AnyObj, Primitive } from '@/types/tools'
import { isArray, isFunction, isObject } from '../judges/judgeType'
import { mergeFunction, _shallowMergeObjects } from '../merge'
import parallelSwitch from '../parallelSwitch'
import mergeRef from './mergeRef'

/**prop may very deep like children */
export type AnyProp = { [props: string]: any } | Primitive

export default function mergeProps<P1 = AnyProp, P2 = AnyProp>(...propsObjs: [P1, P2]): Exclude<P1 & P2, undefined>
export default function mergeProps<P1 = AnyProp, P2 = AnyProp, P3 = AnyProp>(...propsObjs: [P1, P2, P3]): Exclude<P1 & P2 & P3, undefined>
export default function mergeProps<P1 = AnyProp, P2 = AnyProp, P3 = AnyProp, P4 = AnyProp>(
  ...propsObjs: [P1, P2, P3, P4]
): Exclude<P1 & P2 & P3 & P4, undefined>
export default function mergeProps<P1 = AnyProp, P2 = AnyProp, P3 = AnyProp, P4 = AnyProp, P5 = AnyProp>(
  ...propsObjs: [P1, P2, P3, P4, P5]
): Exclude<P1 & P2 & P3 & P4 & P5, undefined>
export default function mergeProps<P extends AnyProp | undefined>(...propsObjs: P[]): Exclude<P, undefined> {
  const trimedProps = propsObjs.flat(Infinity).filter(isObject) as any[]
  if (trimedProps.length === 0) return {} as any
  if (trimedProps.length === 1) return trimedProps[0]
  return _shallowMergeObjects(trimedProps, (key, v1: any, v2: any) =>
    parallelSwitch<string, any>(
      key,
      [
        ['children', () => v2 ?? v1],
        ['className', () => [v1, v2].join(' ')],
        ['domRef', () => (v1 && v2 ? mergeRef(v1, v2) : v1 ?? v2)],
        [() => isFunction(v1) && isFunction(v2), () => mergeFunction(v1 as AnyFn, v2 as AnyFn)],
        [() => isObject(v1) && isObject(v2), () => mergeProps(v1 as AnyObj, v2 as AnyObj)],
        [() => isArray(v1) && isArray(v2), () => (v1 as any[]).concat(v2)]
      ],
      v2 ?? v1
    )
  )
}
