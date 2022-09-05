import type { FC, PropsWithChildren } from 'react'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  components: {
    Avatar: {
      defaultProps: {
        variant: 'sm', // default is solid
        colorScheme: 'green' // default is gray
      }
    }
  }
})
const ThemeProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>
}

export default ThemeProvider
