import React from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import NdLove from './NdLove'
import { coverUrl } from './covers'
import { useAlbumResolution } from './useAlbumResolution'
import { usePlayAlbum } from './usePlayAlbum'
import { usePlayPlaylist } from './usePlay'

// Dense/featured album card. Clicking the card opens the detail page; a play
// button overlays the artwork on hover for direct play (kept as a sibling of
// the cover link to avoid nesting interactive elements). A favorite heart
// overlays the top-right. The resolution/format chips sit in the meta row.
const AlbumCard = ({ record, flag, ghostFlag, lg, tag, resource = 'album', awards }) => {
  const playAlbum = usePlayAlbum()
  const playPlaylist = usePlayPlaylist()
  const play = resource === 'playlist' ? playPlaylist : playAlbum
  const { res, format, lossless } = useAlbumResolution(record, resource === 'album')
  if (!record) return null
  const cover = coverUrl(record, lg ? 400 : 300)
  const title = record.name || record.title || '—'
  const subtitle = record.albumArtist || record.artist || ''
  const detailUrl =
    resource === 'playlist' ? `/playlist/${record.id}/show` : `/album/${record.id}/show`

  const onPlay = (e) => {
    e.preventDefault()
    e.stopPropagation()
    play(record.id)
  }

  return (
    <div className={`nd-cardwrap${lg ? ' lg' : ''}`}>
      <div className={`nd-card${lg ? ' lg' : ''}`}>
        <div className="nd-art">
          {cover ? <img src={cover} alt="" loading="lazy" /> : null}
          {flag ? <span className="nd-flag">{flag}</span> : null}
          {ghostFlag ? <span className="nd-flag ghost">{ghostFlag}</span> : null}
          <Link className="nd-artlink" to={detailUrl} aria-label={title} />
          <div className="nd-scrim" aria-hidden="true">
            <button className="nd-play" onClick={onPlay} aria-label={`Play ${title}`} type="button">
              <Icon name="play" size={16} />
            </button>
          </div>
        </div>
        <div className="nd-meta">
          <Link className="lines nd-metalink" to={detailUrl}>
            <div className="t nd-trunc">{title}</div>
            <div className={`s nd-trunc${tag ? ' tag' : ''}`}>
              {record.explicit ? <span className="nd-exp">E</span> : null}
              {tag || subtitle}
            </div>
          </Link>
          {format || res ? (
            <span className="nd-qualchips">
              {format ? (
                <span className={`nd-fmt-chip sm${lossless ? ' lossless' : ''}`}>{format}</span>
              ) : null}
              {res ? <span className="nd-res">{res}</span> : null}
            </span>
          ) : null}
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
      </div>
      {resource ? <NdLove className="nd-cardfav" resource={resource} record={record} size={18} /> : null}
    </div>
  )
}

export default AlbumCard
