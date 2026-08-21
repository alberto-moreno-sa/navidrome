import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import NdLove from './NdLove'
import { coverUrl, resolution } from './covers'

// Library list-view row (height 58). The whole main area (thumbnail + title) is
// one clickable target: it plays when `onPlay` is given (song/album/playlist),
// otherwise it navigates via `to` (artist). The action cluster (resolution
// chip, favorite, info, more) stays separate so those controls don't trigger
// playback. When `resource` is provided the favorite is wired to the data layer.
const ListRow = ({ record, type, to, onPlay, loved, onToggleLove, resource }) => {
  if (!record) return null
  const title = record.name || record.title || '—'
  const artist = record.albumArtist || record.artist || record.ownerName || ''
  const res = resolution(record)
  const meta = [type, artist].filter(Boolean).join(' • ')
  const cover = coverUrl(record, 80)

  const inner = (
    <>
      <span className="th">
        {cover ? <img src={cover} alt="" loading="lazy" /> : null}
        <span className="nd-listrow-play">
          <Icon name="play" size={16} />
        </span>
      </span>
      <div className="lines">
        <div className="t nd-trunc">{title}</div>
        <div className="s nd-trunc">{meta}</div>
      </div>
    </>
  )

  return (
    <div className="nd-listrow">
      {onPlay ? (
        <button className="nd-listrow-main" onClick={onPlay} aria-label={`Play ${title}`} type="button">
          {inner}
        </button>
      ) : to ? (
        <Link className="nd-listrow-main" to={to}>
          {inner}
        </Link>
      ) : (
        <div className="nd-listrow-main">{inner}</div>
      )}
      <div className="acts">
        {res ? <span className="nd-res">{res}</span> : null}
        {resource ? (
          <NdLove resource={resource} record={record} size={18} />
        ) : onToggleLove ? (
          <button
            className={`fav${loved ? ' on' : ''}`}
            aria-label={loved ? 'Remove from favorites' : 'Add to favorites'}
            onClick={onToggleLove}
            type="button"
            style={{ display: 'grid', placeItems: 'center' }}
          >
            <Icon name={loved ? 'heartFilled' : 'heart'} size={18} fill={loved} />
          </button>
        ) : null}
        {to ? (
          <Link to={to} aria-label="Details" style={{ display: 'grid', placeItems: 'center', color: 'inherit' }}>
            <Icon name="info" size={18} />
          </Link>
        ) : (
          <button aria-label="Information" type="button" style={{ display: 'grid', placeItems: 'center' }}>
            <Icon name="info" size={18} />
          </button>
        )}
        <button aria-label="More" type="button" style={{ display: 'grid', placeItems: 'center' }}>
          <Icon name="kebab" size={18} />
        </button>
      </div>
    </div>
  )
}

export default ListRow
