import CalloutMessageSlip from '@/components/CalloutMessageSlip'
import MessageBox from '@/components/MessageBox'
import { Select } from '@/components/Select'
import Tabs from '@/components/Tabs'
import ToastTransaction from '@/components/Toast/ToastTransaction'
import TokenInput from '@/components/TokenInput'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import CirclePluginIcon from '@/icons/misc/CirclePluginIcon'
import ExternalLink from '@/icons/misc/ExternalLink'
import Farm from '@/icons/misc/Farm'
import GridIcon from '@/icons/misc/GridIcon'
import ListIcon from '@/icons/misc/ListIcon'
import SearchIcon from '@/icons/misc/SearchIcon'
import SliderThumbIcon from '@/icons/misc/SliderThumb'
import { useTokenStore } from '@/store/useTokenStore'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import {
  Box,
  Button,
  Card,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Progress,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Switch,
  Text,
  Tooltip
} from '@chakra-ui/react'
import { useId, useState } from 'react'
import { ComponentExampleGroup, ComponentExamplePanel } from './components/ComponentExamplePanel'

export default function ComponentSpecification() {
  return (
    <SimpleGrid templateColumns="repeat(auto-fill, minmax(20vw, 1fr))" gap={24} paddingX={8} alignItems="start" gridAutoFlow={'dense'}>
      <SelectorExample />
      <ButtonExample />
      <GridItem colSpan={3}>
        <TabExample />
      </GridItem>
      <CheckboxExample />
      {/* <MenuExample /> */}
      <SliderExample />
      <TooltipExample />
      <SwitchExample />
      <SearchExample />
      <MenuExample />
      <ProgressExample />
      <GridItem colSpan={2}>
        <MessageStripExample />
      </GridItem>
      <MessageBoxExample />
      <ToastExample />
      <GridItem colSpan={2}>
        <TokenInputExample />
      </GridItem>
    </SimpleGrid>
  )
}

