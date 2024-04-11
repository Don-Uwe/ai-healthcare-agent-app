import { Box, Flex, Heading, ToastId, ToastPosition, UseToastOptions } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import IntervalCircle from '@/components/IntervalCircle'
import CircleCheck from '@/icons/misc/CircleCheck'
import Close from '@/icons/misc/Close'
import ErrorCircle from '@/icons/misc/ErrorCircle'
import WarningCircle from '@/icons/misc/WarningCircle'
import CircleInfo from '@/icons/misc/CircleInfo'
import { colors } from '@/theme/cssVariables'
import { ToastStatus } from '@/types/tx'

const toastDefaultConfig: { duration: number; position: ToastPosition } = {
  duration: 5000,
  position: 'bottom-right'
}

type CustomUseToastOptions = Omit<UseToastOptions, 'status'> & {
  status: ToastStatus
  icon?: React.ReactNode
  detail?: React.ReactNode
  fullWidth?: boolean
}

interface ToasterProps {
  state: CustomUseToastOptions
  id: ToastId
  onClose: () => void
}

export function Toast({ state, onClose }: ToasterProps) {
  const [countDownController, setCountDownController] = useState({
    isCountDown: true,
    remainTime: state.duration ?? toastDefaultConfig.duration,
    endTime: new Date().getTime() + (state.duration ?? 0)
  })
  const customTheme =
    state && state.status === 'error'
      ? {
          mainColor: colors.semanticError,
          icon: <ErrorCircle width={24} height={24} color={colors.semanticError} />
        }
      : state.status === 'warning'
      ? {
          mainColor: colors.semanticWarning,
          icon: <WarningCircle width={24} height={24} color={colors.semanticWarning} />
        }
      : state.status === 'info'
      ? {
          mainColor: colors.semanticNeutral,
          icon: <CircleInfo width={24} height={24} color={colors.semanticNeutral} />
        }
      : {
          mainColor: colors.secondary,
          icon: <CircleCheck width={24} height={24} color={colors.secondary} />
        }

  useEffect(() => {
    setCountDownController({
      isCountDown: true,
      remainTime: state.duration ?? toastDefaultConfig.duration,
      endTime: new Date().getTime() + (state.duration ?? 0)
    })
  }, [state.duration])

  useEffect(() => {
    if (countDownController.isCountDown && countDownController.remainTime) {
      const timeout = setTimeout(() => {
        onClose()
      }, countDownController.remainTime)

      return () => clearTimeout(timeout)
    }
  }, [countDownController.isCountDown, countDownController.remainTime, onClose])

  return (
    <Box
      bg={colors.backgroundLight}
      borderRadius="12px"
      border={`1px solid ${customTheme.mainColor}`}
      py={5}
      px={6}
      maxW={384}
      overflow="hidden"
      position="relative"
      onMouseEnter={() => {
        setCountDownController((p) => ({ ...p, isCountDown: false, remainTime: p.endTime - new Date().getTime() }))
      }}
      onMouseLeave={() => {
        setCountDownController((p) => ({ ...p, isCountDown: true, endTime: new Date().getTime() + p.remainTime! }))
      }}
    >
      {state.isClosable ? (
        <Box style={{ height: 4, position: 'absolute', top: 0, left: 0, right: 0 }}>
          {/* track */}
          <Box style={{ backgroundColor: 'transparent', position: 'absolute', inset: 0 }} />
          {/* remain-line */}
          <Box
            key={state.duration}
            style={{
              backgroundColor: customTheme.mainColor,
              position: 'absolute',
              inset: 0,
              animation: `${state.duration}ms linear 0s 1 normal forwards running shrink`,
              animationPlayState: countDownController.isCountDown ? 'running' : 'paused'
            }}
          />
        </Box>
      ) : null}
      <Flex>
        <Flex direction="column">{state.icon ?? customTheme.icon}</Flex>
        <Flex direction="column" grow={1} justify="center" maxW={state.isClosable ? '90%' : '100%'} gap={2} px={4}>
          <Heading fontSize="md" fontWeight="500" color={colors.textPrimary} lineHeight={6}>
            {state.title}
          </Heading>
          <Box fontSize={14} fontWeight={400} color={colors.textSecondary} textOverflow="ellipsis" whiteSpace="pre-wrap" overflow="hidden">
            {state.description}
          </Box>
          {!state.fullWidth && Boolean(state.detail) && (
            <Box fontSize={12} fontWeight={500} color={colors.textSecondary}>
              {state.detail}
            </Box>
          )}
        </Flex>
        <Flex direction="column">
          {state.isClosable ? (
            <Close style={{ cursor: 'pointer' }} width={12} height={12} onClick={onClose} />
          ) : (
            <IntervalCircle
              strokeWidth={2}
              svgWidth={24}
              duration={state.duration ?? toastDefaultConfig.duration}
              updateDelay={100}
              run={countDownController.isCountDown}
            />
          )}
        </Flex>
      </Flex>
      {state.fullWidth && Boolean(state.detail) && (
        <Box fontSize={12} fontWeight={500} color={colors.textSecondary} mt={2}>
          {state.detail}
        </Box>
      )}
    </Box>
  )
}
