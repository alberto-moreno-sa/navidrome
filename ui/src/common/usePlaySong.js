import { useDispatch } from 'react-redux'
import { playTracks } from '../actions'

// Play a single song, optionally within a context list (so next/prev walk the
// surrounding results). Reuses the existing playTracks action — no new path.
export const usePlaySong = () => {
  const dispatch = useDispatch()
  return (song, contextList) => {
    const list = contextList && contextList.length ? contextList : [song]
    const keyed = {}
    const ids = []
    list.forEach((s) => {
      keyed[s.id] = s
      ids.push(s.id)
    })
    dispatch(playTracks(keyed, ids, song.id))
  }
}
