import { Box, HStack, useRadio, useRadioGroup, UseRadioProps } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

function RadioItem(props: UseRadioProps & { children: React.ReactNode }) {
  const { getInputProps, getCheckboxProps } = useRadio(props)

  const input = getInputProps()
  const checkbox = getCheckboxProps()

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderRadius="md"
        fontWeight="medium"
        color={'rgba(171, 196, 255,.5)'}
        _checked={{
          bg: 'rgba(171, 196, 255, 0.12)',
          color: colors.textSecondary
        }}
        px={2}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  )
}

interface RadioProps<T extends string> {
  items: T[]
  defaultValue?: T
  onChange?: (value: T) => void
}

export default function RadioTabs<T extends string>({ items, defaultValue, onChange }: RadioProps<T>) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'radio-group',
    defaultValue: defaultValue ?? items[0],
    onChange
  })

  const group = getRootProps()

  return (
    <HStack {...group}>
      {items.map((value) => {
        const radio = getRadioProps({ value })
        return (
          <RadioItem key={value} {...radio}>
            {value}
          </RadioItem>
        )
      })}
    </HStack>
  )
}
