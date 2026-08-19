import React, { useState } from 'react'
import { useGetList } from 'react-admin'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import Rail from '../common/Rail'
import AlbumCard from '../common/AlbumCard'
import ListRow from '../common/ListRow'
import LibrarySidebar from '../common/LibrarySidebar'
import { coverUrl } from '../common/covers'
import { usePlayAlbum } from '../common/usePlayAlbum'

const GENRE_COLORS = [
  '#B4711F', '#A5401F', '#8E8B4A', '#B49A6A', '#5B3A9B', '#8E2F52', '#3A3A3A',
  '#33409B', '#9A8324', '#2F4E86', '#2E2E2E', '#2C6F7E', '#9B3535',
]

// Which resource + sort/filter backs each sidebar view. Uses the fork's native
// dataProvider — no new data path.
const VIEW_QUERY = {
  all: { resource: 'album', sort: { field: 'name', order: 'ASC' } },
  albums: { resource: 'album', sort: { field: 'name', order: 'ASC' } },
  artists: { resource: 'artist', sort: { field: 'name', order: 'ASC' } },
  songs: { resource: 'song', sort: { field: 'title', order: 'ASC' } },
  playlists: { resource: 'playlist', sort: { field: 'name', order: 'ASC' } },
  genres: { resource: 'genre', sort: { field: 'name', order: 'ASC' } },
  radios: { resource: 'radio', sort: { field: 'name', order: 'ASC' } },
  favorites: { resource: 'album', sort: { field: 'starred_at', order: 'DESC' }, filter: { starred: true } },
  shares: { resource: 'share', sort: { field: 'createdAt', order: 'DESC' } },
}

const linkFor = (resource, id) => {
  if (resource === 'album') return `/album/${id}/show`
  if (resource === 'artist') return `/artist/${id}/show`
  if (resource === 'playlist') return `/playlist/${id}/show`
  return undefined
}

const LibraryView = ({ view, layout, search }) => {
  const play = usePlayAlbum()
  const q = VIEW_QUERY[view] || VIEW_QUERY.albums
  const { data, ids, loading } = useGetList(
    q.resource,
    { page: 1, perPage: 120 },
    q.sort,
    q.filter || {},
  )
  const term = search.trim().toLowerCase()
  const records = (ids || [])
    .map((id) => data[id])
    .filter(Boolean)
    .filter((r) => {
      if (!term) return true
      const hay = `${r.name || r.title || ''} ${r.albumArtist || r.artist || ''}`.toLowerCase()
      return hay.includes(term)
    })

  if (!loading && records.length === 0) {
    return <div className="nd-empty">No hay nada en esta vista todavía.</div>
  }

  const isArtist = q.resource === 'artist'
  const isAlbumLike = q.resource === 'album' || q.resource === 'playlist'

  if (q.resource === 'genre') {
    return (
      <div className="nd-genres" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {records.map((g, i) => (
          <div className="nd-genre" key={g.id} style={{ background: GENRE_COLORS[i % GENRE_COLORS.length], height: 96 }}>
            {g.name}
          </div>
        ))}
      </div>
    )
  }

  if (q.resource === 'radio') {
    return (
      <div className="nd-list">
        {records.map((r) => (
          <div className="nd-listrow" key={r.id}>
            <span className="th" style={{ display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>
              <Icon name="discover" size={20} />
            </span>
            <div className="lines">
              <div className="t nd-trunc">{r.name}</div>
              <div className="s nd-trunc" style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.streamUrl}</div>
            </div>
            <div className="acts">
              {r.homePageUrl ? (
                <a href={r.homePageUrl} target="_blank" rel="noopener noreferrer" aria-label="Sitio de la emisora">
                  <Icon name="external" size={18} />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (layout === 'grid') {
    return (
      <Rail variant="dense">
        {records.map((r) =>
          isAlbumLike ? (
            <AlbumCard key={r.id} record={r} />
          ) : (
            <Link
              key={r.id}
              className={`nd-card${isArtist ? ' nd-artcard' : ''}`}
              to={linkFor(q.resource, r.id) || '#'}
            >
              <div className="nd-art">
                {coverUrl(r, 300) ? <img src={coverUrl(r, 300)} alt="" loading="lazy" /> : null}
              </div>
              <div className="nd-meta">
                <div className="lines">
                  <div className="t nd-trunc">{r.name || r.title}</div>
                  <div className="s nd-trunc">
                    {isArtist ? `${r.albumCount || 0} álbumes` : r.artist || ''}
                  </div>
                </div>
              </div>
            </Link>
          ),
        )}
      </Rail>
    )
  }

  // list layout
  return (
    <div className="nd-list">
      {records.map((r) => (
        <ListRow
          key={r.id}
          record={r}
          type={
            { album: 'Álbum', artist: 'Artista', song: 'Pista', playlist: 'Lista', genre: 'Género', radio: 'Radio', share: 'Compartido' }[
              q.resource
            ]
          }
          to={linkFor(q.resource, r.id)}
          onPlay={q.resource === 'album' ? () => play(r.id) : undefined}
        />
      ))}
    </div>
  )
}

const Library = () => {
  const [view, setView] = useState('albums')
  const [layout, setLayout] = useState('grid')
  const [search, setSearch] = useState('')

  return (
    <div className="nd-library">
      <LibrarySidebar view={view} onSelect={setView} />
      <div className="nd-lib-content">
        <div className="nd-page-head">
          <h1>Biblioteca</h1>
        </div>
        <div className="nd-toolbar" style={{ marginBottom: 24 }}>
          <div className="nd-search">
            <Icon name="search" className="nd-icon" />
            <input
              placeholder="Buscar en tu biblioteca"
              aria-label="Buscar en tu biblioteca"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="nd-seg2" role="group" aria-label="Vista">
            <button
              className={layout === 'list' ? 'on' : ''}
              onClick={() => setLayout('list')}
              aria-label="Lista"
              aria-pressed={layout === 'list'}
              type="button"
            >
              <Icon name="queue" size={18} />
            </button>
            <button
              className={layout === 'grid' ? 'on' : ''}
              onClick={() => setLayout('grid')}
              aria-label="Cuadrícula"
              aria-pressed={layout === 'grid'}
              type="button"
            >
              <Icon name="library" size={18} />
            </button>
          </div>
        </div>
        <LibraryView view={view} layout={layout} search={search} />
      </div>
    </div>
  )
}

export default Library
