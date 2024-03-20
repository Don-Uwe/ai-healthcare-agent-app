// some global config, (note: these are just js variable not state or css variable)
// const contentWidth = 'clamp(1600px, 80vw, 2000px)'
const contentWidth = '1600px'
export const appLayoutPaddingX = ['20px', `max((100vw - ${contentWidth}) / 2, 7%)`]
export const revertAppLayoutPaddingX = ['-20px', `min((100vw - ${contentWidth}) / -2, -7%)`]

const baseWindowWidth = 1440
const getGridSlot = (body: number | 'auto', frNumber: number) => {
  if (body === 'auto') return `minmax(0, ${frNumber}fr)`
  return `minmax(clamp(${body * 0.8}px, ${((body / baseWindowWidth) * 100).toFixed(2)}vw, ${body * 1.2}px), ${frNumber}fr)`
}

/**
 * CSS value
 */
export function genCSS3GridTemplateColumns(options: { /** px */ rightLeft?: number | 'auto'; /** px */ center: number }) {
  return `${getGridSlot(options.rightLeft ?? 'auto', 1)} ${getGridSlot(options.center, 1.5)} ${getGridSlot(options.rightLeft ?? 'auto', 1)}`
}

/**
 * CSS value
 */
export function genCSS2GridTemplateColumns(options: { /** px */ rightLeft?: number | 'auto'; /** px */ center: number }) {
  return `${getGridSlot(options.rightLeft ?? 'auto', 1)} ${getGridSlot(options.center, 1.5)}`
}
