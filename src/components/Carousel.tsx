import { Box, Flex, useBoolean } from '@chakra-ui/react'
import { throttle } from 'lodash'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import ChevronRightIcon from '@/icons/misc/ChevronRightIcon'
import { colors } from '@/theme/cssVariables'

interface CarouselProps {
  children: React.ReactNode[]
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const [isHover, setHover] = useBoolean()
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const containerWidth = containerRef.current?.offsetWidth
    const scrollLeft = containerRef.current?.scrollLeft
    if (containerWidth && scrollLeft !== undefined) {
      const newIndex = Math.round(scrollLeft / containerWidth)
      setCurrentIndex(newIndex)
    }
  }

  const handleDotClick = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: index * containerRef.current.offsetWidth,
        behavior: 'smooth'
      })
    }
  }

  const handleKeyDownArrowClick = useCallback(
    (input: KeyboardEvent | 'ArrowRight' | 'ArrowLeft') => {
      const inputDirection = input instanceof KeyboardEvent ? input.key : input
      if (!containerRef.current || (inputDirection !== 'ArrowRight' && inputDirection !== 'ArrowLeft')) return
      const newIndex =
        inputDirection === 'ArrowRight'
          ? currentIndex + 1 === children.length
            ? children.length - 1
            : currentIndex + 1
          : currentIndex - 1 < 0
          ? 0
          : currentIndex - 1

      containerRef.current.scrollTo({
        left: newIndex * containerRef.current.offsetWidth,
        behavior: 'smooth'
      })
    },
    [children.length, currentIndex]
  )

  const handleMouseWheel = throttle(
    (event: WheelEvent) => {
      if (event.deltaY !== 0 && containerRef.current) {
        const left = containerRef.current.scrollLeft + event.deltaY * 50
        containerRef.current.scrollTo({
          left,
          behavior: 'smooth'
        })
      }
    },
    200,
    { leading: true }
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownArrowClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDownArrowClick)
    }
  }, [handleKeyDownArrowClick])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleMouseWheel)
      container
      return () => {
        container.removeEventListener('wheel', handleMouseWheel)
      }
    }
  }, [handleMouseWheel])

  return (
    <Flex direction="column" alignItems="center" justifyContent="center">
      <Box
        ref={containerRef}
        position="relative"
        width="100%"
        overflowX="scroll"
        css={{
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }}
        onScroll={handleScroll}
        onMouseEnter={setHover.on}
        onMouseLeave={setHover.off}
      >
        <Flex width={`${children.length * 100}%`} css={{ scrollSnapAlign: 'start' }}>
          {children.map((child, index) => (
            <Box key={index} width={`${100 / children.length}%`} display="inline-block" css={{ scrollSnapAlign: 'start' }}>
              {child}
            </Box>
          ))}
        </Flex>
      </Box>
      {children.length > 1 && (
        <Flex mt="10px" alignItems="center">
          <Box mr="10px" css={{ cursor: 'pointer' }}>
            <ChevronLeftIcon
              color={isHover ? 'rgba(171, 196, 255, 0.5)' : 'rgba(171, 196, 255, 0.12)'}
              onMouseEnter={setHover.on}
              onMouseLeave={setHover.off}
              onClick={() => handleKeyDownArrowClick('ArrowLeft')}
              style={{ transition: 'color 0.3s ease' }}
            />
          </Box>
          {children.map((_, index) => (
            <Box
              cursor="pointer"
              key={index}
              w="2"
              h="2"
              rounded="full"
              bg={index === currentIndex ? 'rgba(171, 196, 255, 0.5)' : colors.backgroundDark}
              ml={index === 0 ? 0 : 2}
              onClick={() => handleDotClick(index)}
            />
          ))}
          <Box ml="10px" css={{ cursor: 'pointer' }}>
            <ChevronRightIcon
              color={isHover ? 'rgba(171, 196, 255, 0.5)' : 'rgba(171, 196, 255, 0.12)'}
              onMouseEnter={setHover.on}
              onMouseLeave={setHover.off}
              onClick={() => handleKeyDownArrowClick('ArrowRight')}
              style={{ transition: 'color 0.3s ease' }}
            />
          </Box>
        </Flex>
      )}
    </Flex>
  )
}

export default Carousel
