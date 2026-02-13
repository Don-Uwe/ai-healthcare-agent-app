// Reexport the native module. On web, it will be resolved to AudioModule.web.ts
// and on native platforms to AudioModule.ts
export { default } from './src/AudioModule';
export { default as AudioModuleView } from './src/AudioModuleView';
export * from  './src/AudioModule.types';
