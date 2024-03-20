import { ComponentProps, Fragment, isValidElement, ReactElement, ReactNode } from 'react'
import { isArray } from '../judges/judgeType'

type ReactComponent = (...params: any[]) => ReactElement | null

function isSpawnByTargetComponent(item: ReactElement, targetComponent: ReactComponent) {
  const isDirectSpawner = item.type === targetComponent
  if (isDirectSpawner) return true
  const composers = (item.type as any)?.composedBy as ReactComponent | ReactComponent[] | undefined
  const isSpawnerOfComposers = isArray(composers) ? composers.includes(targetComponent) : composers === targetComponent
  if (isSpawnerOfComposers) return true
  return false
}

function findTargetChild(children: ReactNode[], targetComponent: ReactComponent): ReactNode | undefined {
  if (!children.length) return
  const matched = children.find((item) => isValidElement(item) && isSpawnByTargetComponent(item, targetComponent))
  return (
    matched ||
    findTargetChild(children.flatMap((child) => isValidElement(child) && (child.props as any).children).filter(Boolean), targetComponent)
  )
}

// TODO not quite well for type intellisense
/**
 * @example
 * (props.children, _DrawerMask) => child(ReactComonent) // extract the target element in Children
 */
export function pickReactChild<T extends ReactComponent>(
  children: ReactNode,
  targetComponent: T,
  mapItem: (item: JSX.Element) => JSX.Element = (i) => i
): ReturnType<T> | undefined {
  const targetChild = findTargetChild([children].flat().filter(isValidElement), targetComponent)
  // @ts-expect-error force type
  return targetChild ? mapItem(targetChild) : undefined
}

export function pickReactChildProps<T extends ReactComponent>(children: ReactNode, targetComponent: T): ComponentProps<T> | undefined {
  return [children]
    .flat(Infinity)
    .flatMap((child) => (isValidElement(child) && child.type === Fragment ? (child.props as any).children ?? [] : child))
    .find((item) => isValidElement(item) && item.type === targetComponent)?.props
}

/**
 * @example
 * (props.children, _DrawerMask) => child(ReactComonent)[] // extract the target element in Children
 */
export function pickReactChildren<T extends ReactComponent>(
  children: ReactNode,
  targetComponent: T,
  mapItem: (item: JSX.Element, idx: number) => JSX.Element = (i) => i
): ReturnType<T>[] {
  return [children]
    .flat()
    .flatMap((child) => (isValidElement(child) && child.type === Fragment ? (child.props as any).children ?? [] : child))
    .filter((item) => isValidElement(item) && item.type === targetComponent)
    .map(mapItem as any)
}
