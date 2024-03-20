import { Flex, Link } from '@chakra-ui/react'
import { useIdoStore } from '@/features/Ido/useIdoStore'
import { useAppStore } from '@/store/useAppStore'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { DATE_FORMAT_REGEX_UTC } from '@/utils/time'
import dayjs from 'dayjs'

export const socialIconSrcMap = {
  website: '/icons/acceleraytor-global.svg',
  twitter: '/icons/acceleraytor-twitter.svg',
  telegram: '/icons/acceleraytor-telegram.svg',
  discord: '/icons/acceleraytor-discord.svg',
  medium: '/icons/acceleraytor-medium.svg',
  twitch: '/icons/acceleraytor-twitch.svg',
  youtube: '/icons/acceleraytor-youtube.svg'
}

export default function IdoDetail() {
  const connected = useAppStore((s) => s.connected)
  const [ido, idoHydratedMap] = useIdoStore((s) => [s.currentIdo, s.idoHydratedMap])
  const idoInfo = idoHydratedMap.get(ido?.info.id || '')

  if (!idoInfo) return null

  return (
    <>
      {idoInfo.winningTicketsTailNumber ? (
        <div>
          <div className="mobile:text-sm font-semibold text-base text-white">
            {['1', '2'].includes(String(idoInfo.winningTicketsTailNumber?.isWinning)) ? (
              <div>
                {/* {idoInfo.winningTicketsTailNumber?.tickets.map(({ no, isPartial }) => `${no}${isPartial ? ' (partial)' : ''}`).join(', ')} */}
              </div>
            ) : ['3'].includes(String(idoInfo.winningTicketsTailNumber?.isWinning)) ? (
              <div>(Every deposited ticket wins)</div>
            ) : (
              <div className="opacity-50">{idoInfo?.isClosed ? '(Lottery in progress)' : '(Numbers selected when lottery ends)'}</div>
            )}
          </div>
          <div className="text-xs font-semibold  text-[#ABC4FF] opacity-50">
            {
              {
                '0': 'Lucky Ending Numbers',
                '1': 'All numbers not ending with',
                '2': 'Lucky Ending Numbers',
                '3': 'All Tickets Win',
                undefined: 'Lucky Ending Numbers'
              }[String(idoInfo.winningTicketsTailNumber?.isWinning)]
            }
          </div>
        </div>
      ) : null}
      <div>
        {idoInfo.baseSymbol} - {idoInfo.projectName}
        <br />
        {formatLocaleStr(idoInfo.totalRaise?.toExact() || '0')} {idoInfo.baseSymbol} Total raised
        <br />
        {idoInfo.ticketPrice?.toExact()} {idoInfo.quoteSymbol} Allocation / Winning Ticket
        <br />
        {idoInfo.coinPrice?.toSignificant()} per {idoInfo.baseSymbol}
        <br />
        {formatLocaleStr(idoInfo.depositedTicketCount || '0')}/{idoInfo.maxWinLotteries} Total tickets deposited
        <br />
        {dayjs(idoInfo.startTime).utc().format(DATE_FORMAT_REGEX_UTC)} Pool open
        <br />
        {dayjs(idoInfo.endTime).utc().format(DATE_FORMAT_REGEX_UTC)} Pool close
        <br />
        {connected ? formatLocaleStr(idoInfo.userEligibleTicketAmount?.toString() || '0') : '--'} Eligible Tickets
        <br />
        {connected ? formatLocaleStr(idoInfo.depositedTickets?.length || 0) : '--'} Deposited Tickets
        <br />
        {/* {connected ? formatLocaleStr(idoInfo.depositedTickets?.filter((i) => i.isWinning)?.length || 0) : '--'} Winning Tickets */}
        <br />
        {connected ? formatLocaleStr(idoInfo.userAllocation?.toString() || 0) : '--'} Allocation
      </div>
      <div>
        Project details
        <br />
        {ido?.projectInfo.projectDetails}
        <Flex alignItems="center" gap="4" sx={{ textDecoration: 'underline' }}>
          <Link href={ido?.projectInfo.projectDocs.website} isExternal>
            Website
          </Link>
          <Link href={ido?.projectInfo.projectDocs.tokenomics} isExternal>
            Tokenomics
          </Link>
          {/* {Object.entries(ido?.projectInfo.projectSocials || {}).map(([key, val]) => (
            <Link key={key} href={val} isExternal>
              <Image width="16px" height="16px" src={socialIconSrcMap[key.toLocaleLowerCase() as keyof typeof socialIconSrcMap]} />
            </Link>
          ))} */}
        </Flex>
      </div>
    </>
  )
}
