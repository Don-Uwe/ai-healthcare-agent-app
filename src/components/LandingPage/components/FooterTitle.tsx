import { Box } from '@chakra-ui/react'

export default function FooterTitle({ title }: { title: string }) {
  return (
    <Box color="white" fontSize="14px" lineHeight="18px" fontWeight={400} m={['auto', 0]}>
      {title}
      <Box mt="8.12px" w="24px" h="4px" bg="linear-gradient(90deg, #8C6EEF -3.85%, #39D0D8 111.54%)" />
    </Box>
  )
}
