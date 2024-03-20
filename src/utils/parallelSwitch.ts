import { NotFunctionValue, Primitive } from '@/types/tools'
import { shrinkToValue } from './shrinkToValue'

// TODO: It's type generic is not correct
/**
 * this Function can generally replace javascript:switch
 *
 * @param value detected value
 * @param conditionPairs conditions (one of them or none of them can match). this's returned Value must have same type.
 * @param fallbackValue
 * @example
 * parallelSwitch('hello', [
 *   [(k) => k.charAt(0) === 'h', 3],
 *   ['world', 4]
 * ]) //=> 3
 *
 * parallelSwitch('hello', [
 *   ['world', 1],
 *   ['hello', 4]
 * ]) //=> 4
 */
export default function parallelSwitch<
  SwitchKey,
  ResultValue extends Primitive // this type is not correct
>(
  value: SwitchKey,
  conditionPairs: Array<
    [is: NotFunctionValue | ((value: SwitchKey) => boolean), returnValue: ResultValue | ((value: SwitchKey) => ResultValue)]
  >,
  fallbackValue?: ResultValue
): ResultValue {
  for (const [is, returnValue] of conditionPairs) {
    if (value === is || shrinkToValue(is, [value]) === true) return shrinkToValue(returnValue, [value])
  }
  return fallbackValue!
}
