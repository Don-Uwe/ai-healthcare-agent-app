import { Fragment } from 'react'
import Link from 'next/link'
import { Flex, Box, Image } from '@chakra-ui/react'
import { useIdoStore } from './useIdoStore'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { DATE_FORMAT_REGEX_UTC } from '@/utils/time'
import Button from '@/components/Button'
import dayjs from 'dayjs'

export default function Ido() {
  const idoHydratedList = useIdoStore((s) => s.idoHydratedList)
  return (
    <Flex flexDirection="column" gap="6">
      {idoHydratedList.map((ido) => (
        <Fragment key={ido.id}>
          <Flex justifyContent="space-between" alignItems="center" p="4" border="1px solid #FFF" borderRadius="10px">
            <Flex gap="4" alignItems="center">
              <Image src={ido.baseIcon} width="42px" height="42px" />
              <Box>
                {ido.baseSymbol}
                <br />
                {ido.projectName}
              </Box>
              <Box>{formatLocaleStr(ido.filled || '0')}%</Box>
            </Flex>
            <Flex gap="4">
              <Button>Claim {ido.baseSymbol}</Button>
              <Button>Claim {ido.quoteSymbol}</Button>
            </Flex>
          </Flex>
          <Flex>
            <Box flex="2" p="2">
              <Link href={`/acceleraytor/detail?idoId=${ido.id}`}>
                <Image src={ido.projectPosters} />
              </Link>
            </Box>
            <Flex flex="3">
              {formatLocaleStr(ido.totalRaise?.toExact() || '0')} {ido.baseSymbol}
              <br />
              {formatLocaleStr(ido.depositedTicketCount || '0')} tickets
              <br />
              {dayjs(ido.startTime).utc().format(DATE_FORMAT_REGEX_UTC)} pool open
              <br />
              {ido.coinPrice?.toSignificant()} {ido.quoteSymbol} per {ido.baseSymbol}
              <br />
              {ido.ticketPrice?.toExact()} {ido.quoteSymbol} Allocation / Winning Ticket
              <br />
              {dayjs(ido.endTime).utc().format(DATE_FORMAT_REGEX_UTC)} pool close
            </Flex>
          </Flex>
        </Fragment>
      ))}
    </Flex>
  )
}
