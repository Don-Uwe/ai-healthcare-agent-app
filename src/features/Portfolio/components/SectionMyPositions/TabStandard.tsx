import { RAYMint } from '@raydium-io/raydium-sdk-v2'
import { Flex, Text, Link, Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import StandardPoolRowItem from './components/Standard/StandardPoolRowItem'
import { FormattedFarmInfoV6 } from '@/hooks/farm/type'
import { FarmPositionInfo } from '@/hooks/portfolio/farm/useFarmPositions'
import useFetchAccLpMint from '@/hooks/token/useFetchAccLpMint'
import useFetchPoolByLpMint from '@/hooks/pool/useFetchPoolByLpMint'
import { colors } from '@/theme/cssVariables'
import { FarmBalanceInfo } from '@/hooks/farm/type'

export default function MyPositionTabStandard({
  lpBasedData,
  allFarmBalances,
  stakedFarmMap
}: {
  allFarmBalances: FarmBalanceInfo[]
  lpBasedData: Map<string, FarmPositionInfo>
  stakedFarmMap: Map<string, FormattedFarmInfoV6>
}) {
  const { t } = useTranslation()
  const { noneZeroLpMintList } = useFetchAccLpMint({})
  const farmPositionList = Array.from(lpBasedData.entries()).filter(
    ([lpMint, position]) => position.hasAmount && lpMint !== RAYMint.toString()
  )
  const lpOnlyList = noneZeroLpMintList.filter(
    (d) => !(lpBasedData.has(d!.address.toString()) && lpBasedData.get(d!.address.toString())?.hasAmount)
  )

  const { formattedData } = useFetchPoolByLpMint({
    lpMintList: farmPositionList.map((f) => f[0]).concat(lpOnlyList.map((p) => p.address.toBase58()))
  })

  const hasData = farmPositionList.length > 0 || lpOnlyList.length > 0
  const allData = [...farmPositionList, ...lpOnlyList]
  allData.sort((a, b) => {
    const poolA = formattedData?.find((p) => p.lpMint.address === (Array.isArray(a) ? a[0] : a.address.toBase58()))
    const poolB = formattedData?.find((p) => p.lpMint.address === (Array.isArray(b) ? b[0] : b.address.toBase58()))
    return (poolB?.tvl || 0) - (poolA?.tvl || 0)
  })

  return (
    <Flex direction="column" gap={4}>
      {allData.map((data) =>
        Array.isArray(data) ? (
          <StandardPoolRowItem
            key={`user-position-pool-${data[0]}`}
            allFarmBalances={allFarmBalances}
            stakedFarmMap={stakedFarmMap}
            lpMint={data[0]}
            position={data[1]}
          />
        ) : (
          <StandardPoolRowItem
            key={`user-position-pool-${data!.address.toBase58()}`}
            allFarmBalances={allFarmBalances}
            stakedFarmMap={stakedFarmMap}
            lpMint={data!.address.toBase58()}
            position={{
              hasAmount: true,
              hasV1Data: false,
              lpMint: '',
              totalLpAmount: '0',
              totalV1LpAmount: '0',
              data: []
            }}
          />
        )
      )}
      {/* {farmPositionList.map(([lpMint, position]) => (
        <StandardPoolRowItem
          key={`user-position-pool-${lpMint}`}
          stakedFarmMap={stakedFarmMap}
          lpMint={lpMint}
          rpcFarmDataList={rpcFarmDataList}
          position={position}
        />
      ))}
      {lpOnlyList.map((data) => (
        <StandardPoolRowItem
          key={`user-position-pool-${data!.address.toBase58()}`}
          stakedFarmMap={stakedFarmMap}
          lpMint={data!.address.toBase58()}
          rpcFarmDataList={rpcFarmDataList}
          position={{
            hasAmount: true,
            hasV1Data: false,
            lpMint: '',
            totalLpAmount: '0',
            totalV1LpAmount: '0',
            data: []
          }}
        />
      ))} */}
      {!hasData ? (
        <Flex
          alignItems="center"
          justifyContent="center"
          minH="200px"
          flexDir="column"
          py={5}
          px={8}
          bg={colors.backgroundLight}
          gap={6}
          borderRadius="xl"
        >
          <Text variant="title" fontSize="sm">
            {t('portfolio.no_standard_positions')}
          </Text>
          <Link href="/liquidity-pools">
            <Button>{t('common.go_to_pools')}</Button>
          </Link>
        </Flex>
      ) : null}
    </Flex>
  )
}