function TabExample() {
  return (
    <ComponentExamplePanel name="Tabs">
      <Text width="600px">Line</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        variant="line"
        size="sm"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        variant="line"
        size="md"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        variant="line"
        size="lg"
      />
      <Divider h={4} />
      <Text>Square</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="sm"
        variant="square"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="md"
        variant="square"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="lg"
        variant="square"
      />
      <Divider h={4} />
      <Text>Square Panel</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="sm"
        variant="squarePanel"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="md"
        variant="squarePanel"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="lg"
        variant="squarePanel"
      />
      <Divider h={4} />
      <Text>Square panel dark</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="md"
        variant="squarePanelDark"
      />
      <Divider h={4} />
      <Text>Rounded</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="sm"
        variant="rounded"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="md"
        variant="rounded"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="lg"
        variant="rounded"
      />
      <Divider h={4} />
      <Text>Rounded Light</Text>
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="sm"
        variant="roundedLight"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="md"
        variant="roundedLight"
      />
      <Tabs
        items={[
          { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
          { value: 'Raydium', label: 'Raydium' },
          { value: 'Fusion', label: 'Fusion' },
          { value: 'Inactive', label: 'Inactive' }
        ]}
        size="lg"
        variant="roundedLight"
      />
      <Divider h={4} />
      <Text>Rounded Plain</Text>
      <Tabs
        items={[
          { value: 'list', label: <ListIcon key={`list-icon`} /> },
          { value: 'grid', label: <GridIcon key={`grid-icon`} /> }
        ]}
        size="sm"
        variant="roundedPlain"
      />
      <Tabs
        items={[
          { value: 'list', label: <ListIcon key={`list-icon`} /> },
          { value: 'grid', label: <GridIcon key={`grid-icon`} /> }
        ]}
        size="md"
        variant="roundedPlain"
      />
      <Tabs
        items={[
          { value: 'list', label: <ListIcon key={`list-icon`} /> },
          { value: 'grid', label: <GridIcon key={`grid-icon`} /> }
        ]}
        size="lg"
        variant="roundedPlain"
      />
      <Divider h={4} />
      <Text>Folder</Text>
      <Box bg={colors.backgroundMedium} borderRadius="20px" overflow="hidden" w="fit-content">
        <Tabs
          isFitted
          items={[
            { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
            { value: 'Raydium', label: 'Raydium' },
            { value: 'Fusion', label: 'Fusion' },
            { value: 'Inactive', label: 'Inactive' }
          ]}
          size="sm"
          variant="folder"
        />
        <Tabs
          isFitted
          items={[
            { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
            { value: 'Raydium', label: 'Raydium' },
            { value: 'Fusion', label: 'Fusion' },
            { value: 'Inactive', label: 'Inactive' }
          ]}
          size="md"
          variant="folder"
        />
        <Tabs
          isFitted
          items={[
            { value: 'loooooooooooooooooooooooooooooong', label: 'loooooooooooooooooooooooooooooong' },
            { value: 'Raydium', label: 'Raydium' },
            { value: 'Fusion', label: 'Fusion' },
            { value: 'Inactive', label: 'Inactive' }
          ]}
          size="lg"
          variant="folder"
        />
      </Box>
    </ComponentExamplePanel>
  )
}

function ButtonExample() {
  return (
    <ComponentExamplePanel name="Button">
      <ComponentExampleGroup name="Common">
        <Button>This is a button</Button>
        <Button variant="outline">This is a button</Button>
        <Button variant="ghost" leftIcon={<CirclePluginIcon />}>
          Create Pool
        </Button>
        {/* usually indicate a button with status change */}
        <Button variant="capsule">Capsule</Button>
      </ComponentExampleGroup>

      <ComponentExampleGroup name="Disabled">
        <Button isDisabled>This is a button</Button>
        <Button isDisabled variant="outline">
          This is a button
        </Button>
        <Button isDisabled variant="ghost" leftIcon={<CirclePluginIcon />}>
          Create Pool
        </Button>
      </ComponentExampleGroup>
    </ComponentExamplePanel>
  )
}

function CheckboxExample() {
  return (
    <ComponentExamplePanel name="Checkbox">
      <Checkbox>Checkbox</Checkbox>
      <Checkbox defaultChecked>Checkbox</Checkbox>
    </ComponentExamplePanel>
  )
}

function MenuExample() {
  return (
    <ComponentExamplePanel name="Menu">
      <Menu>
        <MenuButton>Actions</MenuButton>
        <MenuList>
          <MenuItem>Download</MenuItem>
          <MenuItem>Create a Copy</MenuItem>
          <MenuItem>Mark as Draft</MenuItem>
          <MenuItem>Delete</MenuItem>
          <MenuItem>Attend a Workshop</MenuItem>
        </MenuList>
      </Menu>
    </ComponentExamplePanel>
  )
}

/** @todo `<Slider>` should abstract to a component */
function SliderExample() {
  const [sliderValue, setSliderValue] = useState(5)
  const [showTooltip, setShowTooltip] = useState(false)
  return (
    <ComponentExamplePanel name="Slider">
      <Card>
        <Slider
          defaultValue={30}
          onChange={(v) => setSliderValue(v)}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <SliderMark value={0} sx={{ '--tx': '-0%' }}>
            0%
          </SliderMark>
          <SliderMark value={25} sx={{ '--tx': '-25%' }}>
            25%
          </SliderMark>
          <SliderMark value={50} sx={{ '--tx': '-50%' }}>
            50%
          </SliderMark>
          <SliderMark value={75} sx={{ '--tx': '-75%' }}>
            75%
          </SliderMark>
          <SliderMark value={100} sx={{ '--tx': '-100%' }}>
            100%
          </SliderMark>

          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>

          <Tooltip
            hasArrow
            bg={colors.secondary}
            color={colors.backgroundDark}
            fontSize="12px"
            fontWeight="500"
            placement="top"
            isOpen={showTooltip}
            label={`${sliderValue}%`}
          >
            <SliderThumb>
              <SliderThumbIcon />
            </SliderThumb>
          </Tooltip>
        </Slider>
      </Card>
    </ComponentExamplePanel>
  )
}

function TooltipExample() {
  return (
    <ComponentExamplePanel name="Tooltip">
      <Tooltip hasArrow arrowSize={8} label="some description">
        <Button>Hover me</Button>
      </Tooltip>
    </ComponentExamplePanel>
  )
}

function SwitchExample() {
  const componentId = useId()
  return (
    <ComponentExamplePanel name="Switch">
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor={componentId} mb={0}>
          My Pools
        </FormLabel>
        <Switch id={componentId} defaultChecked />
      </FormControl>
      <FormControl display="flex" alignItems="center">
        <FormLabel htmlFor={componentId + '1'} mb={0}>
          My Pools
        </FormLabel>
        <Switch id={componentId + '1'} />
      </FormControl>
    </ComponentExamplePanel>
  )
}

/** @todo `<SearchInput>` should abstract to a component */
function SearchExample() {
  return (
    <ComponentExamplePanel name="Search">
      <ComponentExampleGroup name="Instant Search">
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon />
          </InputLeftElement>
          <Input placeholder="Search all" />
        </InputGroup>
      </ComponentExampleGroup>
      <ComponentExampleGroup name="2-step Search">
        <InputGroup>
          <Input width={'max(26em, 100%)'} placeholder="Search for a pool or paste AMM ID" />
          <Divider
            orientation="vertical"
            transform="translateX(-40px)"
            height="45%"
            alignSelf="center"
            opacity={0.5}
            borderColor={colors.textTertiary}
          />
          <InputRightElement pointerEvents="none">
            <SearchIcon />
          </InputRightElement>
        </InputGroup>
      </ComponentExampleGroup>
    </ComponentExamplePanel>
  )
}

function ProgressExample() {
  const [value, setValue] = useState(0.4)
  return (
    <ComponentExamplePanel name="Progress">
      <HStack>
        <Progress flexGrow={1} value={value * 100} />
        <Text>{toPercentString(value)}</Text>
      </HStack>
    </ComponentExamplePanel>
  )
}

function MessageStripExample() {
  return (
    <ComponentExamplePanel name="Message strip">
      <Heading fontSize={24}>Warning</Heading>
      <CalloutMessageSlip
        status="warning"
        title="Migrate to new pools"
        desc="We are upgrading the RAY-SOL, RAY-SRM, RAY-USDC and RAY-ETH pools to a new contract. Please migrate to the new pools to keep earning rewards."
        icon={<Farm />}
        actionNode={
          <>
            <Button
              minWidth={120}
              onClick={() => {
                console.log('main btn clicked')
              }}
            >
              Migrate
            </Button>
            <Button
              minWidth={120}
              variant="outline"
              onClick={() => {
                console.log('sub btn clicked')
              }}
            >
              Learn more
            </Button>
          </>
        }
      />
      <Heading fontSize={24}>Info</Heading>
      <CalloutMessageSlip
        title="Create a farm based on the pool you created"
        desc="You can choose to create a farm after creating this pool and providing your position. You can also create a farm based on a previously created pool."
        actionNode={
          <Button
            minWidth={120}
            onClick={() => {
              console.log('main btn clicked')
            }}
          >
            Migrate
          </Button>
        }
      />
      <CalloutMessageSlip
        title="You can create a farm based on the pool you created!"
        desc="You can choose to create a farm after creating this pool and providing your position. You can also create a farm based on a previously created pool."
        actionNode={
          <Button
            minWidth={120}
            onClick={() => {
              console.log('main btn clicked')
            }}
          >
            Got it
          </Button>
        }
      >
        <Checkbox>{`Don't show again`}</Checkbox>
      </CalloutMessageSlip>
    </ComponentExamplePanel>
  )
}

function MessageBoxExample() {
  return (
    <ComponentExamplePanel name="Message Box">
      <MessageBox title="The pool you selected doesn’t exist. Please click the button below to create a new one." status="error" />
      <MessageBox title="The pool you selected doesn’t exist. Please click the button below to create a new one." status="warning" />
    </ComponentExamplePanel>
  )
}

function ToastExample() {
  return (
    <ComponentExamplePanel name="Toast">
      <Button
        onClick={() =>
          toastSubject.next({
            title: 'Swap completed!',
            description: (
              <Box>
                You swapped <span style={{ fontWeight: 700 }}>123,113,123.82 RAY</span> for{' '}
                <span style={{ fontWeight: 700 }}>11,113,123.82 SOL.</span>
              </Box>
            ),
            detail: (
              <Flex align="center" gap={1} opacity={0.5}>
                View transaction details <ExternalLink />
              </Flex>
            ),
            status: 'success',
            isClosable: false,
            duration: 5000
          })
        }
      >
        Swap successfully
      </Button>
      <Button
        onClick={() =>
          toastSubject.next({
            title: 'Swap failed!',
            description: 'Lorem ipsum dolor sit amet.',
            detail: (
              <Flex align="center" gap={1} opacity={0.5}>
                View transaction details <ExternalLink />
              </Flex>
            ),
            status: 'error',
            isClosable: false
          })
        }
      >
        Swap failed
      </Button>
      <Button
        onClick={() =>
          toastSubject.next({
            title: 'Swap confirmed!',
            description: (
              <Box>
                Swap <span style={{ fontWeight: 700 }}>113,123.82 RAY</span> for <span style={{ fontWeight: 700 }}>123.82 SOL.</span>
              </Box>
            ),
            detail: (
              <Flex direction="column" gap={2} mt={5}>
                <ToastTransaction serialNum={1} />
                <ToastTransaction serialNum={2} />
                <ToastTransaction serialNum={3} />
              </Flex>
            ),
            status: 'success',
            isClosable: true
          })
        }
      >
        Swap confirmed
      </Button>
    </ComponentExamplePanel>
  )
}

function TokenInputExample() {
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const [mint, setMint] = useState<string>('')
  const token = tokenMap.get(mint)
  const [amount, setAmount] = useState<string>('')
  return (
    <ComponentExamplePanel name="Token Input">
      <TokenInput token={token} value={amount} onChange={setAmount} onTokenChange={(token) => setMint(token?.address || '')} />
    </ComponentExamplePanel>
  )
}

function SelectorExample() {
  return (
    <ComponentExamplePanel name="Selector">
      <Select items={['hello world', 'item another', 'third option']} value={'hello world'} />
      <Select variant="filledDark" items={['hello world', 'item another', 'third option']} value={'hello world'} />
      <Select variant="roundedFilledDark" items={['hello world', 'item another', 'third option']} value={'hello world'} />
      <Select variant="filledFlowDark" items={['hello world', 'item another', 'third option']} value={'hello world'} />
      <Select variant="roundedFilledFlowDark" items={['hello world', 'item another', 'third option']} value={'hello world'} />
    </ComponentExamplePanel>
  )
}
