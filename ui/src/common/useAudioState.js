import { useEffect, useState } from 'react'

const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

// Event-driven mirror of the hidden <audio> engine. Instead of polling every
// 250ms (which made play/pause lag up to a quarter second), we listen to the
// element's own events, so the UI reflects state changes immediately. A light
// re-attach poll catches the element being (re)created by the engine.
const EVENTS = [
  'play',
  'pause',
  'playing',
  'timeupdate',
  'durationchange',
  'loadedmetadata',
  'volumechange',
  'ratechange',
  'seeked',
  'ended',
  'emptied',
]

export const useAudioState = () => {
  const [tick, setTick] = useState({ t: 0, d: 0, paused: true, vol: 1, muted: false })

  useEffect(() => {
    let au = null
    const sync = () => {
      const a = audioEl()
      if (!a) return
      setTick({
        t: a.currentTime || 0,
        d: a.duration || 0,
        paused: a.paused,
        vol: a.volume,
        muted: a.muted,
      })
    }
    const attach = () => {
      const a = audioEl()
      if (a && a !== au) {
        if (au) EVENTS.forEach((e) => au.removeEventListener(e, sync))
        au = a
        EVENTS.forEach((e) => a.addEventListener(e, sync))
        sync()
      }
    }
    attach()
    const id = setInterval(attach, 500)
    return () => {
      clearInterval(id)
      if (au) EVENTS.forEach((e) => au.removeEventListener(e, sync))
    }
  }, [])

  return tick
}

export default useAudioState
