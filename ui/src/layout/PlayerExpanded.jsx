import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import NdLove from '../common/NdLove'
import NdStars from '../common/NdStars'
import { useAudioState } from '../common/useAudioState'
import { useScrub } from '../common/useScrub'
import { usePlayMode } from '../common/usePlayMode'
import { playTracks } from '../actions'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '00:00'
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

const Row = ({ label, value }) =>
  value == null || value === '' ? null : (
    <div className="nd-fs-krow">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )

// Fullscreen "now playing". Reuses the same hidden engine's <audio> element, so
// it never starts or changes playback on its own — it only reflects and drives
// what is already loaded. Description/Credits show the real track metadata.
const PlayerExpanded = ({ onClose }) => {
  const playerState = useSelector((s) => s.player)
  const dispatch = useDispatch()
  const current = playerState?.current || {}
  const queue = playerState?.queue || []
  const { shuffleOn, repeatState, toggleShuffle, cycleRepeat } = usePlayMode()
  const currentUuid = current.uuid
  const [tab, setTab] = useState('desc')
  const [autoplay, setAutoplay] = useState(true)
  const tick = useAudioState()
  const [optimPaused, setOptimPaused] = useState(null)

  useEffect(() => {
    setOptimPaused(null)
  }, [tick.paused])
  useEffect(() => {
    if (optimPaused == null) return undefined
    const id = setTimeout(() => setOptimPaused(null), 600)
    return () => clearTimeout(id)
  }, [optimPaused])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const song = current.song || {}
  const title = current.name || song.title || '—'
  const artistName = current.singer || song.artist
  const artistId = song.artistId || song.albumArtistId
  const albumName = song.album
  const albumId = song.albumId
  const [scrubFrac, onScrubDown] = useScrub((f) => {
    const au = audioEl()
    if (au && au.duration) au.currentTime = f * au.duration
  })
  const posFrac = scrubFrac != null ? scrubFrac : tick.d ? tick.t / tick.d : 0
  const pct = posFrac * 100
  const shownTime = scrubFrac != null ? scrubFrac * tick.d : tick.t
  const paused = optimPaused != null ? optimPaused : tick.paused

  const call = (fn) => () => {
    const au = audioEl()
    if (au && typeof au[fn] === 'function') au[fn]()
  }
  const togglePlay = () => {
    setOptimPaused(!paused)
    const au = audioEl()
    if (au && typeof au.togglePlay === 'function') au.togglePlay()
  }
  const currentIndex = queue.findIndex((t) => t.uuid === currentUuid)

  // Jump to a track in the queue: replay the same queue starting at the clicked
  // item (the sanctioned playTracks path with a start id).
  const jumpTo = (item) => {
    const songs = queue.map((t) => t.song).filter(Boolean)
    const keyed = {}
    const ids = []
    songs.forEach((s) => {
      keyed[s.id] = s
      ids.push(s.id)
    })
    const startId = (item.song && item.song.id) || item.trackId
    if (ids.length) dispatch(playTracks(keyed, ids, startId))
  }

  const khz = song.sampleRate ? `${Math.round((song.sampleRate / 1000) * 10) / 10} kHz` : null
  const channels = song.channels === 1 ? 'Mono' : song.channels === 2 ? 'Stereo' : song.channels ? `${song.channels} channels` : null

  return (
    <div className="nd-fs" role="dialog" aria-label="Player">
      <div className="nd-fs-head">
        <div className="nd-fs-tabs">
          <button className={`nd-fs-tab${tab === 'desc' ? ' on' : ''}`} onClick={() => setTab('desc')} type="button">Description</button>
          <button className={`nd-fs-tab${tab === 'cred' ? ' on' : ''}`} onClick={() => setTab('cred')} type="button">Credits</button>
        </div>
        <button className="nd-circ" aria-label="Collapse" onClick={onClose} type="button"><Icon name="collapse" size={18} /></button>
      </div>
      <div className="nd-fs-main">
        <div className="nd-fs-left">
          <div className="nd-fs-cover">{current.cover ? <img src={current.cover} alt="" /> : null}</div>
          <div className="nd-fs-meta">
            <div className="t nd-trunc">{title}</div>
            <div className="s nd-trunc">
              {artistName ? (
                artistId && !current.isRadio ? (
                  <Link className="nd-plink" to={`/artist/${artistId}/show`} onClick={onClose}>{artistName}</Link>
                ) : (
                  <span>{artistName}</span>
                )
              ) : null}
              {albumName ? (
                <>
                  <span className="nd-pdot"> · </span>
                  {albumId && !current.isRadio ? (
                    <Link className="nd-plink" to={`/album/${albumId}/show`} onClick={onClose}>{albumName}</Link>
                  ) : (
                    <span>{albumName}</span>
                  )}
                </>
              ) : null}
            </div>
          </div>
          {song.id && !current.isRadio ? (
            <div className="nd-fs-actions">
              <NdLove resource="song" record={song} size={20} />
              <NdStars resource="song" record={song} size={18} />
            </div>
          ) : null}
          <div className="nd-fs-prog">
            <div
              className={`nd-fs-bar${scrubFrac != null ? ' scrubbing' : ''}`}
              onMouseDown={onScrubDown}
              role="slider"
              aria-label="Progress"
              tabIndex={-1}
            >
              <div className="nd-fs-fill" style={{ width: `${pct}%` }} />
              <div className="nd-fs-thumb" style={{ left: `${pct}%` }} />
            </div>
            <div className="nd-fs-times"><span>{fmt(shownTime)}</span><span>{fmt(tick.d)}</span></div>
          </div>
          <div className="nd-fs-transport">
            <button className={shuffleOn ? 'on' : ''} aria-label="Shuffle" aria-pressed={shuffleOn} onClick={toggleShuffle} type="button"><Icon name="shuffle" size={22} /></button>
            <button aria-label="Previous" onClick={call('playPrev')} type="button"><Icon name="prev" size={22} /></button>
            <button className="main" aria-label={paused ? 'Play' : 'Pause'} onClick={togglePlay} type="button"><Icon name={paused ? 'play' : 'pause'} size={30} /></button>
            <button aria-label="Next" onClick={call('playNext')} type="button"><Icon name="next" size={22} /></button>
            <button className={repeatState !== 'off' ? 'on' : ''} aria-label={repeatState === 'one' ? 'Repeat one' : repeatState === 'all' ? 'Repeat all' : 'Repeat'} aria-pressed={repeatState !== 'off'} onClick={cycleRepeat} type="button"><Icon name={repeatState === 'one' ? 'repeatOne' : 'repeat'} size={22} /></button>
          </div>
        </div>
        <div className="nd-fs-right">
          {tab === 'cred' ? (
            <>
              <div className="nd-fs-qtitle">Credits and metadata</div>
              <dl className="nd-fs-kv">
                <Row label="Title" value={song.title} />
                <Row label="Artist" value={song.artist} />
                <Row label="Album" value={song.album} />
                <Row label="Album artist" value={song.albumArtist} />
                <Row label="Composer" value={song.composer} />
                <Row label="Year" value={song.year} />
                <Row label="Genre" value={song.genre} />
                <Row label="Track" value={song.trackNumber ? `${song.trackNumber}${song.discNumber ? ` · Disc ${song.discNumber}` : ''}` : null} />
                <Row label="Format" value={song.suffix ? song.suffix.toUpperCase() : null} />
                <Row label="Bit rate" value={song.bitRate ? `${song.bitRate} kbps` : null} />
                <Row label="Sample rate" value={khz} />
                <Row label="Bit depth" value={song.bitDepth ? `${song.bitDepth} bit` : null} />
                <Row label="Channels" value={channels} />
              </dl>
            </>
          ) : (
            <>
              <div className="nd-fs-qtitle">Up next</div>
              <div className="nd-fs-qlist">
                {queue.map((t, i) => {
                  const zone = currentIndex < 0 ? '' : i < currentIndex ? ' done' : i === currentIndex ? ' on' : ''
                  return (
                    <button
                      className={`nd-qrow${zone}`}
                      key={t.uuid || i}
                      onClick={() => jumpTo(t)}
                      type="button"
                    >
                      <span className="th">{t.cover ? <img src={t.cover} alt="" /> : null}</span>
                      <div className="lines">
                        <div className="t nd-trunc">{t.name || t.title}</div>
                        <div className="s nd-trunc">{t.singer || t.artist || ''}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="nd-fs-autoplay">
                <button
                  className={`nd-sw${autoplay ? ' on' : ''}`}
                  role="switch"
                  aria-checked={autoplay}
                  aria-label="Autoplay"
                  onClick={() => setAutoplay((a) => !a)}
                  type="button"
                />
                <span>Autoplay when the queue ends</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlayerExpanded
