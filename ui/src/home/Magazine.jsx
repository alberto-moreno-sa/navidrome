import React from 'react'
import { useGetList } from 'react-admin'
import AlbumCard from '../common/AlbumCard'
import Rail from '../common/Rail'
import Section from '../common/Section'
import Icon from '../common/Icon'
import { coverUrl } from '../common/covers'
import { usePlayAlbum } from '../common/usePlayAlbum'

// Revista: an editorial reading of the real library. A featured cover (the
// highest-rated album) plus editorial rails, all backed by the native list API
// — no invented catalogue, no new data path. Distinct from Descubrir, which is
// a denser dashboard.
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

const Hero = () => {
  const play = usePlayAlbum()
  // Prefer a rated album as the cover; fall back to the newest arrival so the
  // hero is always populated even before the user has rated anything.
  const rated = useAlbums('rating', 'DESC', { has_rating: true }, 1)
  const recent = useAlbums('recently_added', 'DESC', undefined, 1)
  const album = rated.records[0] || recent.records[0]
  if (!album) return null
  const cover = coverUrl(album, 600)
  return (
    <section className="nd-mag-hero">
      <div className="nd-mag-cover">
        {cover ? <img src={cover} alt="" /> : null}
      </div>
      <div className="nd-mag-copy">
        <div className="nd-kicker">Revista · Portada</div>
        <h1 className="nd-mag-title nd-trunc">{album.name}</h1>
        <div className="nd-mag-artist nd-trunc">{album.albumArtist || album.artist}</div>
        <div className="nd-mag-actions">
          <button className="nd-btn" onClick={() => play(album.id)} type="button">
            <Icon name="play" size={18} /> Reproducir
          </button>
        </div>
      </div>
    </section>
  )
}

const Magazine = () => (
  <div className="nd-page">
    <Hero />
    <AlbumRail
      title="Lo más valorado"
      subtitle="Tu biblioteca, ordenada por tus estrellas."
      sort="rating"
      filter={{ has_rating: true }}
    />
    <AlbumRail
      title="Recién llegados"
      subtitle="Lo último que entró en la colección."
      sort="recently_added"
    />
    <AlbumRail
      title="Redescúbrelo"
      subtitle="Una selección al azar para volver a escuchar."
      sort="random"
      order="ASC"
    />
  </div>
)

const AlbumRail = ({ title, subtitle, sort, order = 'DESC', filter, count = 12 }) => {
  const { records, loading } = useAlbums(sort, order, filter, count)
  return (
    <Section title={title} subtitle={subtitle}>
      <Rail variant="dense">
        {records.map((r) => (
          <AlbumCard key={r.id} record={r} />
        ))}
      </Rail>
      {!loading && records.length === 0 ? (
        <div className="nd-empty">Nada por aquí todavía.</div>
      ) : null}
    </Section>
  )
}

export default Magazine
