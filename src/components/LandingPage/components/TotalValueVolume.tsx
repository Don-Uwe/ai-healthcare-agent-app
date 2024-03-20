import { Box, Flex, Text } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

export default function TotalValueVolume() {
  return (
    <Flex flexWrap="wrap" className="tvl" gap={117}>
      <ValueDisplay title="Total Value Locked" value={56258920}></ValueDisplay>
      <ValueDisplay title="Total 24hr Volume" value={51872736492}></ValueDisplay>
    </Flex>
  )
}

function ValueDisplay({ title, value }: { title: string; value: number }) {
  return (
    <Box>
      <Box lineHeight="2rem" color={colors.semanticNeutral} fontSize={'1.5rem'} mb="10px">
        {title}
      </Box>
      <Text
        bgGradient="linear(270.87deg, #8C6EEF 0.41%, #ABC4FF 97.12%)"
        bgClip="text"
        fontWeight="800"
        lineHeight="5.125rem"
        fontSize="3.75rem"
        fontFamily="Avenir"
        fontStyle="italic"
        pr="3px"
        wordBreak="break-all"
      >
        $ {value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      </Text>
    </Box>
  )
}
