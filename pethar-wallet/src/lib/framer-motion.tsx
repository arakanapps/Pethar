import React, { useEffect, useState, forwardRef } from 'react'

export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  initial?: Record<string, any> | boolean | string
  animate?: Record<string, any> | string | any
  exit?: Record<string, any>
  transition?: {
    duration?: number
    delay?: number
    ease?: string | number[]
    type?: string
    stiffness?: number
    damping?: number
    repeat?: number
    repeatType?: string
  }
  variants?: Record<string, any>
  whileHover?: Record<string, any>
  whileTap?: Record<string, any>
  whileInView?: Record<string, any>
  viewport?: { once?: boolean; margin?: string; amount?: number }
  layout?: boolean
  layoutId?: string
}

export type Variants = Record<string, any>

export class AnimationControls {
  current: string = 'normal'
  private listeners = new Set<() => void>()

  start = async (variant: string) => {
    this.current = variant
    this.listeners.forEach((l) => l())
  }
  stop = () => {
    this.current = 'normal'
    this.listeners.forEach((l) => l())
  }
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }
}

export function useAnimation() {
  const [controls] = useState(() => new AnimationControls())
  return controls
}

export const LazyMotion: React.FC<{ children: React.ReactNode; features?: any; strict?: boolean }> = ({ children }) => (
  <>{children}</>
)

export const domMin = {}

export function useReducedMotion() {
  return false
}

function resolveValue(val: any): any {
  if (Array.isArray(val)) {
    return val[val.length - 1]
  }
  return val
}

function buildTransformString(state: Record<string, any> | undefined): string {
  if (!state) return ''
  const parts: string[] = []
  if (state.perspective !== undefined) {
    const v = resolveValue(state.perspective)
    parts.push(`perspective(${typeof v === 'number' ? `${v}px` : v})`)
  }
  if (state.x !== undefined) {
    const v = resolveValue(state.x)
    parts.push(`translateX(${typeof v === 'number' ? `${v}px` : v})`)
  }
  if (state.y !== undefined) {
    const v = resolveValue(state.y)
    parts.push(`translateY(${typeof v === 'number' ? `${v}px` : v})`)
  }
  if (state.z !== undefined) {
    const v = resolveValue(state.z)
    parts.push(`translateZ(${typeof v === 'number' ? `${v}px` : v})`)
  }
  if (state.scale !== undefined) {
    parts.push(`scale(${resolveValue(state.scale)})`)
  }
  if (state.scaleX !== undefined) {
    parts.push(`scaleX(${resolveValue(state.scaleX)})`)
  }
  if (state.scaleY !== undefined) {
    parts.push(`scaleY(${resolveValue(state.scaleY)})`)
  }
  if (state.rotate !== undefined) {
    const v = resolveValue(state.rotate)
    parts.push(`rotate(${typeof v === 'number' ? `${v}deg` : v})`)
  }
  if (state.rotateX !== undefined) {
    const v = resolveValue(state.rotateX)
    parts.push(`rotateX(${typeof v === 'number' ? `${v}deg` : v})`)
  }
  if (state.rotateY !== undefined) {
    const v = resolveValue(state.rotateY)
    parts.push(`rotateY(${typeof v === 'number' ? `${v}deg` : v})`)
  }
  if (state.rotateZ !== undefined) {
    const v = resolveValue(state.rotateZ)
    parts.push(`rotateZ(${typeof v === 'number' ? `${v}deg` : v})`)
  }
  return parts.join(' ')
}

function stateToCssStyle(state: Record<string, any> | undefined): React.CSSProperties {
  if (!state || typeof state !== 'object') return {}
  const style: React.CSSProperties = {}
  const transform = buildTransformString(state)
  if (transform) {
    style.transform = transform
  }
  if (state.opacity !== undefined) style.opacity = resolveValue(state.opacity)
  if (state.height !== undefined) style.height = resolveValue(state.height)
  if (state.width !== undefined) style.width = resolveValue(state.width)
  if (state.backgroundColor !== undefined) style.backgroundColor = resolveValue(state.backgroundColor)
  if (state.borderColor !== undefined) style.borderColor = resolveValue(state.borderColor)
  if (state.boxShadow !== undefined) style.boxShadow = resolveValue(state.boxShadow)
  if (state.filter !== undefined) style.filter = resolveValue(state.filter)
  if (state.strokeDashoffset !== undefined) style.strokeDashoffset = resolveValue(state.strokeDashoffset)
  return style
}

