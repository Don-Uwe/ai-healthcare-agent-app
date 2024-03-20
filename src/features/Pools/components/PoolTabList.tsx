import { Tabs, TabList, Tab } from '@chakra-ui/react'
import { sizes } from '@/theme/cssVariables'

/**
 * just a wrapper for chakra-ui Tabs
 */
export function PoolTabList<T extends string>(props: { names: T[]; active?: T; onChange?: (active: string) => void }) {
  return (
    <Tabs onChange={(index) => props.onChange?.(props.names[index])}>
      <TabList>
        {props.names.map((name) => (
          <Tab key={name} fontSize={sizes.textLG}>
            {name}
          </Tab>
        ))}
      </TabList>
    </Tabs>
  )
}
