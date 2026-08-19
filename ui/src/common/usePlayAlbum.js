import { useDataProvider } from 'react-admin'
import { useDispatch } from 'react-redux'
import { playTracks } from '../actions'

// Play a whole album: fetch its songs through the fork's dataProvider (native
// /api), then dispatch the existing playTracks action. No new data path.
export const usePlayAlbum = () => {
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  return async (albumId) => {
    const { data } = await dataProvider.getList('song', {
      pagination: { page: 1, perPage: 500 },
      sort: { field: 'album', order: 'ASC' },
      filter: { album_id: albumId },
    })
    const keyed = {}
    const ids = []
    data.forEach((r) => {
      keyed[r.id] = r
      ids.push(r.id)
    })
    if (ids.length) dispatch(playTracks(keyed, ids))
  }
}
