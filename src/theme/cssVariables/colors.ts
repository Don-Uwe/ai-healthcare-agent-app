export const darkColors: Record<keyof typeof colors, string> = {
  // app main bg color
  primary: '#abc4ff',
  secondary: '#22D1F8',
  secondary10: 'rgba(34, 209, 248, 0.1)',

  // component color
  backgroundDark: '#0b1022',
  backgroundDark50: '#0b102280',
  backgroundMedium: '#161E32',
  backgroundLight: '#1C243E',
  backgroundLight50: '#1C243E88',
  backgroundLight30: '#1C243E4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: '#ECF5FF',
  textSecondary: '#abc4ff',
  textTertiary: '#abc4ff80',
  textRevertPrimary: '#181F35',

  textLink: '#22D1F8',

  /** 🤔 what's this */
  textQuaternary: '#C4D6FF',
  /** 🤔 what's this */
  textQuinary: '#1C243E',
  /** 🤔 what's this */
  textSenary: 'rgba(196, 214, 255, 0.5)',
  /** 🤔 what's this */
  textSeptenary: '#22D1F8',
  /** 🤔 what's this */
  textPurple: '#8C6EEF',
  /** 🤔 what's this */
  textPink: '#FF4EA3',

  // button
  buttonPrimary: '#22D1F8',
  buttonPrimary__01: '#22D1F8',
  buttonPrimary__02: '#39D0D8',
  buttonSolidText: '#0B1022',
  buttonSecondary: '#8C6EEF',

  // switch
  switchOn: '#22D1F8',
  switchOff: '#ABC4FF',

  // select
  selectActive: '#abc4ff',
  selectActiveSecondary: '#22D1F8',
  selectInactive: '#abc4ff1a',

  // chart
  chart01: '#abc4ff',
  chart02: '#39D0D8',
  chart03: '#8C6EEF',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#22D1F8',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#8CA7E8',
  iconEmptyStroke: '#0B1022',

  // success/warning/error/info
  semanticSuccess: '#22D1F8',
  semanticError: '#FF4EA3',
  semanticWarning: '#FED33A',
  semanticNeutral: '#ABC4FF',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-light-opacity)',

  // Step
  stepActiveBg: 'var(--background-light)',
  stepHoofBg: 'var(--primary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#22D1F8',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: '#0D1A3E',

  popoverBg: '#141f3a',

  //customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(255, 255, 255, 0.4)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.12)',

  // input
  inputMask: '#0B102266',

  // customize (by V3 frontend coder)
  backgroundApp: 'linear-gradient(29.71deg, #121C34 -18.98%, #050D17 14.6%, #070A15 56.26%, rgba(9, 14, 29, 0.97) 85.27%)',
  solidButtonBg: 'linear-gradient(272.03deg, #39D0D8 2.63%, #22D1F8 95.31%)',
  outlineButtonBg: 'linear-gradient(272.03deg, rgba(57, 208, 216, 0.1) 2.63%, rgba(34, 209, 248, 0.1) 95.31%)',
  filledProgressBg: 'linear-gradient(270deg, #8C6EEF 0%, #4F53F3 100%)',
  transparentContainerBg: 'linear-gradient(271.31deg, rgba(96, 59, 200, 0.2) 1.47%, rgba(140, 110, 239, 0.12) 100%)',
  modalContainerBg: '#ABC4FF12',
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg, #7748FC 8.17%, #39D0D8 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #0b102280',

  panelCardShadow: '0px 8px 24px rgba(79, 83, 243, 0.12)',
  panelCardBorder: 'unset'
}

