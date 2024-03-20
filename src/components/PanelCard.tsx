import { panelCard } from '@/theme/cssBlocks'
import { Box, BoxProps } from '@chakra-ui/react'

export interface PanelCardProps extends BoxProps {
  variant?: 'light' | 'dark'
}

/** @deprecated just use block:{@link panelCard} */
export default function PanelCard({ variant = 'dark', ...props }: PanelCardProps) {
  return <Box {...panelCard} display="flex" flexDir="column" {...props} />
}
