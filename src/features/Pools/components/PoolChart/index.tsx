import Tabs from '@/components/Tabs'
import useFetchPoolChartData from '@/hooks/pool/useFetchPoolChartData'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { ReactNode, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Chart from './Chart'
import { TimeType, availableTimeType } from './const'

export default function PoolChartModal<T extends string>({
  poolAddress,
  baseMint,
  isOpen,
  onClose,
  renderModalHeader,
  categories
}: {
  poolAddress: string | undefined
  baseMint?: string
  isOpen: boolean

  /** it base on provided chartData */
  categories: { label: string; value: T }[]
  renderModalHeader?: ((utils: { isOpen?: boolean }) => ReactNode) | ReactNode
  onClose?: () => void
}) {
  const { t } = useTranslation()

  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose ?? (() => {})}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{shrinkToValue(renderModalHeader, [{ isOpen }])}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <ChartWindow poolAddress={poolAddress} baseMint={baseMint} categories={categories} />
        </ModalBody>

        <ModalFooter justifyContent="center">
          <Button minW="132px" mt={2} onClick={onClose}>
            {t('button.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/** used in mobile  */
export function ChartWindow<T extends string>({
  poolAddress,
  baseMint,
  categories
}: {
  poolAddress?: string
  baseMint?: string
  /** it base on provided chartData */
  categories: { label: string; value: T }[]
}) {
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentCategory, setCurrentCategory] = useState<T>(categories[0].value)
  const currentCategoryLabel = useMemo(() => categories.find((c) => c.value === currentCategory)?.label ?? '', [currentCategory])
  const [currentTimeType, setCurrentTimeType] = useState<TimeType>(availableTimeType[0])
  const { data, isLoading, isEmptyResult } = useFetchPoolChartData({
    category: currentCategory === 'liquidity' ? 'liquidity' : 'volume',
    poolAddress,
    baseMint,
    timeType: currentTimeType
  })
  if (isMobile && isEmptyResult) return null
  return (
    <Chart<typeof data[0]>
      isEmpty={isEmptyResult}
      isActionRunning={isLoading}
      data={data}
      currentCategoryLabel={currentCategoryLabel}
      xKey="time"
      yKey="v"
      renderTimeTypeTabs={
        <Tabs
          visibility={currentCategory === 'volume' ? 'visible' : 'hidden'}
          pointerEvents={currentCategory === 'volume' ? 'auto' : 'none'}
          size={['sm', 'sm']}
          variant="square"
          items={availableTimeType}
          defaultValue={currentTimeType}
          onChange={(value) => {
            setCurrentTimeType(value)
          }}
          ml="auto"
        />
      }
      renderTabs={
        <Tabs
          size={['sm', 'md']}
          variant={isMobile ? 'square' : 'squarePanel'}
          items={categories}
          defaultValue={currentCategory}
          onChange={(value) => {
            setCurrentCategory(value)
          }}
          my={2}
          sx={{ bg: isMobile ? 'transparent' : colors.backgroundDark }}
        />
      }
    />
  )
}
