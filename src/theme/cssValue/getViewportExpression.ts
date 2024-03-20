type CSSLengthPoint = [value: number /* px */, inContextSize: number /* px */]
/**
 * @example
 * getDynamicCSSLength({ dynamicUnit: 'vw', p1: [0, 800], p2: [20, 1300] }) //=> calc(4vh + -32px)
 * getDynamicCSSLength({ dynamicUnit: 'vh', p1: [0, 800], p2: [20, 1300], clamp: true }) //=> clamp(0px, 4vh + -32px, 20px)
 */
export function getViewportExpression(option: { direction: 'w' | 'h'; p1: CSSLengthPoint; p2: CSSLengthPoint; clamp?: boolean }) {
  const { direction, p1, p2 } = option
  const unit = direction === 'w' ? 'vw' : 'vh'
  const [v1, contextSize1] = p1
  const [v2, contextSize2] = p2
  const slope = (v2 - v1) / (contextSize2 - contextSize1)
  const intercept = v1 - slope * contextSize1
  const dynamicExpression = `${slope * 100}${unit} + ${intercept}px`
  return option.clamp ? `clamp(${Math.min(v1, v2)}px, ${dynamicExpression}, ${Math.max(v1, v2)}px)` : `calc(${dynamicExpression})`
}

/** clamp is alway true */
export function getVWExpression(p1: CSSLengthPoint, p2: CSSLengthPoint) {
  return getViewportExpression({ direction: 'w', p1, p2, clamp: true })
}

/** clamp is alway true */
export function getVHExpression(p1: CSSLengthPoint, p2: CSSLengthPoint) {
  return getViewportExpression({ direction: 'h', p1, p2, clamp: true })
}
