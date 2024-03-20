import { extendTheme, ThemeConfig } from '@chakra-ui/react'

import { Alert } from './components/Alert'
import { Avatar } from './components/Avatar'
import { Badge } from './components/Badge'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { Checkbox } from './components/Checkbox'
import { dividerTheme } from './components/Divider'
import { Drawer } from './components/Drawer'
import { FormLabel } from './components/FormLabel'
import { Input } from './components/Input'
import { Link } from './components/Link'
import { Menu } from './components/Menu'
import { Modal } from './components/Modal'
import { NumberInput } from './components/NumberInput'
import { Popover } from './components/Popover'
import { Progress } from './components/Progress'
import { Slider } from './components/Slider'
import { Stepper } from './components/Stepper'
import { Spinner } from './components/Spinner'
import { Switch } from './components/Switch'
import { Table } from './components/Table'
import { Tabs } from './components/Tabs'
import { Tag } from './components/Tag'
import { Text } from './components/Text'
import { Tooltip } from './components/Tooltip'
import { breakpoints } from './foundations/breakpoints'
import { radii } from './foundations/radii'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
}

export const theme = extendTheme({
  // colors: lightTheme.colors,
  config,
  // styles,
  radii,
  breakpoints,

  components: {
    Divider: dividerTheme,
    Avatar,
    Link,
    Button,
    Modal,
    Drawer,
    Input,
    NumberInput,
    Tabs,
    Checkbox,
    Menu,
    Alert,
    Slider,
    Card,
    Tooltip,
    Switch,
    Stepper,
    FormLabel,
    Progress,
    Table,
    Popover,
    Badge,
    Tag,
    Spinner,
    Text
  }
})
