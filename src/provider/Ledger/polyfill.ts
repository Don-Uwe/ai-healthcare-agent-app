import { Buffer } from 'buffer'

if (typeof window !== 'undefined' && window.Buffer === undefined) {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(window as any).Buffer = Buffer
}

export {}