function createMotionComponent<T extends keyof React.JSX.IntrinsicElements>(tag: T) {
  const Component = forwardRef<any, MotionProps & Record<string, any>>((props, ref) => {
    const {
      initial,
      animate,
      exit: _exit,
      transition,
      variants,
      whileHover,
      whileTap,
      whileInView,
      viewport: _viewport,
      layout: _layout,
      layoutId: _layoutId,
      style,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      children,
      ...rest
    } = props

    const [mounted, setMounted] = useState(initial === false)
    const [hovered, setHovered] = useState(false)
    const [tapped, setTapped] = useState(false)
    const [controllerState, setControllerState] = useState(
      animate instanceof AnimationControls
        ? animate.current
        : typeof animate === 'string'
        ? animate
        : 'normal'
    )

    useEffect(() => {
      if (animate instanceof AnimationControls) {
        return animate.subscribe(() => {
          setControllerState(animate.current)
        })
      } else if (typeof animate === 'string') {
        setControllerState(animate)
      }
    }, [animate])

    useEffect(() => {
      if (initial !== false) {
        const raf = requestAnimationFrame(() => {
          setMounted(true)
        })
        return () => cancelAnimationFrame(raf)
      }
    }, [initial])

    const activeVariant =
      variants && controllerState && variants[controllerState]
        ? variants[controllerState]
        : undefined

    const initialVariant =
      typeof initial === 'string' && variants && variants[initial]
        ? variants[initial]
        : typeof initial === 'object'
        ? initial
        : {}

    const targetState = mounted
      ? {
          ...(activeVariant || (typeof animate === 'object' && !(animate instanceof AnimationControls) ? animate : {}) || {}),
          ...(whileInView || {}),
          ...(hovered && whileHover ? whileHover : {}),
          ...(tapped && whileTap ? whileTap : {}),
        }
      : initialVariant

    const duration = transition?.duration ?? 0.45
    const delay = transition?.delay ?? 0
    const computedMotionStyle = stateToCssStyle(targetState)

    const mergedStyle: React.CSSProperties = {
      transitionProperty: 'transform, opacity, background-color, border-color, box-shadow, filter, width, height, stroke-dashoffset',
      transitionDuration: `${duration}s`,
      transitionDelay: `${delay}s`,
      transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      ...style,
      ...computedMotionStyle,
    }

    return React.createElement(
      tag,
      {
        ref,
        style: mergedStyle,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
          if (whileHover) setHovered(true)
          onMouseEnter?.(e)
        },
        onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
          if (whileHover) setHovered(false)
          if (whileTap) setTapped(false)
          onMouseLeave?.(e)
        },
        onMouseDown: (e: React.MouseEvent<HTMLElement>) => {
          if (whileTap) setTapped(true)
          onMouseDown?.(e)
        },
        onMouseUp: (e: React.MouseEvent<HTMLElement>) => {
          if (whileTap) setTapped(false)
          onMouseUp?.(e)
        },
        ...rest,
      },
      children
    )
  })
  Component.displayName = `motion.${String(tag)}`
  return Component
}

export const motion = {
  div: createMotionComponent('div'),
  section: createMotionComponent('section'),
  header: createMotionComponent('header'),
  nav: createMotionComponent('nav'),
  button: createMotionComponent('button'),
  a: createMotionComponent('a'),
  span: createMotionComponent('span'),
  p: createMotionComponent('p'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  ul: createMotionComponent('ul'),
  li: createMotionComponent('li'),
  img: createMotionComponent('img'),
  svg: createMotionComponent('svg'),
  g: createMotionComponent('g'),
  path: createMotionComponent('path'),
  rect: createMotionComponent('rect'),
  circle: createMotionComponent('circle'),
}

export const m = motion

export const AnimatePresence: React.FC<{
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
  initial?: boolean
}> = ({ children }) => {
  return <>{children}</>
}
