import React, { useEffect, useRef, useState } from 'react'
import { useGetList } from 'react-admin'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import Rail from '../common/Rail'
import AlbumCard from '../common/AlbumCard'
import ListRow from '../common/ListRow'
import NdSelect from '../common/NdSelect'
import LibrarySidebar from '../common/LibrarySidebar'
import { SkeletonRail, SkeletonList } from '../common/Skeleton'
import { useInfiniteList } from '../common/useInfiniteList'
import { coverUrl } from '../common/covers'
import { usePlayAlbum } from '../common/usePlayAlbum'
import { useCount } from '../common/useCount'
import { useContainerWidth } from '../common/useContainerWidth'

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

// Sort options per resource. Navidrome maps these virtual sort fields on the
// native list API (the same ones Descubrir already relies on).
const SORT_OPTIONS = {
  album: [
    { value: 'name', label: 'Name', order: 'ASC' },
    { value: 'recently_added', label: 'Added', order: 'DESC' },
    { value: 'rating', label: 'Rating', order: 'DESC' },
    { value: 'play_count', label: 'Plays', order: 'DESC' },
    { value: 'random', label: 'Random', order: 'ASC' },
  ],
  artist: [
    { value: 'name', label: 'Name', order: 'ASC' },
    { value: 'play_count', label: 'Plays', order: 'DESC' },
    { value: 'rating', label: 'Rating', order: 'DESC' },
  ],
  song: [
    { value: 'title', label: 'Title', order: 'ASC' },
    { value: 'recently_added', label: 'Added', order: 'DESC' },
    { value: 'play_count', label: 'Plays', order: 'DESC' },
    { value: 'rating', label: 'Rating', order: 'DESC' },
    { value: 'random', label: 'Random', order: 'ASC' },
  ],
  playlist: [
    { value: 'name', label: 'Name', order: 'ASC' },
    { value: 'recently_added', label: 'Added', order: 'DESC' },
  ],
}

// Quick-filter pills for the catalogue views (album/song).
const QUICK_FILTERS = [
  { value: null, label: 'All' },
  { value: 'starred', label: 'Favorites', filter: { starred: true } },
  { value: 'rated', label: 'Rated', filter: { has_rating: true } },
]

