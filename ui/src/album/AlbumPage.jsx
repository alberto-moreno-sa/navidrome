import React from 'react'
import { useShowController, useGetList } from 'react-admin'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import NdLove from '../common/NdLove'
import NdStars from '../common/NdStars'
import { coverUrl, resolution } from '../common/covers'
import { usePlayAlbum } from '../common/usePlayAlbum'
import { usePlaySong } from '../common/usePlaySong'
import { shuffleTracks } from '../actions'

const fmtDur = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}
const fmtTotal = (s) => {
  if (!s) return ''
  const h = Math.floor(s / 3600)
  const m = Math.round((s % 3600) / 60)
  return h ? `${h} hr ${m} min` : `${m} min`
}

// Bespoke album detail page (replaces the resource show). Header with cover +
// actions, then a clickable tracklist: each track plays within the album as the
// queue. All data comes from the native list API — no new data path.
const AlbumPage = (props) => {
  const { record } = useShowController(props)
  const dispatch = useDispatch()
  const playAlbum = usePlayAlbum()
  const playSong = usePlaySong()

  const { data, ids } = useGetList(
    'song',
    { page: 1, perPage: 300 },
    { field: 'trackNumber', order: 'ASC' },
    { album_id: props.id },
  )
  const songs = (ids || []).map((id) => data[id]).filter(Boolean)

  if (!record) return null
  const cover = coverUrl(record, 400)
  const artistId = record.albumArtistId || record.artistId
  const albumArtist = record.albumArtist || record.artist
  const isComp = songs.some((s) => s.artist && s.artist !== albumArtist)

  const shuffleAll = () => {
    if (!songs.length) return
    const keyed = {}
    songs.forEach((s) => {
      keyed[s.id] = s
    })
    dispatch(shuffleTracks(keyed, songs.map((s) => s.id)))
  }

  return (
    <div className="nd-albumpage">
      <div className="nd-album-head">
        <div className="nd-album-cover">{cover ? <img src={cover} alt="" /> : null}</div>
        <div className="nd-album-info">
          <div className="nd-kicker">Album</div>
          <h1 className="nd-album-name nd-trunc">{record.name}</h1>
          <div className="nd-album-sub">
            {artistId ? (
              <Link to={`/artist/${artistId}/show`}>{albumArtist}</Link>
            ) : (
              <span>{albumArtist}</span>
            )}
            {record.maxYear ? ` · ${record.maxYear}` : ''}
            {` · ${record.songCount || songs.length} songs`}
            {record.duration ? ` · ${fmtTotal(record.duration)}` : ''}
          </div>
          <div className="nd-album-actions">
            <button className="nd-btn" onClick={() => playAlbum(record.id)} type="button" disabled={!songs.length}>
              <Icon name="play" size={18} /> Play
            </button>
            <button className="nd-btn text" onClick={shuffleAll} type="button" disabled={!songs.length}>
              <Icon name="shuffle" size={18} /> Shuffle
            </button>
            <NdLove resource="album" record={record} size={20} />
            <NdStars resource="album" record={record} size={18} />
          </div>
        </div>
      </div>

      <div className="nd-tracks">
        {songs.map((s, i) => (
          <div className="nd-track" key={s.id}>
            <button className="nd-track-main" onClick={() => playSong(s, songs)} type="button">
              <span className="n">{s.trackNumber || i + 1}</span>
              <span className="lines">
                <span className="t nd-trunc">{s.title}</span>
                {isComp ? <span className="a nd-trunc">{s.artist}</span> : null}
              </span>
            </button>
            <span className="acts">
              {resolution(s) ? <span className="nd-res">{resolution(s)}</span> : null}
              <NdLove resource="song" record={s} size={16} />
              <span className="dur">{fmtDur(s.duration)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AlbumPage
