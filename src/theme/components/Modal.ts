import { modalAnatomy } from '@chakra-ui/anatomy'
import { Modal as _Modal, createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { colors } from '../cssVariables'

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(modalAnatomy.keys)
const baseStyle = definePartsStyle({
  closeButton: {
    top: ['24px', '28px'],
    right: ['24px', '32px'],
    width: '2em',
    height: '2em',
    color: colors.textSecondary
  },
  dialog: {
    bg: colors.backgroundLight,
    paddingInline: ['20px', '24px'],
    paddingBlock: '18px',
    borderRadius: ['20px', '12px'],
    maxHeight: ['95%', '90%']
  },
  body: {
    padding: '0',
    overflow: 'auto'
  },
  header: {
    padding: '0px',
    marginTop: ['4px', '10px'],
    marginBottom: ['16px', '18px'],
    fontSize: ['lg', 'xl'],
    fontWeight: 500
  },
  footer: {
    padding: '0px'
  }
})

const sm = definePartsStyle({ dialog: { width: 'min(300px, 90vw)' } })
const md = definePartsStyle({ dialog: { width: 'min(464px, 90vw)' } })
const lg = definePartsStyle({ dialog: { width: 'min(674px, 90vw)' }, closeButton: { top: ['24px', '28px'] } })
const xl = definePartsStyle({
  closeButton: {
    top: ['24px', '32px'],
    right: ['24px', '32px'],
    transform: 'scale(1.3)'
  },
  dialog: {
    width: 'min(674px, 90vw)',
    height: ['100%', 'auto']
  },
  header: { marginTop: ['4px', '10px'], marginBottom: ['16px', '18px'] }
})
const _2xl = definePartsStyle({ dialog: { width: 'min(624px, 90vw)' } })
const _3xl = definePartsStyle({ dialog: { width: 'min(720px, 90vw)' } })
const mobileFullPage = definePartsStyle({
  dialog: {
    width: ['100vw', 'min(464px, 90vw)' /*  */],
    maxWidth: 'unset',
    height: ['100%', 'unset'],
    maxHeight: ['100%', '80%'],
    borderRadius: ['0', '12px']
  }
})

export const Modal = defineMultiStyleConfig({
  baseStyle,
  variants: { mobileFullPage },
  sizes: { sm, md, lg, xl, '2xl': _2xl, '3xl': _3xl }
})

_Modal.defaultProps = { isCentered: true }
