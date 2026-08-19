import { useState } from 'react'

// Spotify-style scrubbing for a horizontal bar. Returns the drag fraction (null
// when idle) and a mousedown handler. While dragging, the caller shows the
// fraction as a preview; the actual seek is committed on release, so playback
// doesn't stutter mid-drag. A plain click (down+up in place) commits that spot.
export const useScrub = (onCommit) => {
  const [frac, setFrac] = useState(null)

  const fracFrom = (clientX, el) => {
    const r = el.getBoundingClientRect()
    if (!r.width) return 0
    return Math.max(0, Math.min(1, (clientX - r.left) / r.width))
  }

  const onMouseDown = (e) => {
    const el = e.currentTarget
    setFrac(fracFrom(e.clientX, el))
    const move = (ev) => setFrac(fracFrom(ev.clientX, el))
    const up = (ev) => {
      onCommit(fracFrom(ev.clientX, el))
      setFrac(null)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }

  return [frac, onMouseDown]
}

export default useScrub
