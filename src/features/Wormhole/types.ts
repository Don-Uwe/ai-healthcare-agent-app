export type PaletteColor = {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  A100: string
  A200: string
  A400: string
  A700: string
}

export type Theme = {
  primary: PaletteColor
  secondary: PaletteColor
  divider: string
  background: {
    default: string
  }
  text: {
    primary: string
    secondary: string
  }
  error: PaletteColor
  info: PaletteColor
  success: PaletteColor
  warning: PaletteColor
  button: {
    primary: string
    primaryText: string
    disabled: string
    disabledText: string
    action: string
    actionText: string
    hover: string
  }
  options: {
    hover: string
    select: string
  }
  card: {
    background: string
    elevation: string
    secondary: string
  }
  popover: {
    background: string
    elevation: string
    secondary: string
  }
  modal: {
    background: string
  }
  font: {
    primary: string
    header: string
  }
}
