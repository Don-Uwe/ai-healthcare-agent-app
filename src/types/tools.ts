export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[] ? ElementType : never

export type Unpacked<T> = T extends (infer U)[] ? U : T

export type Primitive = boolean | number | string | bigint

export type AnyFn = (...args: any[]) => any
export type AnyObj = { [key: string]: any }
export type AnyArr = any[]

export type MayFunction<T, Params extends any[] = []> = T | ((...params: Params) => T)
export type MayPromise<T> = T | Promise<T>
export type MayArray<T> = T | T[]
export type DeMayArray<T extends MayArray<any>> = T extends any[] ? T[number] : T

export type NotFunctionValue = Exclude<any, AnyFn>

export type ExtendProps<Main, Old> = Omit<Old, keyof Main> & Main
