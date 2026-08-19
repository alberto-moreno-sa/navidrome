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
      className={`av-card${lg ? ' lg' : ''}`}
      onClick={() => play(record.id)}
      aria-label={`Reproducir ${title}`}
      type="button"
    >
      <div className="av-art">
        {cover ? <img src={cover} alt="" loading="lazy" /> : null}
        {flag ? <span className="av-flag">{flag}</span> : null}
        {ghostFlag ? <span className="av-flag ghost">{ghostFlag}</span> : null}
        <div className="av-scrim">
          <span className="av-play">
            <Icon name="play" size={16} />
          </span>
        </div>
      </div>
      <div className="av-meta">
        <div className="lines">
          <div className="t av-trunc">{title}</div>
          <div className={`s av-trunc${tag ? ' tag' : ''}`}>
            {record.explicit ? <span className="av-exp">E</span> : null}
            {tag || subtitle}
          </div>
        </div>
        {res ? <span className="av-res">{res}</span> : null}
      </div>
    </button>
  )
}

export default AlbumCard
