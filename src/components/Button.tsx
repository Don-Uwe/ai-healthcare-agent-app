import { shrinkToValue } from '@/utils/shrinkToValue'
import { ButtonProps as ChakraButtonProps, Button as ChakraButton } from '@chakra-ui/react'
import { forwardRef } from 'react'
import { MayArray, MayFunction } from '@raydium-io/raydium-sdk-v2'

/**
 * migrated from V2, and have pre-defined style
 */
export interface ButtonProps extends Omit<ChakraButtonProps, 'colorScheme'> {
  variant?:
    | 'solid'
    | 'solid-dark' // not shining eye-breaking gradient button
    | 'outline'
    | 'ghost'
    | 'link'
    | 'unstyled'
    | 'capsule'
    | 'capsule-radio'
    | 'rect-rounded-radio'
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFunction<any>
    // used in "connect wallet" button, it's order is over props: disabled
    forceActive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<ButtonProps, 'validators'>
  }>
}

export default forwardRef(function Button({ validators, ...restProps }: ButtonProps, ref) {
  const failedValidator = (Array.isArray(validators) ? validators.length > 0 : validators)
    ? [validators!].flat().find(({ should }) => !shrinkToValue(should))
    : undefined
  const mergedProps: Omit<ButtonProps, 'validators'> = failedValidator
    ? {
        ...restProps,
        ...failedValidator.fallbackProps,
        isDisabled: true,
        isActive: failedValidator.forceActive
      }
    : restProps

  return <ChakraButton ref={ref as any} {...mergedProps} />
})
