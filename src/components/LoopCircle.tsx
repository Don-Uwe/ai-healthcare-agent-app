import { useState, useEffect, useCallback, MouseEvent } from 'react'
import { CircularProgress } from '@chakra-ui/react'

interface Props {
  replay: number
  onReplay?: () => void
}

export default function LoopCircle({ replay, onReplay }: Props) {
  const [progress, setProgress] = useState(0)

  const reReplayFn = useCallback(() => {
    onReplay?.()
    setProgress(0)
    setTimeout(() => {
      setProgress(100)
    }, 10)
  }, [onReplay])

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault()
      reReplayFn()
    },
    [reReplayFn]
  )

  useEffect(() => {
    setProgress(100)
    const elem = document.querySelector<HTMLElement>('.chakra-progress .chakra-progress__indicator')!
    elem.ontransitionend = function () {
      reReplayFn()
    }
  }, [reReplayFn])

  return (
    <CircularProgress
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        '& .chakra-progress__indicator': {
          transitionDuration: !progress ? '0s' : `${replay}s`
        }
      }}
      value={progress}
    />
  )
}
