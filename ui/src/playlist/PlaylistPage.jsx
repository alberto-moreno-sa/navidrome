import React from 'react'
import { useShowController, useGetList } from 'react-admin'
import { useDispatch } from 'react-redux'
import Icon from '../common/Icon'
import { coverUrl, resolution } from '../common/covers'
import { usePlayPlaylist } from '../common/usePlay'
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

// Bespoke playlist detail page (replaces the resource show). Header + a
// clickable tracklist: each track plays within the playlist as the queue.
const PlaylistPage = (props) => {
  const { record } = useShowController(props)
  const dispatch = useDispatch()
  const playPlaylist = usePlayPlaylist()
  const playSong = usePlaySong()

  const { data, ids } = useGetList(
    'playlistTrack',
    { page: 1, perPage: 500 },
    { field: 'id', order: 'ASC' },
    { playlist_id: props.id },
  )
  const tracks = (ids || []).map((id) => data[id]).filter(Boolean)

  if (!record) return null
  const cover = coverUrl(record, 400)

  const shuffleAll = () => {
    if (!tracks.length) return
    const keyed = {}
    tracks.forEach((s) => {
      keyed[s.id] = s
    })
    dispatch(shuffleTracks(keyed, tracks.map((s) => s.id)))
  }

  return (
    <div className="nd-albumpage">
      <div className="nd-album-head">
        <div className="nd-album-cover">{cover ? <img src={cover} alt="" /> : null}</div>
        <div className="nd-album-info">
          <div className="nd-kicker">Playlist</div>
          <h1 className="nd-album-name nd-trunc">{record.name}</h1>
          <div className="nd-album-sub">
            {record.ownerName ? `By ${record.ownerName}` : 'Playlist'}
            {` · ${record.songCount || tracks.length} songs`}
            {record.duration ? ` · ${fmtTotal(record.duration)}` : ''}
          </div>
          {record.comment ? <p className="nd-album-desc">{record.comment}</p> : null}
          <div className="nd-album-actions">
            <button className="nd-btn" onClick={() => playPlaylist(record.id)} type="button" disabled={!tracks.length}>
              <Icon name="play" size={18} /> Play
            </button>
            <button className="nd-btn text" onClick={shuffleAll} type="button" disabled={!tracks.length}>
              <Icon name="shuffle" size={18} /> Shuffle
            </button>
          </div>
        </div>
      </div>

      <div className="nd-tracks">
        {tracks.map((s, i) => (
          <div className="nd-track" key={s.id}>
            <button className="nd-track-main" onClick={() => playSong(s, tracks)} type="button">
              <span className="n">{i + 1}</span>
              <span className="lines">
                <span className="t nd-trunc">{s.title}</span>
                <span className="a nd-trunc">
                  {[s.artist, s.album].filter(Boolean).join(' — ')}
                </span>
              </span>
            </button>
            <span className="acts">
              {resolution(s) ? <span className="nd-res">{resolution(s)}</span> : null}
              <span className="dur">{fmtDur(s.duration)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlaylistPage
