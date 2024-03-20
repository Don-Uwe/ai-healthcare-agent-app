import { useEffect, useState, MouseEvent, useCallback, useMemo } from 'react'
import { STORAGE_KEY, ResHistory } from '@raydium-io/raydium-sdk-v2'
import { Flex, Box, Menu, MenuButton, MenuList, MenuItem, Button, Text } from '@chakra-ui/react'
import { ChevronDown } from 'react-feather'
import dayjs from 'dayjs'
import List from '@/components/List'
import { onWindowSizeChange } from '@/utils/dom/onWindowSizeChange'

export default function Logs() {
  const [logs, setLogs] = useState<ResHistory[]>([])
  const [sessions, setSessions] = useState<Set<string>>(new Set())
  const [session, setSession] = useState<string>('')
  const [width, setWidth] = useState('900px')

  useEffect(() => {
    setWidth(window.innerWidth * 0.85 + 'px')
    const data: ResHistory[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    setSessions(new Set(data.map((log) => log.session)))
    setLogs(data)

    const { cancel } = onWindowSizeChange(() => setWidth(window.innerWidth * 0.8 + 'px'))
    return cancel
  }, [])

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    setSession(e.currentTarget.dataset['session'] || '')
  }

  const renderLogs = useMemo(() => logs.filter((log) => log.session === session || !session), [logs, session])

  const renderPoolRowItem = useCallback(
    (log: ResHistory) => {
      const url = new URL(log.url)
      return (
        <Flex gap="2" mb="4" width={width} color={log.status !== 200 ? 'red' : ''}>
          <Box w="35%">
            <Text variant="title">Host:</Text> {url.origin}
            <br />
            <Text variant="title">Path:</Text> {url.pathname}
            <br />
            {(url.searchParams as any).size > 0 ? (
              <>
                <Text variant="title">Url params:</Text> {url.searchParams.toString()}
                <br />
              </>
            ) : null}
            time: {dayjs(log.time).utc().format('YYYY/MM/DD hh:mm:ss')}
          </Box>
          <Box w="10%">{log.status}</Box>
          <Box wordBreak="break-all" flex="1">
            {JSON.stringify(log.data).substring(0, 300)}
          </Box>
        </Flex>
      )
    },
    [width]
  )

  return (
    <Box>
      <Menu>
        <MenuButton w="fit-content" as={Button} rightIcon={<ChevronDown />}>
          {session || 'All Session'}
        </MenuButton>
        <MenuList>
          <MenuItem onClick={handleClick}>All</MenuItem>
          {Array.from(sessions).map((session) => (
            <MenuItem key={session} data-session={session} onClick={handleClick}>
              {dayjs(session.replace('ray-', '')).utc().format('MM/DD HH:mm')}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      <Flex gap="2" my="4" width={width}>
        <Box w="35%">url</Box>
        <Box w="10%">status</Box>
        <Box flex="1">response</Box>
      </Flex>
      <List maxHeight="80vh" width={width} gap={4} items={renderLogs} getItemKey={(log) => log.time}>
        {renderPoolRowItem}
      </List>
      {/* {logs.map((log, idx) => {
        const url = new URL(log.url)
        return log.session === session || !session ? (
          <Flex key={`log-${log.session}-${idx}`} gap="2" mb="4" color={log.status !== 200 ? 'red' : ''}>
            <Box w="10%">{log.status}</Box>
            <Box w="35%">
              <Text variant="title">Host:</Text> {url.origin}
              <br />
              <Text variant="title">Path:</Text> {url.pathname}
              <br />
              {(url.searchParams as any).size > 0 ? (
                <>
                  <Text variant="title">Url params:</Text> {url.searchParams.toString()}
                  <br />
                </>
              ) : null}
              time: {dayjs(log.time).utc().format('YYYY/MM/DD hh:mm:ss')}
            </Box>
            <Box wordBreak="break-all" flex="1">
              {JSON.stringify(log.data).substring(0, 300)}
            </Box>
          </Flex>
        ) : null
      })} */}
    </Box>
  )
}
