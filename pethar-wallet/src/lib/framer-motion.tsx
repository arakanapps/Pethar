import React, { useEffect, useState, forwardRef } from 'react'

export interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  initial?: Record<string, any> | boolean
  animate?: Record<string, any>
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
  whileHover?: Record<string, any>
  whileTap?: Record<string, any>
  whileInView?: Record<string, any>
  viewport?: { once?: boolean; margin?: string; amount?: number }
  layout?: boolean
  layoutId?: string
}

function buildTransformString(state: Record<string, any> | undefined): string {
  if (!state) return ''
  const parts: string[] = []
  if (state.perspective !== undefined) {
    parts.push(`perspective(${typeof state.perspective === 'number' ? `${state.perspective}px` : state.perspective})`)
  }
  if (state.x !== undefined) {
    parts.push(`translateX(${typeof state.x === 'number' ? `${state.x}px` : state.x})`)
  }
  if (state.y !== undefined) {
    parts.push(`translateY(${typeof state.y === 'number' ? `${state.y}px` : state.y})`)
  }
  if (state.z !== undefined) {
    parts.push(`translateZ(${typeof state.z === 'number' ? `${state.z}px` : state.z})`)
  }
  if (state.scale !== undefined) {
    parts.push(`scale(${state.scale})`)
  }
  if (state.scaleX !== undefined) {
    parts.push(`scaleX(${state.scaleX})`)
  }
  if (state.scaleY !== undefined) {
    parts.push(`scaleY(${state.scaleY})`)
  }
  if (state.rotate !== undefined) {
    parts.push(`rotate(${typeof state.rotate === 'number' ? `${state.rotate}deg` : state.rotate})`)
  }
  if (state.rotateX !== undefined) {
    parts.push(`rotateX(${typeof state.rotateX === 'number' ? `${state.rotateX}deg` : state.rotateX})`)
  }
  if (state.rotateY !== undefined) {
    parts.push(`rotateY(${typeof state.rotateY === 'number' ? `${state.rotateY}deg` : state.rotateY})`)
  }
  if (state.rotateZ !== undefined) {
    parts.push(`rotateZ(${typeof state.rotateZ === 'number' ? `${state.rotateZ}deg` : state.rotateZ})`)
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
  if (state.opacity !== undefined) style.opacity = state.opacity
  if (state.height !== undefined) style.height = state.height
  if (state.width !== undefined) style.width = state.width
  if (state.backgroundColor !== undefined) style.backgroundColor = state.backgroundColor
  if (state.borderColor !== undefined) style.borderColor = state.borderColor
  if (state.boxShadow !== undefined) style.boxShadow = state.boxShadow
  if (state.filter !== undefined) style.filter = state.filter
  return style
}

function createMotionComponent<T extends keyof React.JSX.IntrinsicElements>(tag: T) {
  const Component = forwardRef<HTMLElement, MotionProps & Record<string, any>>((props, ref) => {
    const {
      initial,
      animate,
      exit: _exit,
      transition,
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

    useEffect(() => {
      if (initial !== false) {
        const raf = requestAnimationFrame(() => {
          setMounted(true)
        })
        return () => cancelAnimationFrame(raf)
      }
    }, [initial])

    const targetState = mounted
      ? {
          ...(animate || {}),
          ...(whileInView || {}),
          ...(hovered && whileHover ? whileHover : {}),
          ...(tapped && whileTap ? whileTap : {}),
        }
      : typeof initial === 'object'
        ? initial
        : {}

    const duration = transition?.duration ?? 0.45
    const delay = transition?.delay ?? 0
    const computedMotionStyle = stateToCssStyle(targetState)

    const mergedStyle: React.CSSProperties = {
      transitionProperty: 'transform, opacity, background-color, border-color, box-shadow, filter, width, height',
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
}

export const AnimatePresence: React.FC<{
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
  initial?: boolean
}> = ({ children }) => {
  return <>{children}</>
}
