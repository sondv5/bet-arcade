import { useEffect, useRef } from 'react'
import { addShadowCatcher, createStage, setupLights } from './threeKit'

export function useStage(containerRef, options = {}) {
  const apiRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const stage = createStage(container, options)
    const lights = setupLights(stage.scene, options.lights ?? {})
    if (options.ground !== false) addShadowCatcher(stage.scene, options.groundOptions ?? {})

    const custom = options.setup ? options.setup(stage, lights) ?? {} : {}
    apiRef.current = { ...stage, ...custom }
    stage.refresh()
    const warmup = setTimeout(() => {
      if (apiRef.current) apiRef.current.refresh()
    }, 160)

    return () => {
      clearTimeout(warmup)
      if (typeof custom.destroy === 'function') custom.destroy()
      apiRef.current = null
      stage.dispose()
    }
    // Stage options intentionally only apply on mount; player changes remount the game.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return apiRef
}
