import Decimal from 'decimal.js'

export const calRatio = (props: { price: number | string; amountA: string; amountB: string }) => {
  const ratioA = new Decimal(props.amountA || 0)
    .mul(props.price || 0)
    .div(new Decimal(props.amountA || 0).mul(props.price || 0).add(props.amountB || 1))
    .mul(100)
    .toDecimalPlaces(5, Decimal.ROUND_FLOOR)
    .toNumber()

  return {
    ratioA,
    ratioB: new Decimal(props.amountB || 0).isZero() ? 0 : 100 - ratioA
  }
}
