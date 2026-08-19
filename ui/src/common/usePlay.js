import { useDataProvider } from 'react-admin'
import { useDispatch } from 'react-redux'
import { playTracks, setTrack } from '../actions'
import { songFromRadio } from '../radio/helper'

const keyById = (rows) => {
  const keyed = {}
  const ids = []
  rows.forEach((r) => {
    keyed[r.id] = r
    ids.push(r.id)
  })
  return { keyed, ids }
}

// Play a whole playlist by fetching its tracks (playlistTrack) and dispatching
// the existing playTracks action — the sanctioned path, same as the original UI.
export const usePlayPlaylist = () => {
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  return async (playlistId) => {
    const { data } = await dataProvider.getList('playlistTrack', {
      pagination: { page: 1, perPage: 500 },
      sort: { field: 'id', order: 'ASC' },
      filter: { playlist_id: playlistId },
    })
    const { keyed, ids } = keyById(data || [])
    if (ids.length) dispatch(playTracks(keyed, ids))
  }
}

// Play a radio station: build the radio track (isRadio) and set it as current.
export const usePlayRadio = () => {
  const dispatch = useDispatch()
  return async (radio) => {
    dispatch(setTrack(await songFromRadio(radio)))
  }
}

// Play everything in a genre (shuffled) — the module-appropriate action for a
// genre tile.
export const usePlayGenre = () => {
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  return async (genreId) => {
    const { data } = await dataProvider.getList('song', {
      pagination: { page: 1, perPage: 200 },
      sort: { field: 'random', order: 'ASC' },
      filter: { genre_id: genreId },
    })
    const { keyed, ids } = keyById(data || [])
    if (ids.length) dispatch(playTracks(keyed, ids))
  }
}
