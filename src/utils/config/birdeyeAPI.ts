// birdeye api key
export const birdeyHost = 'https://birdeye-proxy.raydium.io'

export const birdeyeKlineApiAddress = ({
  baseMint,
  quoteMint,
  timeType,
  timeFrom,
  timeTo
}: {
  baseMint: string
  quoteMint: string
  timeType: string
  timeFrom: number
  timeTo: number
}) =>
  `${birdeyHost}/defi/ohlcv/base_quote?base_address=${baseMint}&quote_address=${quoteMint}&type=${timeType}&time_from=${timeFrom}&time_to=${timeTo}`

export const birdeyePairVolumeApiAddress = ({
  poolAddress,
  timeType,
  timeFrom,
  timeTo
}: {
  poolAddress: string
  timeType: string
  timeFrom: number
  timeTo: number
}) => `${birdeyHost}/defi/ohlcv/pair?address=${poolAddress}&type=${timeType}&time_from=${timeFrom}&time_to=${timeTo}`

export const birdeyePairPriceApiAddress = ({
  baseMint,
  timeType,
  timeFrom,
  timeTo
}: {
  baseMint: string
  timeType: string
  timeFrom: number
  timeTo: number
}) => `${birdeyHost}/defi/history_price?address=${baseMint}&type=${timeType}&address_type=token&time_from=${timeFrom}&time_to=${timeTo}`

export const birdeyePriceUrl = `${birdeyHost}/defi/multi_price`