// Bottom-of-list footer that auto-loads the next page when it scrolls near the
// viewport, with a Load more button as a guaranteed fallback and a progress
// readout. Fixes the old fixed-cap bug where only the first page ever showed.
const InfiniteFooter = ({ hasMore, loading, loaded, total, onLoadMore }) => {
  const ref = useRef(null)
  useEffect(() => {
    if (!hasMore || loading) return undefined
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onLoadMore()
      },
      { rootMargin: '300px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loading, onLoadMore])

  return (
    <div className="nd-inffoot" ref={ref}>
      {hasMore ? (
        <button className="nd-loadmore" onClick={onLoadMore} disabled={loading} type="button">
          {loading ? 'Loading…' : `Load more · ${loaded} of ${total}`}
        </button>
      ) : total > 0 ? (
        <span className="nd-infdone">{total.toLocaleString('en')} items</span>
      ) : null}
    </div>
  )
}

const LibraryView = ({ view, layout, search, sortField, order, genreId, quick }) => {
  const play = usePlayAlbum()
  const q = VIEW_QUERY[view] || VIEW_QUERY.albums

  const opts = SORT_OPTIONS[q.resource] || []
  const activeSort =
    sortField && opts.some((o) => o.value === sortField)
      ? { field: sortField, order: order || 'ASC' }
      : q.sort

  const filter = { ...(q.filter || {}) }
  if (genreId && (q.resource === 'album' || q.resource === 'song')) {
    filter.genre_id = genreId
  }
  const quickDef = QUICK_FILTERS.find((f) => f.value === quick)
  if (quickDef && quickDef.filter && (q.resource === 'album' || q.resource === 'song')) {
    Object.assign(filter, quickDef.filter)
  }

  const { records: rawRecords, total, loading, hasMore, loadMore } = useInfiniteList(
    q.resource,
    activeSort,
    filter,
    100,
  )

  const term = search.trim().toLowerCase()
  const records = term
    ? rawRecords.filter((r) =>
        `${r.name || r.title || ''} ${r.albumArtist || r.artist || ''}`
          .toLowerCase()
          .includes(term),
      )
    : rawRecords

  if (loading && rawRecords.length === 0) {
    return layout === 'list' ? <SkeletonList count={10} /> : <SkeletonRail count={12} />
  }

  if (!loading && rawRecords.length === 0) {
    return <div className="nd-empty">Nothing in this view yet.</div>
  }

  const isArtist = q.resource === 'artist'
  const isAlbumLike = q.resource === 'album' || q.resource === 'playlist'

  // A local search filters only what's loaded; don't invite loading more then.
  const footer = (
    <InfiniteFooter
      hasMore={hasMore && !term}
      loading={loading}
      loaded={rawRecords.length}
      total={total}
      onLoadMore={loadMore}
    />
  )

  let content
  if (q.resource === 'genre') {
    content = (
      <div className="nd-genres" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {records.map((g, i) => (
          <div className="nd-genre" key={g.id} style={{ background: GENRE_COLORS[i % GENRE_COLORS.length], height: 96 }}>
            {g.name}
          </div>
        ))}
      </div>
    )
  } else if (q.resource === 'radio') {
    content = (
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
                <a href={r.homePageUrl} target="_blank" rel="noopener noreferrer" aria-label="Station website">
                  <Icon name="external" size={18} />
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    )
  } else if (layout === 'grid') {
    content = (
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
                    {isArtist ? `${r.albumCount || 0} albums` : r.artist || ''}
                  </div>
                </div>
              </div>
            </Link>
          ),
        )}
      </Rail>
    )
  } else {
    content = (
      <div className="nd-list">
        {records.map((r) => (
          <ListRow
            key={r.id}
            record={r}
            type={
              { album: 'Album', artist: 'Artist', song: 'Track', playlist: 'List', genre: 'Genre', radio: 'Radio', share: 'Shared' }[
                q.resource
              ]
            }
            to={linkFor(q.resource, r.id)}
            onPlay={q.resource === 'album' ? () => play(r.id) : undefined}
            resource={
              ['album', 'artist', 'song', 'playlist'].includes(q.resource)
                ? q.resource
                : undefined
            }
          />
        ))}
      </div>
    )
  }

  return (
    <>
      {content}
      {footer}
    </>
  )
}

// Genre dropdown, backed by the real genre list.
const GenreFilter = ({ value, onChange }) => {
  const { data, ids } = useGetList(
    'genre',
    { page: 1, perPage: 200 },
    { field: 'name', order: 'ASC' },
    {},
  )
  const genres = (ids || []).map((id) => data[id]).filter(Boolean)
  const options = [
    { value: null, label: 'All genres' },
    ...genres.map((g) => ({ value: g.id, label: g.name })),
  ]
  return (
    <NdSelect
      icon="genre"
      ariaLabel="Filter by genre"
      value={value}
      options={options}
      onChange={onChange}
    />
  )
}

