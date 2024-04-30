export const numberRegExp = new RegExp(/^[0-9.,]$/)
export const numberOnlyRex = new RegExp(/[0-9.]/gi)
export const extractNumberOnly = (val?: string | number, propsFallback?: string | number) => {
  const fallback = propsFallback ? String(propsFallback) : ''
  return val ? String(val).match(numberOnlyRex)?.join('') || fallback : fallback
}
