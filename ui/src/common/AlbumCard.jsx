import React from 'react'
import Icon from './Icon'
import NdLove from './NdLove'
import { coverUrl } from './covers'
import { useAlbumResolution } from './useAlbumResolution'
import { usePlayAlbum } from './usePlayAlbum'

// Dense/featured album card. Clicking the card plays the item; the scrim/play
// overlay is the affordance. A favorite heart overlays the top-right of the
// artwork on hover (kept as a sibling of the play button to avoid nesting
// interactive elements). The resolution chip sits in the meta row.
const AlbumCard = ({ record, flag, ghostFlag, lg, tag, resource = 'album', awards }) => {
  const play = usePlayAlbum()
  const res = useAlbumResolution(record, resource === 'album')
  if (!record) return null
  const cover = coverUrl(record, lg ? 400 : 300)
  const title = record.name || record.title || '—'
  const subtitle = record.albumArtist || record.artist || ''

  return (
    <div className={`nd-cardwrap${lg ? ' lg' : ''}`}>
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
        {awards && awards.length ? (
          <div className="nd-awards">
            {awards.slice(0, 2).map((a, i) => (
              <span className="nd-award" key={i}>
                <Icon name={a.icon || 'award'} size={14} />
                <b>{a.label}</b>
              </span>
            ))}
            {awards.length > 2 ? (
              <span className="nd-award">+{awards.length - 2}</span>
            ) : null}
          </div>
        ) : null}
      </button>
      {resource ? <NdLove className="nd-cardfav" resource={resource} record={record} size={18} /> : null}
    </div>
  )
}

export default AlbumCard
