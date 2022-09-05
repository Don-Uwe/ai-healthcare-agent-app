import { useState, useEffect } from 'react'
import { PairJsonInfo } from '@raydium-io/raydium-sdk'
import { usePoolStore } from './usePoolStore'
import { formatLocaleStr } from '@/util/number'
import { useTokenStore, useLiquidityStore } from '@/store'

import { Table, Thead, Tbody, Tfoot, Tr, Th, Td, TableCaption, TableContainer, Avatar, Flex } from '@chakra-ui/react'

const perPage = 30

function Pools() {
  const pairInfoList = usePoolStore((s) => s.pairInfoList)
  const poolMap = useLiquidityStore((s) => s.poolMap)
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [displayList, setDisplayList] = useState<PairJsonInfo[]>([])

  useEffect(() => {
    if (displayList.length === 0) {
      pairInfoList.sort((a, b) => b.volume7d - a.volume7d)
      setDisplayList(pairInfoList.slice(0, perPage))
    }
  }, [pairInfoList])

  return (
    <TableContainer>
      <Table variant="simple">
        <TableCaption>Imperial to metric conversion factors</TableCaption>
        <Thead>
          <Tr>
            <Th>Pool</Th>
            <Th>Liquidity</Th>
            <Th>Volume 7D</Th>
            <Th>Fees 7D</Th>
            <Th>APR 7D</Th>
          </Tr>
        </Thead>
        <Tbody id="tbody" sx={{ maxHeight: '300px' }}>
          {pairInfoList.map((pair) => {
            const [baseToken, quoteToken] = [
              tokenMap.get(poolMap.get(pair.ammId)?.baseMint || ''),
              tokenMap.get(poolMap.get(pair.ammId)?.quoteMint || '')
            ]
            return (
              <Tr key={pair.ammId}>
                <Td>
                  <Flex alignItems="center">
                    <Avatar size="sm" name={baseToken?.symbol} src={baseToken?.icon} />
                    <Avatar size="sm" mr="10px" name={quoteToken?.symbol} src={quoteToken?.icon} />
                    {pair.name}
                  </Flex>
                </Td>
                <Td>${formatLocaleStr(pair.liquidity)}</Td>
                <Td>${formatLocaleStr(pair.volume7d)}</Td>
                <Td>${formatLocaleStr(pair.fee7d)}</Td>
                <Td>{pair.apr7d}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

export default Pools