export const lightColors: Partial<typeof darkColors> = {
  // app main bg color
  primary: '#abc4ff',
  secondary: '#4F53F3',
  secondary10: 'rgba(34, 209, 248, 0.1)',

  // component color
  backgroundDark: '#EDEDFF',
  backgroundDark50: '#EDEDFF80',
  backgroundMedium: '#EDEDFF',
  backgroundLight: '#F5F8FF',
  backgroundLight50: '#F5F8FF88',
  backgroundLight30: '#F5F8FF4d',
  backgroundTransparent12: 'rgba(171, 196, 255, 0.12)',
  backgroundTransparent07: 'rgba(171, 196, 255, 0.07)',
  backgroundTransparent10: 'rgba(171, 196, 255, 0.1)',

  // text
  textPrimary: '#0B1022',
  textSecondary: '#474ABB',
  textTertiary: '#474ABB99',
  textRevertPrimary: '#ECF5FF',

  textLink: '#22D1F8',

  /** 🤔 what's this */
  textQuaternary: '#C4D6FF',
  /** 🤔 what's this */
  textQuinary: '#1C243E',
  /** 🤔 what's this */
  textSenary: 'rgba(196, 214, 255, 0.5)',
  /** 🤔 what's this */
  textSeptenary: '#22D1F8',
  /** 🤔 what's this */
  textPurple: '#8C6EEF',
  /** 🤔 what's this */
  textPink: '#FF4EA3',

  // button
  buttonPrimary: '#4F53F3',
  buttonPrimary__01: '#4F53F3',
  buttonPrimary__02: '#8C6EEF',
  buttonSolidText: '#ECF5FF',
  buttonSecondary: '#39D0D8',

  // switch
  switchOn: '#8C6EEF',
  switchOff: '#8C6EEF80',

  // select
  selectActive: '#8C6EEF',
  selectActiveSecondary: '#8C6EEF',
  selectInactive: '#abc4ff1a',

  // chart
  chart01: '#abc4ff',
  chart02: '#39D0D8',
  chart03: '#8C6EEF',
  chart04: '#2B6AFF',
  chart05: '#FF7043',
  chart06: '#FED33A',
  chart07: '#4F53F3',
  chart08: '#22D1F8',
  chart09: '#8C6EEF33',

  // Icon
  iconBg: '#8C6EEF',
  iconEmptyStroke: '#ECF5FF',

  // success/warning/error/info
  semanticSuccess: '#39D0D8',
  semanticError: '#FF4EA3',
  semanticWarning: '#B89900',
  semanticNeutral: '#ABC4FF',
  semanticFocus: '#A259FF',
  semanticFocusShadow: '#A259FF33',

  // Tab
  tabFolderTabListBg: 'var(--background-dark)',

  // Step
  stepActiveBg: 'var(--background-dark-opacity)',
  stepHoofBg: 'var(--secondary)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: '#22D1F8',
  priceFloatingDown: '#FF4EA3',
  priceFloatingFlat: '#888888',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: '#fff',

  popoverBg: '#fff',

  //customize (by V3 frontend coder)
  scrollbarThumb: 'rgba(255, 255, 255, 0.4)',

  // badge
  badgePurple: 'rgba(140, 110, 239, 0.5)',
  badgeBlue: 'rgba(34, 209, 248, 0.5)',

  // divider
  dividerBg: 'rgba(171, 196, 255, 0.3)',

  // input
  inputMask: '#fff3',

  // customize (by V3 frontend coder)
  backgroundApp: '#fff',

  solidButtonBg: 'linear-gradient(272deg, #4F53F3 2.63%, #8C6EEF 95.31%)',
  outlineButtonBg: 'linear-gradient(270deg, #8C6EEF1a 0%, #4F53F31a 100%)',
  filledProgressBg: 'linear-gradient(270deg, #8C6EEF 0%, #4F53F3 100%)',
  transparentContainerBg: '#F5F8FF',
  modalContainerBg: '#ABC4FF12',
  /** it's designer's variable name in Figma */
  brandGradient: 'linear-gradient(244deg, #7748FC 8.17%, #39D0D8 101.65%)',
  dividerDashGradient: 'repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)',

  tokenAvatarBg: 'linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #fffe',

  panelCardShadow: 'none',
  panelCardBorder: '1px solid rgba(171, 196, 255, 0.50)'
}
/**
 * note: it is not colors value, but colors css variable
 * color info may change in run-time by setting page, so use runtime css variable
 */
