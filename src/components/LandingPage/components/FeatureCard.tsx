import { Box, Center, Fade, Flex, useDisclosure } from '@chakra-ui/react'

import Button from '@/components/Button'
import { colors } from '@/theme/cssVariables'

import fig from '../images/feature-card-fig.png'

interface FeatureCardProps {
  title: string
  desc: string
  link: string
  linkTitle: string
}

export default function FeatureCard({ title, desc, link, linkTitle }: FeatureCardProps) {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Box
      maxW="373px"
      h="200px"
      bg={'rgba(255, 255, 255, 0.07)'}
      borderRadius="8px"
      p="40.25px 28px 59.12px 28px"
      position="relative"
      onMouseEnter={onToggle}
      onMouseLeave={onToggle}
    >
      <Box zIndex={1}>
        <Flex gap="19px">
          <img src={fig.src} />
          <Flex direction="column" justify="space-between" align="center">
            <Center flex={1} textAlign="center" color="white" fontSize="1.25rem" lineHeight="1.625rem" fontWeight="500">
              {title}
            </Center>
            <Center flex={1} textAlign="center" color={colors.textQuaternary} fontSize="0.875rem" lineHeight="1rem" fontWeight="300">
              {desc}
            </Center>
          </Flex>
        </Flex>
      </Box>
      <Fade in={isOpen}>
        <Box zIndex={2} bg="rgba(31, 35, 57, 0.9)" borderRadius="8px" position="absolute" top={0} left={0} w="100%" h="100%">
          <Center h="100%">
            <Button m="auto">{linkTitle}</Button>
          </Center>
        </Box>
      </Fade>
    </Box>
  )
}
