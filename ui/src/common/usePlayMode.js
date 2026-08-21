import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// Shuffle / repeat driven through the real engine, not just redux. The hidden
// react-jinke engine owns the play order; its single play-mode button
// (.loop-btn) cycles order → orderLoop → singleLoop → shufflePlay and fires
// onPlayModeChange, which syncs redux. Setting redux alone does NOT reorder the
// engine, so we advance that button to the target mode — one click per step,
// with a tick between clicks so the engine actually applies each step (rapid
// synchronous clicks would collapse into one). An optimistic override shows the
// target mode immediately, so the icon doesn't flash through the in-between
// modes while the engine catches up.
const ORDER = ['order', 'orderLoop', 'singleLoop', 'shufflePlay']
const engineBtn = () =>
  typeof document !== 'undefined'
    ? document.querySelector('.react-jinke-music-player-main .loop-btn')
    : null
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export const usePlayMode = () => {
  const mode = useSelector((s) => s.player?.mode || 'order')
  const [optim, setOptim] = useState(null)

  // Drop the optimistic target once the engine (via redux) reaches it.
  useEffect(() => {
    if (optim != null && optim === mode) setOptim(null)
  }, [mode, optim])

  const effMode = optim != null ? optim : mode

  const setMode = async (target) => {
    const btn = engineBtn()
    if (!btn) return
    setOptim(target)
    let clicks = (ORDER.indexOf(target) - ORDER.indexOf(mode) + ORDER.length) % ORDER.length
    while (clicks-- > 0) {
      btn.click()
      // eslint-disable-next-line no-await-in-loop
      await sleep(50)
    }
  }

  const shuffleOn = effMode === 'shufflePlay'
  const repeatState = effMode === 'singleLoop' ? 'one' : effMode === 'orderLoop' ? 'all' : 'off'

  const toggleShuffle = () => setMode(shuffleOn ? 'order' : 'shufflePlay')
  const cycleRepeat = () =>
    setMode(repeatState === 'off' ? 'orderLoop' : repeatState === 'all' ? 'singleLoop' : 'order')

  return { mode: effMode, shuffleOn, repeatState, toggleShuffle, cycleRepeat }
}

export default usePlayMode