export const colors = {
  // app main bg color
  primary: 'var(--primary)',
  secondary: 'var(--secondary)',
  secondary10: 'var(--secondary10)',

  // component color
  backgroundDark: 'var(--background-dark)',
  backgroundDark50: 'var(--background-dark50)',
  backgroundMedium: 'var(--background-medium)',
  backgroundLight: 'var(--background-light)',
  backgroundLight50: 'var(--background-light50)',
  backgroundLight30: 'var(--background-light30)',
  backgroundTransparent12: 'var(--background-transparent12)',
  backgroundTransparent07: 'var(--background-transparent07)',
  backgroundTransparent10: 'var(--background-transparent10)',

  // text
  /** white */
  textPrimary: 'var(--text-primary)',
  /** #abc4ff */
  textSecondary: 'var(--text-secondary)',
  /** #abc4ff80 */
  textTertiary: 'var(--text-tertiary)',
  textRevertPrimary: 'var(--text-revert-primary)',

  textLink: 'var(--text-link)',

  /** 🤔 what's this */
  textQuaternary: 'var(--text-quaternary)',
  /** 🤔 what's this */
  textQuinary: 'var(--text-quinary)',
  /** 🤔 what's this */
  textSenary: 'var(--text-senary)',
  /** 🤔 what's this */
  textSeptenary: 'var(--text-septenary)',
  /** 🤔 what's this */
  textPurple: 'var(--text-purple)',
  /** 🤔 what's this */
  textPink: 'var(--text-pink)',

  // button
  buttonPrimary: 'var(--button-primary)',
  buttonPrimary__01: 'var(--button-primary__01)',
  buttonPrimary__02: 'var(--button-primary__02)',
  buttonSolidText: 'var(--button-solid-text)',
  buttonSecondary: 'var(--button-secondary)',

  // switch
  switchOn: 'var(--switch-on)',
  switchOff: 'var(--switch-off)',
  selectActive: 'var(--select-active)',
  selectActiveSecondary: 'var(--select-active-secondary)',
  selectInactive: 'var(--select-inactive)',

  // chart
  chart01: 'var(--chart01)',
  chart02: 'var(--chart02)',
  chart03: 'var(--chart03)',
  chart04: 'var(--chart04)',
  chart05: 'var(--chart05)',
  chart06: 'var(--chart06)',
  chart07: 'var(--chart07)',
  chart08: 'var(--chart08)',
  chart09: 'var(--chart09)',

  // Icon
  iconBg: 'var(--icon-bg)',
  iconEmptyStroke: 'var(--icon-empty-stroke)',

  // success/warning/error/info
  semanticSuccess: 'var(--semantic-success)',
  semanticError: 'var(--semantic-error)',
  semanticWarning: 'var(--semantic-warning)',
  semanticNeutral: 'var(--semantic-neutral)',
  semanticFocus: 'var(--semantic-focus)',
  semanticFocusShadow: 'var(--semantic-focus-shadow)',

  // Tab
  tabFolderTabListBg: 'var(--tab-folder-tab-list-bg)',

  // Step
  stepActiveBg: 'var(--step-active-bg)',
  stepHoofBg: 'var(--step-hoof-bg)',

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: 'var(--price-floating-up)',
  priceFloatingDown: 'var(--price-floating-down)',
  priceFloatingFlat: 'var(--price-floating-flat)',

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: 'var(--tooltip-bg)',

  popoverBg: 'var(--popover-bg)',

  //customize component theme (by V3 frontend coder)
  scrollbarThumb: 'var(--scrollbar-thumb)',

  // badge
  badgePurple: 'var(--badge-purple)',
  badgeBlue: 'var(--badge-blue)',

  // divider
  dividerBg: 'var(--divider-bg)',

  // input
  inputMask: 'var(--input-mask)',

  // customize (by V3 frontend coder)
  backgroundApp: 'var(--background-app)',
  solidButtonBg: 'var(--solid-button-bg)',
  outlineButtonBg: 'var(--outline-button-bg)',
  filledProgressBg: 'var(--filled-progress-bg)',
  transparentContainerBg: 'var(--transparent-container-bg)',
  modalContainerBg: 'var(--modal-container-bg)',
  /** it's designer's variable name in Figma */
  brandGradient: 'var(--brand-gradient)',
  dividerDashGradient: 'var(--divider-dash-gradient)',

  tokenAvatarBg: 'var(--token-avatar-bg)',

  panelCardShadow: 'var(--panel-card-shadow)',
  panelCardBorder: 'var(--panel-card-border)'
}
