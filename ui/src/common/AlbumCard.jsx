import React from 'react'
import Icon from './Icon'
import { coverUrl, resolution } from './covers'
import { usePlayAlbum } from './usePlayAlbum'

// Dense/featured album card. Per the spec, clicking the card plays the item;
// the scrim/play overlay is the affordance. The resolution chip sits in the
// meta row (right of the title), never on the artwork.
const AlbumCard = ({ record, flag, ghostFlag, lg, tag }) => {
  const play = usePlayAlbum()
  if (!record) return null
  const res = resolution(record)
  const cover = coverUrl(record, lg ? 400 : 300)
  const title = record.name || record.title || '—'
  const subtitle = record.albumArtist || record.artist || ''

  return (
    <button
      className={`nd-card${lg ? ' lg' : ''}`}
      onClick={() => play(record.id)}
      aria-label={`Reproducir ${title}`}
      type="button"
    >
      <div className="nd-art">
        {cover ? <img src={cover} alt="" loading="lazy" /> : null}
        {flag ? <span className="nd-flag">{flag}</span> : null}
        {ghostFlag ? <span className="nd-flag ghost">{ghostFlag}</span> : null}
        <div className="nd-scrim">
          <span className="nd-play">
            <Icon name="play" size={16} />
          </span>
        </div>
      </div>
      <div className="nd-meta">
        <div className="lines">
          <div className="t nd-trunc">{title}</div>
          <div className={`s nd-trunc${tag ? ' tag' : ''}`}>
            {record.explicit ? <span className="nd-exp">E</span> : null}
            {tag || subtitle}
          </div>
        </div>
        {res ? <span className="nd-res">{res}</span> : null}
      </div>
    </button>
  )
}

export default AlbumCard
