import { CircleCheckForStep } from '@/icons/misc/CircleCheckFill'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { Box, Divider, Flex, HStack, SystemStyleObject, Text, useSteps } from '@chakra-ui/react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'

type StepItem = {
  title: string
  description: string
}

type StepsProps = {
  /** @default 'column-list' */
  variant?: 'column-list' | 'row-title'
  ctrSx?: SystemStyleObject
  steps: StepItem[]
  /** change this will set active step value */
  currentIndex?: number
  onChange?: (step: number) => void
}

export type StepsRef = {
  goTo: (stepIndex: number) => void
  goToNext: () => void
  goToPrevious: () => void
  setActiveStep: (step: number) => void
}

function Steps({ currentIndex, variant, ctrSx, steps, onChange }: StepsProps, ref: React.Ref<StepsRef>) {
  const {
    activeStep: activeStepIndex,
    goToNext,
    goToPrevious,
    isIncompleteStep,
    isCompleteStep,
    setActiveStep
  } = useSteps({
    index: currentIndex,
    count: steps.length
  })

  const activeStep: StepItem | undefined = steps[activeStepIndex]

  useEffect(() => {
    onChange?.(activeStepIndex)
  }, [onChange, activeStepIndex])

  useImperativeHandle(
    ref,
    () => ({
      goTo: setActiveStep,
      goToNext,
      setActiveStep,
      goToPrevious
    }),
    [goToNext, setActiveStep, goToPrevious]
  )

  if (steps.length > 0) {
    return variant === 'row-title' ? (
      <Box>
        <HStack gap={2}>
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex
            const isLast = idx === steps.length - 1
            const isIncomplete = isIncompleteStep(idx)
            const isComplete = isCompleteStep(idx)
            return (
              <>
                <Flex key={`stepper-${idx}`} data-active={isActive} align={'center'}>
                  <Box minW={10} h={10} p="5px" borderRadius="full" border={`1px solid ${isActive ? colors.primary : 'transparent'}`}>
                    {isComplete ? (
                      <CircleCheckForStep width={28} height={28} />
                    ) : (
                      <Flex
                        justify="center"
                        align="center"
                        w="full"
                        h="full"
                        borderRadius="full"
                        bg={isIncomplete ? 'transparent' : colors.stepHoofBg}
                        fontWeight="500"
                        fontSize={'sm'}
                        border={isActive ? 'none' : `1px solid ${colors.textTertiary}`}
                        color={isActive ? colors.backgroundDark : colors.textTertiary}
                      >
                        {idx + 1}
                      </Flex>
                    )}
                  </Box>
                  <Flex pl={2} direction="column" justify="center" gap={1}>
                    <Text
                      fontSize="sm"
                      color={isActive ? colors.textSecondary : colors.textTertiary}
                      lineHeight="normal"
                      whiteSpace={'nowrap'}
                    >
                      {step.title}
                    </Text>
                  </Flex>
                </Flex>
                {!isLast && <Divider my={1} borderRadius={0} orientation="horizontal" h="1px" borderColor={colors.primary} />}
              </>
            )
          })}
        </HStack>
        <Text color={colors.textSecondary} fontWeight={500} align={'center'} pt={2}>
          {activeStep.description}
        </Text>
      </Box>
    ) : (
      <Flex {...panelCard} bg={colors.backgroundLight50} direction="column" borderRadius="20px" overflow="hidden" w="full" sx={ctrSx}>
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex
          const isLast = idx === steps.length - 1
          const isIncomplete = isIncompleteStep(idx)
          const isComplete = isCompleteStep(idx)
          return (
            <Box key={`stepper-${idx}`} position="relative" bg={isActive ? colors.stepActiveBg : undefined} py={7} px={9}>
              <Flex
                className="stpe"
                opacity={isIncomplete ? 0.5 : 1}
                cursor={isIncomplete ? 'default' : 'pointer'}
                onClick={
                  isIncomplete
                    ? undefined
                    : () => {
                        setActiveStep(idx)
                      }
                }
              >
                <Box minW="50px" h="50px" p="5px" borderRadius="25px" border={`1px solid ${isActive ? colors.primary : 'transparent'}`}>
                  {isComplete ? (
                    <CircleCheckForStep />
                  ) : (
                    <Flex
                      justify="center"
                      align="center"
                      w="full"
                      h="full"
                      borderRadius="25px"
                      bg={isIncomplete ? 'transparent' : colors.stepHoofBg}
                      fontWeight="500"
                      border={isActive ? 'none' : `1px solid ${colors.primary}`}
                      color={isActive ? colors.backgroundDark : colors.textSecondary}
                    >
                      {idx + 1}
                    </Flex>
                  )}
                </Box>
                <Flex pl={1} direction="column" justify="center" gap={1}>
                  <Text fontSize="sm" color={colors.textTertiary} fontWeight={500} lineHeight="normal">
                    {step.title}
                  </Text>
                  <Text color={colors.textSecondary} fontWeight={500} lineHeight="normal">
                    {step.description}
                  </Text>
                </Flex>
              </Flex>
              {!isLast && (
                <Box position={'absolute'} zIndex={2}>
                  <Divider ml="25px" mt={2} orientation="vertical" w="1px" h="40px" borderColor={colors.primary} />
                </Box>
              )}
            </Box>
          )
        })}
      </Flex>
    )
  }

  return null
}

export default forwardRef(Steps)
