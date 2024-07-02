import { tabsAnatomy } from '@chakra-ui/anatomy'
import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)

const baseStyle = definePartsStyle({
  root: {
    position: 'relative'
  },
  tab: {
    position: 'relative',
    color: colors.textSecondary,
    _selected: {
      color: colors.textPrimary,
      backgroundColor: 'transparent'
    },
    transition: '150ms',
    border: 'none !important'
  },
  tablist: {
    position: 'relative',
    border: 'none',
    borderBottom: 'none'
  },
  indicator: {
    transitionDuration: '300ms !important',
    bg: colors.textSecondary
  }
})

const squareStyle = definePartsStyle(() => {
  return {
    root: {
      position: 'relative'
    },
    tab: {
      color: 'rgba(171, 196, 255,.5)',
      fontWeight: '500',
      _selected: {
        color: colors.textSecondary
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative',
      border: 'none !important'
    },
    indicator: {
      zIndex: '1',
      h: '100%',
      bg: 'rgba(171, 196, 255, 0.12)',
      borderRadius: ['6px', 'md']
    }
  }
})

const lineStyle = definePartsStyle(() => {
  return {
    root: {
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      _selected: {
        color: colors.textPrimary
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative',
      border: 'none !important',
      borderBottom: 'none'
    },
    indicator: {
      bottom: '1px',
      bgGradient: colors.brandGradient,
      height: '3px',
      borderRadius: 'md'
    }
  }
})

const squarePanelStyle = definePartsStyle(() => {
  return {
    root: {
      bg: colors.backgroundTransparent12,
      borderRadius: '8px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      fontWeight: '500',
      _selected: {
        color: colors.textPrimary,
        fontWeight: 'medium'
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative'
    },
    indicator: {
      zIndex: '1',
      h: '100%',
      bg: colors.backgroundTransparent12,
      borderRadius: 'md'
    }
  }
})

const squarePanelDarkStyle = definePartsStyle(() => {
  return {
    root: {
      bg: colors.backgroundDark,
      borderRadius: '8px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      opacity: '0.5',
      fontWeight: '500',
      _selected: {
        color: colors.textSecondary,
        opacity: 1,
        fontWeight: 'medium'
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative'
    },
    indicator: {
      zIndex: '1',
      h: '100%',
      bg: colors.backgroundTransparent12,
      borderRadius: 'md'
    }
  }
})

const roundedStyle = definePartsStyle((props) => {
  const { colorMode } = props // extract colorScheme from component props
  const isLight = colorMode === 'light'
  return {
    root: {
      bg: colors.backgroundTransparent12,
      borderRadius: '27px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      fontWeight: '500',
      _selected: {
        fontWeight: '500',
        color: colors.textRevertPrimary
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative'
    },
    indicator: {
      zIndex: '1',
      h: '100%',
      bg: isLight ? colors.solidButtonBg : colors.brandGradient,
      borderRadius: '27px'
    }
  }
})

const roundedLightStyle = definePartsStyle((props) => {
  const { colorScheme: c } = props // extract colorScheme from component props

  return {
    root: {
      bg: colors.backgroundLight,
      borderRadius: '8px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.secondary,
      fontWeight: '500',
      px: '8px',
      _selected: {
        fontWeight: '500',
        color: colors.secondary
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative'
    },
    indicator: {
      zIndex: '0',
      h: '100%',
      bg: colors.backgroundDark,
      borderRadius: '8px'
    }
  }
})

const folderStyle = definePartsStyle({
  tab: {
    color: colors.textSecondary,
    fontWeight: '400',
    bg: 'transparent',
    py: '12px',
    px: '3%',
    mx: '3%',
    transitionDuration: '0ms',
    _selected: {
      fontWeight: '500',
      color: colors.textPrimary,
      bg: colors.backgroundLight,
      // borderRadius: '10px 10px 0px 0px',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        left: '-20px',
        width: '36px',
        background: 'inherit',
        borderRadius: '10px 0px 0px 0px',
        transform: 'skew(335deg)'
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '0px',
        bottom: '0px',
        right: '-20px',
        width: '36px',
        background: 'inherit',
        borderRadius: '0px 10px 0px 0px',
        transform: 'skew(25deg)'
      }
    }
  },
  indicator: { bottom: '2px', bgGradient: colors.brandGradient, height: '2px', borderRadius: 'md', transform: 'scaleX(0.2)' },
  tablist: {
    bg: colors.tabFolderTabListBg
  }
})

const roundedPlainStyle = definePartsStyle(() => {
  return {
    root: {
      bg: colors.backgroundTransparent12,
      borderRadius: '43px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      fontWeight: '500',
      opacity: '.5',
      _selected: {
        fontWeight: '500',
        color: colors.textSecondary,
        opacity: '1'
      }
    },
    tablist: {
      px: '8px'
    }
  }
})

const roundedSwitchStyle = definePartsStyle(() => {
  return {
    root: {
      bg: colors.backgroundTransparent12,
      borderRadius: '27px',
      p: '4px',
      position: 'relative'
    },
    tab: {
      color: colors.textSecondary,
      fontWeight: '500',
      _selected: {
        fontWeight: '500'
      },
      zIndex: '2'
    },
    tablist: {
      position: 'relative'
    },
    indicator: {
      zIndex: '1',
      h: '100%',
      bg: colors.switchOn,
      borderRadius: '27px'
    }
  }
})

const xsSizeStyle = definePartsStyle({
  tab: {
    px: '4px',
    py: '2px',
    fontSize: 'xs'
  }
})

const smSizeStyle = definePartsStyle({
  tab: {
    px: '4px',
    py: '2px',
    fontSize: 'sm'
  }
})

const mdSizeStyle = definePartsStyle({
  tab: {
    px: '16px',
    py: '4px',
    fontSize: 'md'
  }
})

const lgSizeStyle = definePartsStyle({
  tab: {
    px: '16px',
    py: '6px',
    fontSize: 'lg'
  }
})
const xlSizeStyle = definePartsStyle({
  tab: {
    px: '16px',
    py: '6px',
    fontSize: 'xl'
  }
})

export const Tabs = defineMultiStyleConfig({
  baseStyle,
  sizes: { xs: xsSizeStyle, sm: smSizeStyle, md: mdSizeStyle, lg: lgSizeStyle, xl: xlSizeStyle },
  defaultProps: { variant: 'line', size: 'sm' },
  variants: {
    line: lineStyle,
    square: squareStyle,
    squarePanel: squarePanelStyle,
    squarePanelDark: squarePanelDarkStyle,
    rounded: roundedStyle,
    folder: folderStyle,
    roundedLight: roundedLightStyle,
    roundedPlain: roundedPlainStyle,
    roundedSwitch: roundedSwitchStyle
  }
})
