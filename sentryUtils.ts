import { ErrorEvent, EventHint } from '@sentry/nextjs'

export function beforeSend(event: ErrorEvent, hint: EventHint) {
  let sampleRate = 1

  if (hint && hint.originalException) {
    const error = hint.originalException as any
    const errMsg = (error.stack || '').toLocaleLowerCase()
    if (error) {
      if (
        errMsg.includes('ethereum') || // wallet connect
        errMsg.includes('minified react error') || // no meaning minified ssr hint
        errMsg.includes('please call connect() before request()') || // wallet connect
        errMsg.includes('database') || // wallet connect
        errMsg.includes('idbdatabase') || // wallet connect
        errMsg.includes('walletconnect') || // wallet connect
        errMsg.includes('fldfpgipfncgndfolcbkdeeknbbbnhcc') || // mytonwallet extension
        errMsg.includes('Attempting to use a disconnected port object') || // extension
        errMsg.includes('hydration') || // Hydration Errors
        errMsg.includes('hydrating') // Hydration Errors
      )
        sampleRate = 0.01
      else if (
        errMsg.includes('timeout') ||
        errMsg.includes('network error') ||
        errMsg.includes('no internet connection detected') ||
        errMsg.includes('cancel rendering route') ||
        errMsg.includes('java') ||
        errMsg.includes('the quota has been exceeded')
      )
        sampleRate = 0.05
      else if (
        errMsg.includes('failed with status code 401') // extension
      )
        sampleRate = 0.1
    }
  }

  if (Math.random() <= sampleRate) {
    return event
  } else {
    return null
  }
}

export function beforeSendSpan(span: any) {
  let sampleRate = 1
  // Do not sample health checks ever
  if (!span.description || span.description.indexOf('tiplink') > -1 || span.description.indexOf('walletconnect') > -1) {
    sampleRate = 0.01
  }

  if (Math.random() <= sampleRate) {
    return span
  } else {
    return null
  }
}
