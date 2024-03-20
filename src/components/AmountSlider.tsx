import { useSyncSignal } from '@/hooks/useSyncSignalState'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { Box, BoxProps, Button, HStack, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text } from '@chakra-ui/react'
import { ReactNode, RefObject, useEffect, useState, useImperativeHandle } from 'react'
import { Menu } from 'react-feather'
import { useTranslation } from 'react-i18next'

export type AmountSliderProps = {
  percent?: number
  actionRef?: RefObject<{ changeValue: (val: number) => void }>

  // size?: 'sm' /* used in mobile */ | 'md' /** used in PC */

  /** see chakra's <Slider>'s prop:isDisabled */
  isDisabled?: boolean
  renderTopLeftLabel?: () => ReactNode
  // renderTopLeftPercent?: () => ReactNode
  onChange?: (percent: number) => void
  // will change on progress, very frequently
  onHotChange?: (percent: number) => void
} & Omit<BoxProps, 'onChange'>

export default function AmountSlider({
  percent: inputPercent = 0,
  actionRef,
  isDisabled,
  renderTopLeftLabel: _renderTopLeftLabel,
  onChange,
  onHotChange,
  ...restBoxProps
}: AmountSliderProps) {
  const { t } = useTranslation()
  const renderTopLeftLabel = _renderTopLeftLabel ?? (() => t('common.amount'))
  const sizes = {
    percentValueText: ['2xl', '3xl'],
    topLeftLabel: ['sm', 'md'],
    topLeftLabelAndPercentSpace: [2, 6],
    buttonSpace: [2, 4]
  }
  const [percent, setPercent] = useSyncSignal({
    outsideValue: inputPercent ?? 0,
    onChange: (val) => {
      onChange?.(val)
    }
  })
  const [hotPercent, setHotPercent] = useState(percent)
  useEffect(() => {
    onHotChange?.(hotPercent)
  }, [hotPercent])
  useEffect(() => {
    setHotPercent?.(inputPercent)
  }, [inputPercent])

  useImperativeHandle(actionRef, () => ({
    changeValue: setHotPercent
  }))

  return (
    <Box {...restBoxProps}>
      <HStack justify="space-between">
        <HStack spacing={sizes.topLeftLabelAndPercentSpace}>
          <Text color={colors.textPrimary} fontSize={sizes.topLeftLabel}>
            {renderTopLeftLabel()}
          </Text>
          <Text color={colors.textPrimary} fontSize={sizes.percentValueText} fontWeight={500}>
            {toPercentString(hotPercent, { decimals: 0, alreadyPercented: true })}
          </Text>
        </HStack>

        <HStack spacing={sizes.buttonSpace}>
          <Button
            variant="rect-rounded-radio"
            size="xs"
            isDisabled={isDisabled}
            onClick={() => {
              setHotPercent(25)
              setPercent(25)
            }}
          >
            25%
          </Button>
          <Button
            variant="rect-rounded-radio"
            size="xs"
            isDisabled={isDisabled}
            onClick={() => {
              setHotPercent(50)
              setPercent(50)
            }}
          >
            50%
          </Button>
          <Button
            variant="rect-rounded-radio"
            size="xs"
            isDisabled={isDisabled}
            onClick={() => {
              setHotPercent(75)
              setPercent(75)
            }}
          >
            75%
          </Button>
          <Button
            variant="rect-rounded-radio"
            size="xs"
            isDisabled={isDisabled}
            onClick={() => {
              setHotPercent(100)
              setPercent(100)
            }}
          >
            100%
          </Button>
        </HStack>
      </HStack>
      {/* <Box paddingX={0}> */}
      <Box paddingX={3}>
        <Slider
          focusThumbOnChange={false}
          value={hotPercent}
          isDisabled={isDisabled}
          onChange={(percent) => {
            setHotPercent(percent)
          }}
          onChangeEnd={(percent) => setPercent(percent)}
        >
          {/* <SliderMark value={0} sx={{ '--tx': '-0%' }}>
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
      </SliderMark> */}

          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb>
            <Menu width={'12px'} height={'12px'} color={colors.backgroundDark}></Menu>
          </SliderThumb>
        </Slider>
      </Box>
    </Box>
  )
}
