import { useColorMode } from '@chakra-ui/react'
import { Global } from '@emotion/react'
import { FC, ReactNode, useMemo } from 'react'

import { colors, darkColors, lightColors, miscSize, sizes } from '@/theme/cssVariables'

function getVariableList(
  lightConfig: Record<string, any>,
  darkConfig: Record<string, any>,
  variableKeyMap: Record<string, string>,
  colorMode: 'light' | 'dark'
): (string | undefined)[] {
  return Object.entries(variableKeyMap).map(([jsKey, cssVariableKey]) => {
    const variableKey = cssVariableKey.match(/^var\((.*?)\)$/)?.[1]
    if (!variableKey) return
    const lightValue = lightConfig[jsKey]
    const darkValue = darkConfig[jsKey]
    return `${variableKey}: ${colorMode === 'light' ? lightValue : darkValue}`
  })
}
const GlobalColorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { colorMode } = useColorMode()
  const colorVariableList = useMemo(() => getVariableList(lightColors, darkColors, colors, colorMode), [colorMode])
  const sizeVariableList = useMemo(() => getVariableList(miscSize, miscSize, sizes, colorMode), [colorMode])
  return (
    <>
      {/* through object's styles's global can't inject multi font-face */}
      <Global
        styles={`
          :root {
            font-size: 16px;
            ${colorVariableList.join(';')};
            ${sizeVariableList.join(';')}
          }
        `}
      />
      {children}
    </>
  )
}

export default GlobalColorProvider
