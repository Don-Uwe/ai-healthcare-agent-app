export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  },
};
