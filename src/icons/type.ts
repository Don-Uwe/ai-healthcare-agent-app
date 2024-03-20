import { SVGProps } from 'react'
import { BoxProps } from '@chakra-ui/react'

export type SvgIcon = SVGProps<SVGSVGElement> & BoxProps & Omit<React.SVGProps<SVGElement>, keyof BoxProps>
