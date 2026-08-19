import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Icon from '../common/Icon'
import PlayerExpanded from './PlayerExpanded'

const fmt = (s) => {
  if (!s || Number.isNaN(s)) return '00:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

// The react-jinke engine renders a single <audio> element (hidden) and adds
// togglePlay/playNext/playPrev to it. The bar reads and drives that element
// directly, so it never depends on mount order. The engine keeps owning audio,
// queue, gapless, media session, scrobble, keepalive and transcoding.
const audioEl = () => (typeof document !== 'undefined' ? document.querySelector('audio') : null)

const PlayerBar = ({ onToggleQueue }) => {
  const playerState = useSelector((s) => s.player)
  const current = playerState?.current || {}
  const queueLen = playerState?.queue?.length || 0
  const [tick, setTick] = useState({ t: 0, d: 0, paused: true, vol: 1 })
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      const au = audioEl()
      if (au) {
        setTick({ t: au.currentTime || 0, d: au.duration || 0, paused: au.paused, vol: au.volume })
      }
    }, 250)
    return () => clearInterval(id)
  }, [])

  if (queueLen === 0) return <div className="nd-player" aria-hidden="true" />

  const title = current.name || current.song?.title || '—'
  const sub = [current.singer || current.song?.artist, current.song?.album].filter(Boolean).join(' — ')
  const pct = tick.d ? (tick.t / tick.d) * 100 : 0
  const volPct = Math.round((tick.vol ?? 1) * 100)

  const seek = (e) => {
    const au = audioEl()
    if (!au || !tick.d) return
    const r = e.currentTarget.getBoundingClientRect()
    au.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * tick.d
  }
  const setVol = (e) => {
    const au = audioEl()
    if (!au) return
    const r = e.currentTarget.getBoundingClientRect()
    au.volume = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))
  }
  const call = (fn) => () => {
    const au = audioEl()
    if (au && typeof au[fn] === 'function') au[fn]()
  }

  return (
    <>
      <footer className="nd-playerbar">
        <div className="nd-pbar" onClick={seek} role="slider" aria-label="Progreso" tabIndex={-1}>
          <div className="nd-pbuf" />
          <div className="nd-pfill" style={{ width: `${pct}%` }} />
        </div>
        <div className="nd-pbody">
          <div className="nd-pnow">
            <button
              className="nd-pcover"
              onClick={() => setExpanded(true)}
              aria-label="Abrir reproductor"
              type="button"
              style={{ padding: 0, cursor: 'pointer', border: 0 }}
            >
              {current.cover ? <img src={current.cover} alt="" /> : null}
            </button>
            <div className="nd-ptxt">
              <div className="t nd-trunc">{title}</div>
              <div className="s nd-trunc">{sub}</div>
            </div>
            <div className="nd-ptime">
              <span className="a">{fmt(tick.t)}</span>
              <span>—</span>
              <span className="b">{fmt(tick.d)}</span>
            </div>
          </div>

          <div className="nd-ptransport">
            <button aria-label="Aleatorio" type="button"><Icon name="shuffle" size={20} /></button>
            <button aria-label="Anterior" onClick={call('playPrev')} type="button"><Icon name="prev" size={20} /></button>
            <button className="main" aria-label={tick.paused ? 'Reproducir' : 'Pausar'} onClick={call('togglePlay')} type="button">
              <Icon name={tick.paused ? 'play' : 'pause'} size={26} />
            </button>
            <button aria-label="Siguiente" onClick={call('playNext')} type="button"><Icon name="next" size={20} /></button>
            <button aria-label="Repetir" type="button"><Icon name="repeat" size={20} /></button>
          </div>

          <div className="nd-pright">
            <div className="nd-pvol">
              <Icon name="volume" size={18} />
              <div className="nd-voltrack" onClick={setVol} role="slider" aria-label="Volumen" tabIndex={-1}>
                <div className="nd-volfill" style={{ width: `${volPct}%` }} />
              </div>
            </div>
            <button className="nd-pqueue" aria-label="Cola de reproducción" onClick={onToggleQueue} type="button">
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
