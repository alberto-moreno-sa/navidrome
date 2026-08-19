import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import NdLove from './NdLove'
import { coverUrl, resolution } from './covers'

// Library list-view row (height 58). Thumbnail 44, title 14/600, a metadata
// line joining type and artist with a bullet, and a right-aligned action
// cluster (resolution chip, favorite, info, kebab). The row highlights on hover.
// When `resource` is provided the favorite is wired to the data layer directly;
// otherwise it falls back to the passed `onToggleLove`/`loved` props.
const ListRow = ({ record, type, to, onPlay, loved, onToggleLove, resource }) => {
  if (!record) return null
  const title = record.name || record.title || '—'
  const artist = record.albumArtist || record.artist || record.ownerName || ''
  const res = resolution(record)
  const meta = [type, artist].filter(Boolean).join(' • ')
  const cover = coverUrl(record, 80)

  const Wrapper = to ? Link : 'div'
  const wrapperProps = to ? { to } : {}

  return (
    <div className="nd-listrow">
      <Wrapper {...wrapperProps} className="th" onClick={onPlay} style={{ display: 'block' }}>
        {cover ? <img src={cover} alt="" loading="lazy" /> : null}
      </Wrapper>
      <div className="lines">
        <div className="t nd-trunc">{title}</div>
        <div className="s nd-trunc">{meta}</div>
      </div>
      <div className="acts">
        {res ? <span className="nd-res">{res}</span> : null}
        {resource ? (
          <NdLove resource={resource} record={record} size={18} />
        ) : onToggleLove ? (
          <button
            className={`fav${loved ? ' on' : ''}`}
            aria-label={loved ? 'Quitar de favoritos' : 'Marcar favorito'}
            onClick={onToggleLove}
            type="button"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Icon name={loved ? 'heartFilled' : 'heart'} size={18} fill={loved} />
          </button>
        ) : null}
        <button aria-label="Información" type="button" style={{ display: 'grid', placeItems: 'center' }}>
          <Icon name="info" size={18} />
        </button>
        <button aria-label="Más" type="button" style={{ display: 'grid', placeItems: 'center' }}>
          <Icon name="kebab" size={18} />
        </button>
      </div>
    </div>
  )
}

export default ListRow