const Library = () => {
  const [view, setView] = useState('albums')
  const [layout, setLayout] = useState('grid')
  const [search, setSearch] = useState('')
  const [manualCollapse, setManualCollapse] = useState(null)
  const [wrapRef, wrapWidth] = useContainerWidth()

  // Toolbar state (sort / order / genre / quick filter), reset when the view
  // changes so each catalogue view starts from its natural default.
  const [sortField, setSortField] = useState(null)
  const [order, setOrder] = useState('ASC')
  const [genreId, setGenreId] = useState(null)
  const [quick, setQuick] = useState(null)

  const resource = (VIEW_QUERY[view] || VIEW_QUERY.albums).resource
  const sortOptions = SORT_OPTIONS[resource] || []
  const supportsGenre = resource === 'album' || resource === 'song'
  const supportsQuick = resource === 'album' || resource === 'song'

  useEffect(() => {
    setSortField(null)
    setOrder('ASC')
    setGenreId(null)
    setQuick(null)
  }, [view])

  const pickSort = (field) => {
    const opt = sortOptions.find((o) => o.value === field)
    setSortField(field)
    setOrder(opt ? opt.order : 'ASC')
  }
  const toggleOrder = () => setOrder((o) => (o === 'ASC' ? 'DESC' : 'ASC'))

  // Real per-view counts from the native list API (total header only).
  const albums = useCount('album')
  const artists = useCount('artist')
  const songs = useCount('song')
  const playlists = useCount('playlist')
  const genres = useCount('genre')
  const radios = useCount('radio')
  const shares = useCount('share')
  const favorites = useCount('album', { starred: true })
  const counts = {
    all: albums,
    albums,
    artists,
    songs,
    playlists,
    genres,
    radios,
    favorites,
    shares,
  }

  // Auto-collapse to the 56px icon rail when the library area is narrow
  // (measured with ResizeObserver, never window width); a manual toggle
  // overrides the automatic choice.
  const autoCollapsed = wrapWidth > 0 && wrapWidth < 900
  const collapsed = manualCollapse != null ? manualCollapse : autoCollapsed
  const toggleCollapse = () => setManualCollapse(!collapsed)

  return (
    <div className="nd-library" ref={wrapRef}>
      <LibrarySidebar
        view={view}
        onSelect={setView}
        counts={counts}
        collapsed={collapsed}
        onToggle={toggleCollapse}
      />
      <div className="nd-lib-content">
        <div className="nd-page-head">
          <h1>Library</h1>
        </div>
        <div className="nd-toolbar" style={{ marginBottom: 16 }}>
          <div className="nd-search">
            <Icon name="search" className="nd-icon" />
            <input
              placeholder="Search your library"
              aria-label="Search your library"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {supportsGenre ? <GenreFilter value={genreId} onChange={setGenreId} /> : null}
          {sortOptions.length ? (
            <div className="nd-sortgroup">
              <NdSelect
                icon="sort"
                ariaLabel="Sort by"
                value={sortField || sortOptions[0].value}
                options={sortOptions}
                onChange={pickSort}
              />
              <button
                className="nd-circ"
                onClick={toggleOrder}
                aria-label={order === 'ASC' ? 'Ascending' : 'Descending'}
                title={order === 'ASC' ? 'Ascending' : 'Descending'}
                type="button"
              >
                <Icon name={order === 'ASC' ? 'expand' : 'collapse'} size={16} />
              </button>
            </div>
          ) : null}
          <div className="nd-seg2" role="group" aria-label="View">
            <button
              className={layout === 'list' ? 'on' : ''}
              onClick={() => setLayout('list')}
              aria-label="List"
              aria-pressed={layout === 'list'}
              type="button"
            >
              <Icon name="queue" size={18} />
            </button>
            <button
              className={layout === 'grid' ? 'on' : ''}
              onClick={() => setLayout('grid')}
              aria-label="Grid"
              aria-pressed={layout === 'grid'}
              type="button"
            >
              <Icon name="library" size={18} />
            </button>
          </div>
        </div>
        {supportsQuick ? (
          <div className="nd-pills" role="group" aria-label="Quick filters" style={{ marginBottom: 20 }}>
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.value || 'all'}
                className={`nd-pill${quick === f.value ? ' on' : ''}`}
                onClick={() => setQuick(f.value)}
                aria-pressed={quick === f.value}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}
        <LibraryView
          view={view}
          layout={layout}
          search={search}
          sortField={sortField}
          order={order}
          genreId={genreId}
          quick={quick}
        />
      </div>
    </div>
  )
}

export default Library
