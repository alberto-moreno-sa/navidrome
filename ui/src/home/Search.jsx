import React from 'react'
import { useGetList } from 'react-admin'
import { Link, useLocation } from 'react-router-dom'
import AlbumCard from '../common/AlbumCard'
import ListRow from '../common/ListRow'
import Rail from '../common/Rail'
import Icon from '../common/Icon'
import { coverUrl } from '../common/covers'
import { usePlaySong } from '../common/usePlaySong'

// Global search. Navidrome's native list API matches partial names, exactly as
// the original per-list SearchInput does (album/artist by `name`, song by
// `title`). We query the three resources and render matching sections. No new
// data path: same dataProvider the rest of the app uses.
const useQ = () => new URLSearchParams(useLocation().search).get('q') || ''

const ArtistCard = ({ record }) => {
  const cover = coverUrl(record, 300)
  return (
    <Link className="nd-artistcard" to={`/artist/${record.id}/show`}>
      <div className="nd-artistcard-photo">
        {cover ? <img src={cover} alt="" loading="lazy" /> : null}
      </div>
      <div className="t nd-trunc">{record.name}</div>
      <div className="s nd-trunc">Artist</div>
    </Link>
  )
}

const Search = () => {
  const q = useQ().trim()
  const playSong = usePlaySong()
  // A single space guarantees zero matches when q is empty, so the page never
  // fetches the whole library on an empty query.
  const guard = q || ' '

  const artists = useGetList('artist', { page: 1, perPage: 18 }, { field: 'name', order: 'ASC' }, { name: guard })
  const albums = useGetList('album', { page: 1, perPage: 18 }, { field: 'name', order: 'ASC' }, { name: guard })
  const songs = useGetList('song', { page: 1, perPage: 30 }, { field: 'title', order: 'ASC' }, { title: guard })

  const artistList = (artists.ids || []).map((id) => artists.data[id]).filter(Boolean)
  const albumList = (albums.ids || []).map((id) => albums.data[id]).filter(Boolean)
  const songList = (songs.ids || []).map((id) => songs.data[id]).filter(Boolean)

  const loading = artists.loading || albums.loading || songs.loading
  const total = artistList.length + albumList.length + songList.length

  if (!q) {
    return (
      <div className="nd-page">
        <h1 className="nd-h1">Search</h1>
        <div className="nd-empty">
          Type in the top bar to search your library.
        </div>
      </div>
    )
  }

  return (
    <div className="nd-page">
      <h1 className="nd-h1">Results</h1>
      <div className="nd-sub" style={{ marginBottom: 24 }}>
        {loading ? 'Searching…' : `${total} matches for "${q}"`}
      </div>

      {artistList.length ? (
        <section className="nd-sec">
          <div className="nd-sec-head">
            <div className="nd-sec-title">
              <h2>Artists</h2>
            </div>
          </div>
          <Rail variant="dense">
            {artistList.map((r) => (
              <ArtistCard key={r.id} record={r} />
            ))}
          </Rail>
        </section>
      ) : null}

      {albumList.length ? (
        <section className="nd-sec">
          <div className="nd-sec-head">
            <div className="nd-sec-title">
              <h2>Albums</h2>
            </div>
          </div>
          <Rail variant="dense">
            {albumList.map((r) => (
              <AlbumCard key={r.id} record={r} />
            ))}
          </Rail>
        </section>
      ) : null}

      {songList.length ? (
        <section className="nd-sec">
          <div className="nd-sec-head">
            <div className="nd-sec-title">
              <h2>Songs</h2>
            </div>
          </div>
          <div className="nd-list">
            {songList.map((r) => (
              <ListRow
                key={r.id}
                record={r}
                type="Track"
                resource="song"
                onPlay={() => playSong(r, songList)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!loading && total === 0 ? (
        <div className="nd-empty">
          <Icon name="searchOff" size={28} />
          <div style={{ marginTop: 10 }}>No results for "{q}".</div>
        </div>
      ) : null}
    </div>
  )
}

export default Search
