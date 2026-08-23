import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHistory, Link } from 'react-router-dom'
import Icon from '../common/Icon'
import NdLove from '../common/NdLove'
import PlayerExpanded from './PlayerExpanded'
import { useAudioState } from '../common/useAudioState'
import { useScrub } from '../common/useScrub'
import { usePlayMode } from '../common/usePlayMode'
import { usePlaybackQuality } from '../common/usePlaybackQuality'
import { useStreamQuality } from '../common/useStreamQuality'
import { QUALITY_OPTIONS } from '../common/streamQuality'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// The react-jinke engine renders a single <audio> element (hidden) and adds
// togglePlay/playNext/playPrev to it. The bar reads and drives that element
// directly, so it never depends on mount order. The engine keeps owning audio,
// queue, gapless, media session, scrobble, keepalive and transcoding. Shuffle
// and repeat are driven through the engine's playMode (redux player.mode).
const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

const PlayerBar = ({ onToggleQueue }) => {
  const playerState = useSelector((s) => s.player)
  const history = useHistory()
  const current = playerState?.current || {}
  const queueLen = playerState?.queue?.length || 0
  const { shuffleOn, repeatState, toggleShuffle, cycleRepeat } = usePlayMode()
  const tick = useAudioState()
  const [expanded, setExpanded] = useState(false)
  const [menu, setMenu] = useState(null) // 'quality' | 'output' | 'kebab' | null
  const [optimPaused, setOptimPaused] = useState(null)
  const menuRef = useRef(null)

  // Drop the optimistic play/pause hint once the engine confirms the real
  // state, with a short safety timeout so a failed play() can't strand the icon.
  useEffect(() => {
    setOptimPaused(null)
  }, [tick.paused])
  useEffect(() => {
    if (optimPaused == null) return undefined
    const id = setTimeout(() => setOptimPaused(null), 600)
    return () => clearTimeout(id)
  }, [optimPaused])

  useEffect(() => {
    if (!menu) return undefined
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(null)
    }
    const onKey = (e) => e.key === 'Escape' && setMenu(null)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menu])

  const [scrubFrac, onScrubDown] = useScrub((f) => {
    const au = audioEl()
    if (au && au.duration) au.currentTime = f * au.duration
  })
  const quality = usePlaybackQuality(
    current.trackId || current.song?.mediaFileId || current.song?.id,
    current.song,
  )
  const [streamQuality, setStreamQuality] = useStreamQuality()

  if (queueLen === 0) return <div className="nd-player" aria-hidden="true" />

  const song = current.song || {}
  const title = current.name || song.title || '—'
  const artistName = current.singer || song.artist
  const artistId = song.artistId || song.albumArtistId
  const albumName = song.album
  const albumId = song.albumId
  const posFrac = scrubFrac != null ? scrubFrac : tick.d ? tick.t / tick.d : 0
  const pct = posFrac * 100
  const shownTime = scrubFrac != null ? scrubFrac * tick.d : tick.t
  const volPct = tick.muted ? 0 : Math.round((tick.vol ?? 1) * 100)
  const paused = optimPaused != null ? optimPaused : tick.paused

  const togglePlay = () => {
    setOptimPaused(!paused) // instant icon flip; cleared by the real event
    const au = audioEl()
    if (au && typeof au.togglePlay === 'function') au.togglePlay()
  }

  const setVol = (e) => {
    const au = audioEl()
    if (!au) return
    const r = e.currentTarget.getBoundingClientRect()
    au.volume = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
    if (au.muted) au.muted = false
  }
  const call = (fn) => () => {
    const au = audioEl()
    if (au && typeof au[fn] === 'function') au[fn]()
  }
  const toggleMute = () => {
    const au = audioEl()
    if (au) au.muted = !au.muted
  }
  const goto = (path) => {
    setMenu(null)
    if (path) history.push(path)
  }

  // The chip shows the actual playback format; amber flags a transcode.
  const chipLabel = quality.transcoded
    ? [quality.playFormat, quality.playDetail].filter(Boolean).join(' ')
    : quality.playFormat

  return (
    <>
      <footer className="nd-playerbar" ref={menuRef}>
        <div
          className={`nd-pbar${scrubFrac != null ? ' scrubbing' : ''}`}
          onMouseDown={onScrubDown}
          role="slider"
          aria-label="Progress"
          tabIndex={-1}
        >
          <div className="nd-pbuf" />
          <div className="nd-pfill" style={{ width: `${pct}%` }} />
          <div className="nd-pthumb" style={{ left: `${pct}%` }} />
        </div>
        <div className="nd-pbody">
          <div className="nd-pnow">
            <button
              className="nd-pcover"
              onClick={() => setExpanded(true)}
              aria-label="Open player"
              type="button"
              style={{ padding: 0, cursor: 'pointer', border: 0 }}
            >
              {current.cover ? <img src={current.cover} alt="" /> : null}
            </button>
            <div className="nd-ptxt">
              <div className="t nd-trunc">{title}</div>
              <div className="s nd-trunc">
                {artistName ? (
                  artistId && !current.isRadio ? (
                    <Link className="nd-plink" to={`/artist/${artistId}/show`}>{artistName}</Link>
                  ) : (
                    <span>{artistName}</span>
                  )
                ) : null}
                {albumName ? (
                  <>
                    <span className="nd-pdot"> · </span>
                    {albumId && !current.isRadio ? (
                      <Link className="nd-plink" to={`/album/${albumId}/show`}>{albumName}</Link>
                    ) : (
                      <span>{albumName}</span>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            {song.id && !current.isRadio ? (
              <NdLove resource="song" record={song} size={18} />
            ) : null}
            <div className="nd-ptime">
              <span className="a">{fmt(shownTime)}</span>
              <span>—</span>
              <span className="b">{fmt(tick.d)}</span>
            </div>
          </div>

          <div className="nd-ptransport">
            <button
              className={shuffleOn ? 'on' : ''}
              aria-label="Shuffle"
              aria-pressed={shuffleOn}
              onClick={toggleShuffle}
              type="button"
            >
              <Icon name="shuffle" size={20} />
            </button>
            <button aria-label="Previous" onClick={call('playPrev')} type="button"><Icon name="prev" size={20} /></button>
            <button className="main" aria-label={paused ? 'Play' : 'Pause'} onClick={togglePlay} type="button">
              <Icon name={paused ? 'play' : 'pause'} size={26} />
            </button>
            <button aria-label="Next" onClick={call('playNext')} type="button"><Icon name="next" size={20} /></button>
            <button
              className={repeatState !== 'off' ? 'on' : ''}
              aria-label={repeatState === 'one' ? 'Repeat one' : repeatState === 'all' ? 'Repeat all' : 'Repeat'}
              aria-pressed={repeatState !== 'off'}
              onClick={cycleRepeat}
              type="button"
            >
              <Icon name={repeatState === 'one' ? 'repeatOne' : 'repeat'} size={20} />
            </button>
          </div>

          <div className="nd-pright">
            <div className="nd-pvol">
              <button className="nd-pvolbtn" aria-label={tick.muted ? 'Unmute' : 'Mute'} aria-pressed={tick.muted} onClick={toggleMute} type="button">
                <Icon name={tick.muted || volPct === 0 ? 'volumeOff' : 'volume'} size={18} />
              </button>
              <div className="nd-voltrack" onClick={setVol} role="slider" aria-label="Volume" tabIndex={-1}>
                <div className="nd-volfill" style={{ width: `${volPct}%` }} />
              </div>
            </div>

            {chipLabel ? (
              <div className="nd-pmenu-anchor">
                <button
                  className={`nd-pqual${menu === 'quality' ? ' on' : ''}${quality.transcoded ? ' transcoded' : ''}`}
                  onClick={() => setMenu(menu === 'quality' ? null : 'quality')}
                  aria-haspopup="menu"
                  aria-expanded={menu === 'quality'}
                  aria-label={quality.transcoded ? 'Audio quality (transcoded)' : 'Audio quality (original)'}
                  type="button"
                >
                  {quality.transcoded ? <Icon name="graphicEq" size={13} /> : null}
                  <span className="nd-res">{chipLabel}</span>
                </button>
                {menu === 'quality' ? (
                  <div className="nd-ppop" role="menu">
                    <div className="nd-ppop-title">Audio quality</div>
                    <dl className="nd-ppop-kv">
                      <dt>Playing</dt>
                      <dd>{[quality.playFormat, quality.playDetail].filter(Boolean).join(' · ') || '—'}</dd>
                      {quality.transcoded ? (
                        <>
                          <dt>Source</dt>
                          <dd>{[quality.sourceFormat, quality.sourceDetail].filter(Boolean).join(' · ') || '—'}</dd>
                        </>
                      ) : null}
                    </dl>
                    <div className={`nd-ppop-note${quality.transcoded ? ' warn' : ''}`}>
                      {quality.transcoded
                        ? `Transcoded${quality.sourceFormat ? ` from ${quality.sourceFormat}` : ''}${quality.reason ? ` — ${quality.reason}` : ''}.`
                        : 'Original file — bit-perfect, no transcoding.'}
                    </div>
                    <div className="nd-ppop-sec">Streaming quality</div>
                    <div className="nd-ppop-opts">
                      {QUALITY_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          className={`nd-ppop-item${streamQuality === o.value ? ' on' : ''}`}
                          role="menuitemradio"
                          aria-checked={streamQuality === o.value}
                          onClick={() => setStreamQuality(o.value)}
                          type="button"
                        >
                          <span className="nd-ppop-check">
                            {streamQuality === o.value ? <Icon name="check" size={15} /> : null}
                          </span>
                          <span className="lbl">{o.label}</span>
                          <span className="hint">{o.hint}</span>
                        </button>
                      ))}
                    </div>
                    <div className="nd-ppop-note">Applies from the next track.</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="nd-pmenu-anchor">
              <button
                className={`nd-pout${menu === 'output' ? ' on' : ''}`}
                onClick={() => setMenu(menu === 'output' ? null : 'output')}
                aria-haspopup="menu"
                aria-expanded={menu === 'output'}
                type="button"
              >
                <Icon name="output" size={18} />
                Default output
              </button>
              {menu === 'output' ? (
                <div className="nd-ppop" role="menu">
                  <div className="nd-ppop-title">Audio output</div>
                  <button className="nd-ppop-item on" role="menuitemradio" aria-checked="true" type="button">
                    <Icon name="output" size={18} />
                    <span>System default output</span>
                    <Icon name="check" size={16} />
                  </button>
                  <div className="nd-ppop-note">The browser plays through the system's output device.</div>
                </div>
              ) : null}
            </div>

            <div className="nd-pmenu-anchor">
              <button
                className={`nd-circ${menu === 'kebab' ? ' on' : ''}`}
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menu === 'kebab'}
                onClick={() => setMenu(menu === 'kebab' ? null : 'kebab')}
                type="button"
              >
                <Icon name="kebab" size={18} />
              </button>
              {menu === 'kebab' ? (
                <div className="nd-ppop" role="menu">
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => goto(song.albumId ? `/album/${song.albumId}/show` : null)} disabled={!song.albumId}>
                    <Icon name="album" size={18} />
                    <span>Go to album</span>
                  </button>
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => goto(song.artistId ? `/artist/${song.artistId}/show` : null)} disabled={!song.artistId}>
                    <Icon name="artist" size={18} />
                    <span>Go to artist</span>
                  </button>
                  <button className="nd-ppop-item" role="menuitem" type="button" onClick={() => { setMenu(null); setExpanded(true) }}>
                    <Icon name="info" size={18} />
                    <span>Information</span>
                  </button>
                </div>
              ) : null}
            </div>

            <button className="nd-pqueue" aria-label="Play queue" onClick={onToggleQueue} type="button">
              <Icon name="queue" size={18} />
              {queueLen > 0 ? <span className="nd-pcount">{queueLen}</span> : null}
            </button>
          </div>
        </div>
      </footer>
      {expanded ? <PlayerExpanded onClose={() => setExpanded(false)} /> : null}
    </>
  )
}

export default PlayerBar
