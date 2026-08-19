import React, { useState, useRef, useEffect } from 'react'
import { useGetList } from 'react-admin'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Rail from '../components/Rail'
import Section from '../components/Section'
import AlbumCard from '../components/AlbumCard'
import { coverUrl, resolution } from '../components/covers'
import { usePlayAlbum } from '../components/usePlayAlbum'

const GENRE_COLORS = [
  '#B4711F', '#A5401F', '#8E8B4A', '#B49A6A', '#5B3A9B', '#8E2F52', '#3A3A3A',
  '#33409B', '#9A8324', '#2F4E86', '#2E2E2E', '#2C6F7E', '#9B3535',
]

const useAlbums = (sort, order, filter, perPage) => {
  const { data, ids, loading } = useGetList(
    'album',
    { page: 1, perPage },
    { field: sort, order },
    filter || {},
  )
  const records = (ids || []).map((id) => data[id]).filter(Boolean)
  return { records, loading }
}

// A dense/featured rail of album cards backed by one getAlbumList2-equivalent query.
const AlbumRailSection = ({
  title, subtitle, seeAllTo, sort, order = 'DESC', filter, count = 16,
  variant = 'dense', firstFlag, ghostFlag, lg,
}) => {
  const { records, loading } = useAlbums(sort, order, filter, count)
  return (
    <Section title={title} subtitle={subtitle} seeAllTo={seeAllTo}>
      <Rail variant={variant}>
        {records.map((r, i) => (
          <AlbumCard
            key={r.id}
            record={r}
            lg={lg}
            flag={i === 0 ? firstFlag : null}
            ghostFlag={ghostFlag}
          />
        ))}
      </Rail>
      {!loading && records.length === 0 ? (
        <div className="av-empty">Nada por aquí todavía.</div>
      ) : null}
    </Section>
  )
}

// Editorial lists → the server's playlists, rendered as list cards (taxonomy
// second line + ghost flag). No editorial catalogue exists; we use real playlists.
const ListsSection = () => {
  const { data, ids, loading } = useGetList(
    'playlist',
    { page: 1, perPage: 16 },
    { field: 'name', order: 'ASC' },
    {},
  )
  const records = (ids || []).map((id) => data[id]).filter(Boolean)
  return (
    <Section
      title="Listas de la redacción"
      subtitle="Tus listas y las públicas del servidor."
      seeAllTo="/playlist"
    >
      <Rail variant="dense">
        {records.map((pl) => (
          <Link className="av-card" to={`/playlist/${pl.id}/show`} key={pl.id}>
            <div className="av-art">
              {coverUrl(pl, 300) ? <img src={coverUrl(pl, 300)} alt="" loading="lazy" /> : null}
              <span className="av-flag ghost">Lista</span>
              <div className="av-scrim">
                <span className="av-play"><Icon name="play" size={16} /></span>
              </div>
            </div>
            <div className="av-meta">
              <div className="lines">
                <div className="t av-trunc">{pl.name}</div>
                <div className="s tag av-trunc">{pl.ownerName ? `De ${pl.ownerName}` : 'Lista'}</div>
              </div>
            </div>
          </Link>
        ))}
      </Rail>
      {!loading && records.length === 0 ? (
        <div className="av-empty">Aún no tienes listas.</div>
      ) : null}
    </Section>
  )
}

// Top albums: 3 rank heroes + 12 rank rows on the same 3-column track.
const RankSection = () => {
  const play = usePlayAlbum()
  const { records } = useAlbums('play_count', 'DESC', {}, 15)
  const heroes = records.slice(0, 3)
  const rows = records.slice(3, 15)

  return (
    <Section
      title="Top álbumes"
      subtitle="Lo más reproducido en tu biblioteca."
      seeAllTo="/album/mostPlayed"
    >
      <div>
        <Rail variant="wide">
          {heroes.map((a, i) => (
            <button className="av-hero" key={a.id} onClick={() => play(a.id)} type="button">
              <span className="n">{i + 1}</span>
              <div className="av-art">
                {coverUrl(a, 400) ? <img src={coverUrl(a, 400)} alt="" loading="lazy" /> : null}
              </div>
              <div className="info">
                <b className="av-trunc">{a.name}</b>
                <span className="av-trunc">{a.albumArtist || a.artist}</span>
                {resolution(a) ? <span className="av-res">{resolution(a)}</span> : null}
              </div>
            </button>
          ))}
        </Rail>
        {rows.length ? <div className="av-divider" /> : null}
        <Rail variant="wide">
          {rows.map((a, i) => (
            <button className="av-row" key={a.id} onClick={() => play(a.id)} type="button">
              <span className="n">{i + 4}</span>
              <div className="av-art">
                {coverUrl(a, 120) ? <img src={coverUrl(a, 120)} alt="" loading="lazy" /> : null}
              </div>
              <div className="lines">
                <div className="t av-trunc">{a.name}</div>
                <div className="s av-trunc">{a.albumArtist || a.artist}</div>
              </div>
              {resolution(a) ? <span className="av-res">{resolution(a)}</span> : null}
              <span className="av-kebab"><Icon name="kebab" size={18} /></span>
            </button>
          ))}
        </Rail>
      </div>
    </Section>
  )
}

// Genre filter popover in the page header (real genres, genre palette).
const GenreFilter = () => {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState({})
  const ref = useRef(null)
  const { data, ids } = useGetList('genre', { page: 1, perPage: 60 }, { field: 'name', order: 'ASC' }, {})
  const genres = (ids || []).map((id) => data[id]).filter(Boolean)

  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="av-btn" onClick={() => setOpen((o) => !o)} type="button" aria-expanded={open}>
        <Icon name="filter" className="av-icon" />
        Filtrar por género
      </button>
      {open ? (
        <div className="av-pop">
          <h4><Icon name="sliders" className="av-icon" />Filtrar por género</h4>
          <div className="av-genres">
            {genres.map((g, i) => (
              <button
                key={g.id}
                className={`av-genre${selected[g.id] ? ' on' : ''}`}
                style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }}
                onClick={() => setSelected((s) => ({ ...s, [g.id]: !s[g.id] }))}
                type="button"
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

const Discover = () => (
  <div className="av-content">
    <div className="av-page-head">
      <h1>Descubrir</h1>
      <GenreFilter />
    </div>

    <AlbumRailSection
      title="Novedades"
      subtitle="Añadido a tu biblioteca recientemente."
      seeAllTo="/album/recentlyAdded"
      sort="recently_added"
      count={16}
      firstFlag="Novedad"
    />
    <ListsSection />
    <AlbumRailSection
      title="Discografía esencial"
      subtitle="Lo mejor valorado de tu colección."
      seeAllTo="/album/topRated"
      sort="rating"
      filter={{ has_rating: true }}
      count={16}
    />
    <RankSection />
    <AlbumRailSection
      title="Voces emergentes"
      subtitle="Una selección al azar para redescubrir."
      sort="random"
      order="ASC"
      count={6}
      variant="featured"
      lg
      ghostFlag="Revelación"
    />
    <AlbumRailSection
      title="Álbumes de la semana"
      subtitle="Tus favoritos marcados con estrella."
      seeAllTo="/album/starred"
      sort="starred_at"
      filter={{ starred: true }}
      count={8}
      firstFlag="Favorito"
    />
    <AlbumRailSection
      title="Elogios de la crítica"
      subtitle="Los álbumes mejor calificados."
      seeAllTo="/album/topRated"
      sort="rating"
      filter={{ has_rating: true }}
      count={6}
      variant="featured"
      lg
    />
  </div>
)

export default Discover
