import { isNullish, isArray, isEmptyObject } from '@/utils/judges/judgeType'
import { useRecordedEffect } from './useRecordedEffect'
import { useRef } from 'react'

/** can't judege which is newer is firstTime, U counld set conflictMasterSide, ('auto' will respect larger one) */
export default function useTwinSyncer<T, F>({
  disabled,
  state1,
  onState2Changed,
  state2,
  onState1Changed,
  conflictMasterSide = 'state1'
}: {
  disabled?: boolean
  state1: T
  state2: F
  onState1Changed?: (
    state: T,
    utils: {
      /** set this will avoid onChange fired by next frame of state2 change (which is caused inside the callback) */
      setAvoidFlag: (flagState2Value: F) => void
    }
  ) => void
  onState2Changed?: (
    state: F,
    utils: {
      /** set this will avoid onChange fired by next frame of state1 change (which is caused inside the callback) */
      setAvoidFlag: (flagState1Value: T) => void
    }
  ) => void
  conflictMasterSide?: 'state1' | 'state2'
}) {
  // collect calced state 2
  const state1AvoidFlagRef = useRef<F>()
  // collect calced state 1
  const state2AvoidFlagRef = useRef<T>()

  function setState2AvoidFlag(flagState2Value: F) {
    state1AvoidFlagRef.current = flagState2Value
  }
  function setState1AvoidFlag(flagState1Value: T) {
    state2AvoidFlagRef.current = flagState1Value
  }

  useRecordedEffect(
    ([prevState1, prevState2]) => {
      const matchState1AcoidFlag = state1AvoidFlagRef.current === state2
      if (matchState1AcoidFlag) {
        state1AvoidFlagRef.current = undefined
        return
      }
      const matchState2AcoidFlag = state2AvoidFlagRef.current === state1
      if (matchState2AcoidFlag) {
        state2AvoidFlagRef.current = undefined
        return
      }
      if (disabled) return
      if (Object.is(state1, state2)) return

      // clear avoid flag value
      state1AvoidFlagRef.current = undefined
      state2AvoidFlagRef.current = undefined

      const canInitlySync = isNullish(prevState1) && isNullish(prevState2) && (!isEmptyValue(state1) || !isEmptyValue(state2))
      const state2HasChanged = state1 === prevState1 && !isEmptyValue(state2) && state2 !== prevState2
      const state1HasChanged = state2 === prevState2 && !isEmptyValue(state1) && state1 !== prevState1
      const bothHasChanged = state1 !== prevState1 && state2 !== prevState2

      const shouldUpdateState1 =
        state2HasChanged || (bothHasChanged && conflictMasterSide === 'state2') || (canInitlySync && conflictMasterSide === 'state2')
      const shouldUpdateState2 =
        state1HasChanged || (bothHasChanged && conflictMasterSide === 'state1') || (canInitlySync && conflictMasterSide === 'state1')

      shouldUpdateState1 && onState2Changed?.(state2, { setAvoidFlag: setState1AvoidFlag })
      shouldUpdateState2 && onState1Changed?.(state1, { setAvoidFlag: setState2AvoidFlag })
    },
    [state1, state2]
  )
}

function isEmptyValue(obj: any): boolean {
  return isEmptyObject(obj) || isArray(obj) || isNullish(obj)
}
