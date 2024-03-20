import { Box } from '@chakra-ui/react'

import { colors } from '@/theme/cssVariables'

export default function FooterItem({ children }: { key: string; children: React.ReactNode }) {
  return (
    <Box color={colors.textQuaternary} fontSize="16px" lineHeight="22px" fontWeight={400} style={{ cursor: 'pointer' }}>
      {children}
    </Box>
  )
}
