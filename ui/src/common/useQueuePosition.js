import { useSelector } from 'react-redux'
import { getShuffleContext } from './shuffleContext'

// Position of the current track in the queue as "N of M". For an endless
// library shuffle the buffered queue (e.g. 200, growing) would be misleading,
// so M becomes the whole library's song count captured when the shuffle
// started — the user sees "3 of 10,992", matching "shuffle all my songs".
export const useQueuePosition = () => {
  const queue = useSelector((s) => s.player?.queue || [])
  const current = useSelector((s) => s.player?.current || {})
  const idx = queue.findIndex((t) => t.uuid === current.uuid)
  const pos = queue.length ? Math.max(idx + 1, 1) : 0

  const ctx = getShuffleContext()
  const total = ctx.active && ctx.total ? Math.max(ctx.total, queue.length) : queue.length

  return {
    pos,
    total,
    label: queue.length ? `${pos} of ${total.toLocaleString('en')}` : '',
  }
}

export default useQueuePosition
