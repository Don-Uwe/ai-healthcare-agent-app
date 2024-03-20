// birdeye api key
export const birdeyeAuthorizeKey = '34ef0d5d3041451c8e4ef50114856785'

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
  `https://public-api.birdeye.so/defi/ohlcv/base_quote?base_address=${baseMint}&quote_address=${quoteMint}&type=${timeType}&time_from=${timeFrom}&time_to=${timeTo}`

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
}) => `https://public-api.birdeye.so/defi/ohlcv/pair?address=${poolAddress}&type=${timeType}&time_from=${timeFrom}&time_to=${timeTo}`

export const birdeyePriceUrl = 'https://public-api.birdeye.so/defi/multi_price'
