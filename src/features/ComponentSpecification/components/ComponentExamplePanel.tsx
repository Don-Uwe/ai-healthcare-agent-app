import { Heading, Stack } from '@chakra-ui/react'
import { ReactNode } from 'react'

export function ComponentExamplePanel({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <Stack>
      <Heading>{name}</Heading>
      {children}
    </Stack>
  )
}
export function ComponentExampleGroup({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <Stack>
      <Heading size="sm" fontWeight="400">
        {name}
      </Heading>
      {children}
    </Stack>
  )
}
