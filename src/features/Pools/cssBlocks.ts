import { SystemStyleObject } from '@chakra-ui/react'

export const poolListGrid: SystemStyleObject = {
  display: 'grid',
  gridTemplateColumns: [
    '1.4fr .7fr .8fr',
    'minmax(0, 1.7fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.2fr) minmax(140px, 1fr)'
  ],
  columnGap: ['max(1rem, 2%)', 'max(1rem, 3%)'],
  alignItems: 'center'
}
