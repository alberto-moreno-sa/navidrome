import { useEffect } from 'react'

const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)
const isTyping = (el) =>
  el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)

// Global keyboard shortcuts, mounted once by the shell. They drive the same
// hidden <audio> engine the player bar uses, so no data path is touched.
// Ignored while typing in a field (Escape blurs it instead).
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const call = (fn) => {
      const au = audioEl()
      if (au && typeof au[fn] === 'function') au[fn]()
    }
    const onKey = (e) => {
      if (isTyping(e.target)) {
        if (e.key === 'Escape') e.target.blur()
        return
      }
      const au = audioEl()
      switch (e.key) {
        case ' ':
          e.preventDefault()
          call('togglePlay')
          break
        case 'ArrowRight':
          if (au) au.currentTime = Math.min(au.duration || 0, (au.currentTime || 0) + 5)
          break
        case 'ArrowLeft':
          if (au) au.currentTime = Math.max(0, (au.currentTime || 0) - 5)
          break
        case 'ArrowUp':
          e.preventDefault()
          if (au) au.volume = Math.min(1, (au.volume || 0) + 0.05)
          break
        case 'ArrowDown':
          e.preventDefault()
          if (au) au.volume = Math.max(0, (au.volume || 0) - 0.05)
          break
        case 'n':
        case 'N':
          call('playNext')
          break
        case 'p':
        case 'P':
          call('playPrev')
          break
        case 'm':
        case 'M':
          if (au) au.muted = !au.muted
          break
        case '/': {
          e.preventDefault()
          const s = document.querySelector('.nd-search input')
          if (s) s.focus()
          break
        }
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

export default useKeyboardShortcuts
