import React, { useEffect, useState } from 'react'
import { useShowController, useDataProvider } from 'react-admin'
import { useDispatch } from 'react-redux'
import subsonic from '../subsonic'
import { playTracks } from '../actions'
import Icon from '../common/Icon'
import NdLove from '../common/NdLove'
import { coverUrl } from '../common/covers'

const fmtDur = (s) => {
  if (!s) return ''
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

const parseArtistInfo = (res) =>
  res?.json?.['subsonic-response']?.artistInfo ||
  res?.json?.['subsonic-response']?.artistInfo2 ||
  null

const parseTopSongs = (res) => {
  const s = res?.json?.['subsonic-response']?.topSongs?.song
  return Array.isArray(s) ? s : s ? [s] : []
}

// Bespoke artist page. Replaces the resource's show view. Header data comes from
// the native record; bio / similar / image from getArtistInfo, top songs from
// getTopSongs. Playback reuses the existing playTracks action.
const ArtistPage = (props) => {
  const { record } = useShowController(props)
  const dispatch = useDispatch()
  const [info, setInfo] = useState(null)
  const [top, setTop] = useState([])

  useEffect(() => {
    let alive = true
    if (props.id) {
      subsonic.getArtistInfo(props.id).then((r) => alive && setInfo(parseArtistInfo(r))).catch(() => {})
    }
    if (record && record.name) {
      subsonic.getTopSongs(record.name).then((r) => alive && setTop(parseTopSongs(r))).catch(() => {})
    }
    return () => {
      alive = false
    }
  }, [props.id, record && record.name])

  if (!record) return null

  const photo = info?.largeImageUrl || info?.mediumImageUrl || coverUrl(record, 300)
  const bio = (info?.biography || '').replace(/<[^>]*>/g, '').trim()
  const similar = Array.isArray(info?.similarArtist)
    ? info.similarArtist
    : info?.similarArtist
      ? [info.similarArtist]
      : []

  const playTop = () => {
    if (!top.length) return
    const keyed = {}
    const ids = []
    top.forEach((s) => {
      keyed[s.id] = s
      ids.push(s.id)
    })
    dispatch(playTracks(keyed, ids))
  }

  return (
    <div className="nd-artist">
      <div className="nd-artist-head">
        <div className="nd-artist-photo">
          {photo ? <img src={photo} alt="" /> : null}
        </div>
        <div className="nd-artist-info">
          <div className="nd-artist-kicker">Artista</div>
          <h1 className="nd-artist-name nd-trunc">{record.name}</h1>
          <div className="nd-artist-stats">
            {(record.albumCount || 0)} álbumes · {(record.songCount || 0)} canciones
          </div>
          {bio ? <p className="nd-artist-bio">{bio}</p> : null}
          <div className="nd-artist-actions">
            <button className="nd-btn" onClick={playTop} type="button" disabled={!top.length}>
              <Icon name="play" size={18} /> Reproducir
            </button>
            <button className="nd-btn text" type="button">Radio del artista</button>
            <NdLove resource="artist" record={record} size={18} label="Seguir" labelOn="Siguiendo" />
            {!info ? <span className="agents">Cargando información externa…</span> : null}
          </div>
        </div>
      </div>

      {top.length ? (
        <section style={{ marginBottom: 40 }}>
          <h2 className="nd-h2">Top canciones</h2>
          {top.slice(0, 10).map((s, i) => (
            <button
              className="nd-topsong"
              key={s.id}
              onClick={() => dispatch(playTracks({ [s.id]: s }, [s.id]))}
              type="button"
            >
              <span className="n">{i + 1}</span>
              <span className="th">
                {coverUrl(s, 80) ? <img src={coverUrl(s, 80)} alt="" loading="lazy" /> : null}
              </span>
              <span className="lines">
                <span className="t nd-trunc" style={{ display: 'block' }}>{s.title}</span>
                <span className="s nd-trunc" style={{ display: 'block', color: 'var(--text-secondary)' }}>
                  {s.album}
                </span>
              </span>
              <span className="dur">{fmtDur(s.duration)}</span>
            </button>
          ))}
        </section>
      ) : null}

      {similar.length ? (
        <section>
          <h2 className="nd-h2">Artistas similares</h2>
          <div className="nd-similars">
            {similar.slice(0, 12).map((a) => (
              <a className="nd-similar" href={`#/artist/${a.id}/show`} key={a.id}>
                <span className="av">
                  {a.largeImageUrl || a.mediumImageUrl ? (
                    <img src={a.largeImageUrl || a.mediumImageUrl} alt="" loading="lazy" />
                  ) : null}
                </span>
                <span className="nm">{a.name}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

export default ArtistPage
