import { useState, useEffect, useRef } from 'react'

// Measures the observed element's content-box width with a ResizeObserver.
// Every rail's column count and the toolbar/player breakpoints derive from
// this value, never from window.innerWidth: the available width must discount
// the sidebar and the queue drawer.
export const useContainerWidth = () => {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

export default useContainerWidth
